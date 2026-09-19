package com.goreactive.app;

import android.content.Context;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.media.audiofx.AcousticEchoCanceler;
import android.media.audiofx.NoiseSuppressor;
import android.media.audiofx.AutomaticGainControl;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONArray;
import org.json.JSONObject;
import org.vosk.Model;
import org.vosk.Recognizer;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * VoskService — reconnaissance vocale on-device avec micro CONTINU.
 *
 * Principe : AudioRecord ouvre le micro une seule fois et ne le ferme que quand
 * stop() est appelé explicitement. Vosk traite le PCM en streaming sur un thread
 * dédié. Aucun destroy/recreate entre les phrases → plus de son système on/off,
 * plus de clignotement du voyant micro.
 *
 * Deux modèles sont supportés (fr / en), chargés depuis assets/model-fr et
 * assets/model-en. Le vocabulaire restreint est configuré dynamiquement via
 * setGrammar() pour maximiser la précision sur un petit ensemble de mots.
 */
public class VoskService {

    private static final String TAG = "VoskService";
    private static final int SAMPLE_RATE = 16000;
    // 1024 frames = 64ms par chunk → détection quasi instantanée du début de mot
    private static final int BUFFER_SIZE_FRAMES = 1024;

    private final Context context;
    private final WebView webView;

    private Model modelFr;
    private Model modelEn;
    private Recognizer recognizer;

    private AudioRecord audioRecord;
    private AcousticEchoCanceler echoCanceler;
    private NoiseSuppressor noiseSuppressor;
    private AutomaticGainControl gainControl;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private Future<?> recordingTask;

    // Mode vocabulaire courant
    private String currentGrammar = null;
    private String currentLang = "fr";

    // Anti-doublon : dernier texte partiel émis — on ignore si identique
    private String lastEmittedText = "";
    private long lastEmittedTime = 0;

    // Quand l'IA parle, on reset le recognizer Vosk pour vider le contexte acoustique
    // (mots de l'IA). Le micro reste ouvert en permanence.
    private volatile boolean iaSpeaking = false;
    private volatile boolean wasIaSpeaking = false;

    // Ducking volume : quand l'IA parle, on baisse le haut-parleur à 35% du max
    // pour que le micro ne capte plus assez le son IA et entende principalement
    // la voix de l'utilisateur.
    private android.media.AudioManager audioManager;
    private int originalMusicVolume = -1;
    private static final float DUCK_RATIO = 0.35f; // 35% du volume max pendant parole IA

    // Détection de silence : sert UNIQUEMENT à repérer une courte pause entre
    // deux mots, pour permettre d'enchaîner rapidement "faux"/"non"/"faux" sans
    // attendre que Vosk détecte lui-même une fin de phrase (ce qui peut prendre
    // plus d'une seconde et bloquerait le deuxième mot comme un doublon).
    private static final double SILENCE_RMS_THRESHOLD = 250.0;
    private static final int SILENCE_BUFFERS_TO_RESET = 7; // ~7 x 64ms ≈ 450ms de vrai silence

    // Amplification légère et LISSÉE sur plusieurs secondes — vient en
    // complément d'AutomaticGainControl pour aider une voix faible/éloignée,
    // sans jamais changer brusquement PENDANT un mot (contrairement à
    // l'ancien système, recalculé à chaque tranche de 64ms). Le gain
    // s'ajuste très progressivement au volume moyen de la personne, pas à
    // l'instant présent.
    private static final float SMOOTH_GAIN_MAX = 2.5f;
    private static final float SMOOTH_GAIN_MIN = 1.0f;
    private static final double SMOOTH_TARGET_RMS = 2200.0;
    private static final double SMOOTH_ADAPT_RATE = 0.02; // ~2-3 secondes pour s'ajuster


    public VoskService(Context context, WebView webView) {
        this.context = context;
        this.webView = webView;
    }

    // ── JavaScript bridge ────────────────────────────────────────────────────

    public class JSBridge {

        @JavascriptInterface
        public void start(String lang, String vocabularyMode) {
            Log.i(TAG, "JSBridge.start lang=" + lang + " mode=" + vocabularyMode);
            currentLang = (lang != null && lang.toLowerCase().startsWith("en")) ? "en" : "fr";
            currentGrammar = buildGrammar(vocabularyMode);

            // La permission RECORD_AUDIO est demandée une seule fois au lancement
            // de l'app dans MainActivity.onCreate — pas besoin de la revérifier ici.
            executor.submit(() -> {
                try {
                    startInternal();
                } catch (Exception e) {
                    Log.e(TAG, "start error", e);
                    emitError(e.getMessage());
                }
            });
        }

        // Charge le modèle Vosk en mémoire SANS ouvrir le micro. Appelé le plus
        // tôt possible (dès qu'on connaît la langue) pour que le premier vrai
        // démarrage (calibrage, entraînement) soit instantané au lieu de payer
        // le coût de lecture du modèle depuis le disque à ce moment-là.
        @JavascriptInterface
        public void preload(String lang) {
            String targetLang = (lang != null && lang.toLowerCase().startsWith("en")) ? "en" : "fr";
            executor.submit(() -> {
                try {
                    Log.i(TAG, "JSBridge.preload lang=" + targetLang + " — loading model ahead of time");
                    getOrLoadModel(targetLang);
                    Log.i(TAG, "Preload done for " + targetLang);
                } catch (Exception e) {
                    Log.e(TAG, "preload error", e);
                }
            });
        }

        @JavascriptInterface
        public void stop() {
            Log.i(TAG, "JSBridge.stop");
            stopInternal();
        }

        @JavascriptInterface
        public void setVocabularyMode(String mode) {
            currentGrammar = buildGrammar(mode);
            // Reconfigure le recognizer à la volée si actif
            if (recognizer != null && currentGrammar != null) {
                recognizer.setGrammar(currentGrammar);
            } else if (recognizer != null) {
                // null grammar = modèle complet — on recrée le recognizer
                // (léger, pas de fermeture micro)
                recreateRecognizer();
            }
        }

        @JavascriptInterface
        public boolean isRunning() {
            return running.get();
        }

        @JavascriptInterface
        public void setIASpeaking(boolean speaking) {
            iaSpeaking = speaking;
            if (!speaking && wasIaSpeaking) {
                // L'IA vient de finir — reset du recognizer pour vider son contexte acoustique.
                // On recrée le recognizer sur le thread d'enregistrement (pas ici pour éviter
                // les conflits) via un flag.
                lastEmittedText = "";
                Log.d(TAG, "IA stopped — context cleared");
            }
            wasIaSpeaking = speaking;
            Log.d(TAG, "iaSpeaking=" + speaking);
        }
    }

    // ── Grammaire ────────────────────────────────────────────────────────────
    //
    // On N'utilise PAS de grammaire Vosk fermée.
    //
    // Raison : avec une grammaire restreinte, Vosk force une correspondance
    // phonétique même quand aucun mot ne correspond — ex: "gauche" → "faux",
    // "droite" → "raté". Cela génère de fausses erreurs quand l'IA parle.
    //
    // Solution : transcription libre + filtrage vocabulaire côté JS via
    // vocabularyByMode (déjà en place dans voiceEngine.ts). Vosk transcrit
    // fidèlement, le JS filtre. Plus précis et aucune fausse correspondance.
    //
    // Cette méthode est conservée pour éviter de casser les appels existants.
    private String buildGrammar(String mode) {
        return null; // toujours vocabulaire libre
    }

    // ── Gestion modèle ───────────────────────────────────────────────────────

    private Model getOrLoadModel(String lang) throws IOException {
        if ("en".equals(lang)) {
            if (modelEn == null) modelEn = loadModel("model-en");
            return modelEn;
        } else {
            if (modelFr == null) modelFr = loadModel("model-fr");
            return modelFr;
        }
    }

    /**
     * Vosk nécessite que le modèle soit dans un dossier du système de fichiers,
     * pas directement dans assets. On le copie dans filesDir au premier lancement.
     */
    private Model loadModel(String assetFolder) throws IOException {
        File destDir = new File(context.getFilesDir(), assetFolder);
        if (!destDir.exists() || !new File(destDir, "am/final.mdl").exists()) {
            Log.i(TAG, "Copying model " + assetFolder + " from assets...");
            copyAssetFolder(assetFolder, destDir);
            Log.i(TAG, "Model copy done.");
        }
        Log.i(TAG, "Loading Vosk model from " + destDir.getAbsolutePath());
        return new Model(destDir.getAbsolutePath());
    }

    private void copyAssetFolder(String assetPath, File destDir) throws IOException {
        String[] children = context.getAssets().list(assetPath);
        if (children == null || children.length == 0) {
            // Fichier feuille
            if (!destDir.getParentFile().exists()) destDir.getParentFile().mkdirs();
            try (InputStream in = context.getAssets().open(assetPath);
                 FileOutputStream out = new FileOutputStream(destDir)) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
            }
        } else {
            destDir.mkdirs();
            for (String child : children) {
                copyAssetFolder(assetPath + "/" + child, new File(destDir, child));
            }
        }
    }

    // ── Recognizer ───────────────────────────────────────────────────────────

    private void recreateRecognizer() {
        try {
            Model model = getOrLoadModel(currentLang);
            if (recognizer != null) { try { recognizer.close(); } catch (Exception ignored) {} }
            recognizer = new Recognizer(model, SAMPLE_RATE);
            if (currentGrammar != null) recognizer.setGrammar(currentGrammar);
        } catch (Exception e) {
            Log.e(TAG, "recreateRecognizer error", e);
        }
    }

    // ── AudioRecord loop ─────────────────────────────────────────────────────

    private synchronized void startInternal() throws IOException {
        if (running.get()) {
            Log.w(TAG, "Already running");
            return;
        }

        Model model = getOrLoadModel(currentLang);
        recognizer = new Recognizer(model, SAMPLE_RATE);
        if (currentGrammar != null) recognizer.setGrammar(currentGrammar);
        // Émettre les mots partiels dès qu'une syllabe est reconnue, pas seulement
        // en fin de mot → "er" → "err" → "erreur" arrive bien avant la fin de phrase.
        recognizer.setWords(true);

        int minBuf = AudioRecord.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        );
        int bufSize = Math.max(minBuf, BUFFER_SIZE_FRAMES * 2);

        audioRecord = new AudioRecord(
            // VOICE_COMMUNICATION active l'AGC (Automatic Gain Control) et la
            // suppression de bruit — booste automatiquement les voix faibles
            // et filtre le bruit de fond quand l'utilisateur est loin du micro.
            MediaRecorder.AudioSource.VOICE_COMMUNICATION,
            SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            bufSize
        );

        if (audioRecord.getState() != AudioRecord.STATE_INITIALIZED) {
            throw new IOException("AudioRecord failed to initialize");
        }

        audioRecord.startRecording();

        // ── AcousticEchoCanceler ─────────────────────────────────────────────
        // Supprime le son du haut-parleur (voix IA) capté par le micro en temps
        // réel au niveau du driver Android. L'utilisateur peut parler en même
        // temps que l'IA — seule sa voix arrive à Vosk.
        int audioSessionId = audioRecord.getAudioSessionId();

        if (AcousticEchoCanceler.isAvailable()) {
            echoCanceler = AcousticEchoCanceler.create(audioSessionId);
            if (echoCanceler != null) {
                echoCanceler.setEnabled(true);
                Log.i(TAG, "AcousticEchoCanceler activé ✓");
            }
        } else {
            Log.w(TAG, "AcousticEchoCanceler non disponible sur cet appareil");
        }

        if (NoiseSuppressor.isAvailable()) {
            noiseSuppressor = NoiseSuppressor.create(audioSessionId);
            if (noiseSuppressor != null) {
                noiseSuppressor.setEnabled(true);
                Log.i(TAG, "NoiseSuppressor activé ✓");
            }
        }

        if (AutomaticGainControl.isAvailable()) {
            gainControl = AutomaticGainControl.create(audioSessionId);
            if (gainControl != null) {
                gainControl.setEnabled(true);
                Log.i(TAG, "AutomaticGainControl activé ✓");
            }
        }
        // ────────────────────────────────────────────────────────────────────
        running.set(true);
        lastEmittedText = "";
        lastEmittedTime = 0;
        emitStatus("listening");
        Log.i(TAG, "AudioRecord started — micro ouvert en continu");

        // Boucle de lecture PCM sur thread dédié
        recordingTask = executor.submit(() -> {
            short[] buffer = new short[BUFFER_SIZE_FRAMES];
            boolean prevIaSpeaking = false;
            int consecutiveSilentBuffers = 0;
            double[] smoothedRms = { SMOOTH_TARGET_RMS }; // valeur de départ neutre (gain ×1)

            while (running.get()) {
                int read = audioRecord.read(buffer, 0, buffer.length);
                if (read < 0) {
                    Log.w(TAG, "AudioRecord read error: " + read);
                    break;
                }

                // ── Détection de silence + suivi du volume moyen ───────────────
                double rms = 0;
                for (int i = 0; i < read; i++) rms += (double) buffer[i] * buffer[i];
                rms = Math.sqrt(rms / read);

                // Le RMS brut (instantané) sert à repérer une courte pause
                // (silence) entre deux mots : dès qu'on en détecte une, on
                // réinitialise l'anti-doublon, pour ne jamais bloquer un second
                // "faux"/"non" prononcé juste après le premier — sans attendre
                // que Vosk détecte lui-même une fin de phrase, ce qui peut
                // prendre plus d'une seconde.
                if (rms < SILENCE_RMS_THRESHOLD) {
                    consecutiveSilentBuffers++;
                    if (consecutiveSilentBuffers == SILENCE_BUFFERS_TO_RESET) {
                        lastEmittedText = "";
                    }
                } else {
                    consecutiveSilentBuffers = 0;
                }

                // Le RMS LISSÉ (moyenne mobile sur plusieurs secondes) sert à
                // adapter très progressivement le gain — utile pour une voix
                // faible/éloignée, sans jamais créer de saut de volume à
                // l'intérieur même d'un mot comme l'ancien système.
                smoothedRms[0] = smoothedRms[0] * (1 - SMOOTH_ADAPT_RATE) + rms * SMOOTH_ADAPT_RATE;
                float smoothGain = (float) Math.min(SMOOTH_GAIN_MAX, Math.max(SMOOTH_GAIN_MIN, SMOOTH_TARGET_RMS / Math.max(1.0, smoothedRms[0])));
                if (smoothGain > 1.001f) {
                    for (int i = 0; i < read; i++) {
                        int amplified = (int) (buffer[i] * smoothGain);
                        if (amplified > Short.MAX_VALUE) amplified = Short.MAX_VALUE;
                        if (amplified < Short.MIN_VALUE) amplified = Short.MIN_VALUE;
                        buffer[i] = (short) amplified;
                    }
                }

                // ── Écoute continue pendant la parole IA ─────────────────────
                // Avec écouteurs (obligatoires pour ce mode), la voix de l'IA ne
                // sort jamais dans la pièce — le micro ne capte que l'utilisateur.
                // On ne coupe donc plus l'audio pendant que l'IA parle : ça
                // permettait de "rater" une réaction rapide dite en même temps
                // que l'annonce du stimulus suivant. L'AcousticEchoCanceler
                // déjà actif (voir plus haut) filtre le résidu si jamais la
                // personne utilise un haut-parleur malgré la consigne.

                // ── Gestion fin de parole IA ─────────────────────────────────
                // Quand l'IA vient de finir de parler, on reset quand même le
                // recognizer pour repartir sur un contexte acoustique propre.
                boolean currentIaSpeaking = iaSpeaking;
                if (prevIaSpeaking && !currentIaSpeaking) {
                    // Transition IA parle → IA silencieuse
                    try {
                        recognizer.getResult(); // vider buffer interne
                        recognizer.reset();     // reset du modèle acoustique
                    } catch (Exception ignored) {}
                    lastEmittedText = "";
                    Log.d(TAG, "Recognizer reset after IA speech");
                }
                prevIaSpeaking = currentIaSpeaking;

                // ── Envoi à Vosk ─────────────────────────────────────────────
                if (recognizer.acceptWaveForm(buffer, read)) {
                    recognizer.getResult();
                    lastEmittedText = "";
                } else {
                    String partial = recognizer.getPartialResult();
                    handlePartial(partial);
                }
            }
            Log.i(TAG, "Recording loop exited");
        });
    }

    private synchronized void stopInternal() {
        if (!running.get()) return;
        running.set(false);
        if (echoCanceler != null) { try { echoCanceler.release(); } catch (Exception ignored) {} echoCanceler = null; }
        if (noiseSuppressor != null) { try { noiseSuppressor.release(); } catch (Exception ignored) {} noiseSuppressor = null; }
        if (gainControl != null) { try { gainControl.release(); } catch (Exception ignored) {} gainControl = null; }
        if (audioRecord != null) {
            try { audioRecord.stop(); } catch (Exception ignored) {}
            try { audioRecord.release(); } catch (Exception ignored) {}
            audioRecord = null;
        }
        emitStatus("idle");
        Log.i(TAG, "VoskService stopped — micro fermé");
    }

    // ── Traitement résultats ─────────────────────────────────────────────────

    private void handlePartial(String json) {
        if (json == null || json.isEmpty()) return;
        try {
            JSONObject obj = new JSONObject(json);
            String text = obj.optString("partial", "").trim();
            if (text.isEmpty() || text.equals("[unk]")) return;

            // N'émettre que si le texte partiel a changé depuis le dernier envoi.
            // Vosk répète le même partiel tant que l'utilisateur ne parle pas →
            // on évite ainsi les doublons sans cooldown artificiel.
            if (text.equals(lastEmittedText)) return;

            lastEmittedText = text;
            lastEmittedTime = System.currentTimeMillis();

            // Extraire le dernier mot (Vosk accumule "er erreu erreur" → on veut "erreur")
            String[] words = text.split("\\s+");
            String lastWord = words[words.length - 1];
            emitTranscript(lastWord, false);

        } catch (Exception e) {
            Log.w(TAG, "handlePartial parse error: " + json);
        }
    }

    // ── Émission JS ──────────────────────────────────────────────────────────

    private void emitTranscript(String text, boolean isFinal) {
        String escaped = text.replace("'", "\\'").replace("\"", "\\\"");
        String js = "window.__voskTranscript && window.__voskTranscript('" + escaped + "', " + isFinal + ")";
        runJs(js);
    }

    private void emitStatus(String status) {
        String js = "window.__voskStatus && window.__voskStatus('" + status + "')";
        runJs(js);
    }

    private void emitError(String msg) {
        String escaped = (msg != null ? msg : "unknown").replace("'", "\\'");
        String js = "window.__voskError && window.__voskError('" + escaped + "')";
        runJs(js);
    }

    private void runJs(String js) {
        if (webView != null) {
            webView.post(() -> webView.evaluateJavascript(js, null));
        }
    }
}
