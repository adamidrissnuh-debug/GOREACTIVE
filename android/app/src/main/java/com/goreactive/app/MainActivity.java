package com.goreactive.app;

import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.util.Log;
import android.media.AudioManager;
import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "GoReactive";
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private AudioManager audioManager;
    private int previousSystemVolume = -1;
    private int previousNotificationVolume = -1;
    private boolean recognizerCuesMuted = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        enableImmersiveFullscreen();
        audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);

        // Demander la permission micro une seule fois au lancement de l'app.
        // Aucune interruption possible ensuite — ni pendant l'entraînement,
        // ni pendant le choix du mode d'erreur.
        requestMicrophonePermissionIfNeeded();

        setupNativeTTSBridge();
        setupNativeAudioBridge();
        setupVoskBridge();
    }

    private void requestMicrophonePermissionIfNeeded() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            Log.i(TAG, "Requesting RECORD_AUDIO at app launch");
            ActivityCompat.requestPermissions(
                this,
                new String[]{ Manifest.permission.RECORD_AUDIO },
                1001
            );
        } else {
            Log.i(TAG, "RECORD_AUDIO already granted");
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        enableImmersiveFullscreen();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enableImmersiveFullscreen();
    }

    @Override
    public void onDestroy() {
        restoreRecognizerCueVolume();
        if (voskServiceInstance != null) {
            voskServiceInstance.new JSBridge().stop();
        }
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }

    private void setupNativeTTSBridge() {
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                ttsReady = true;
                tts.setLanguage(Locale.FRANCE);
                tts.setSpeechRate(1.35f);
            }
        });

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.getSettings().setJavaScriptEnabled(true);
            webView.addJavascriptInterface(new GoReactiveTTSBridge(), "GoReactiveTTS");
            Log.i(TAG, "GoReactiveTTS JavaScript interface registered");
        }
    }


    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 1001) {
            if (grantResults.length > 0 && grantResults[0] == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                Log.i(TAG, "RECORD_AUDIO granted by user — emitting permission-granted to JS");
                getBridge().getWebView().post(() ->
                    getBridge().getWebView().evaluateJavascript(
                        "window.__voskStatus && window.__voskStatus('permission-granted')", null
                    )
                );
            } else {
                Log.w(TAG, "RECORD_AUDIO denied by user");
                getBridge().getWebView().post(() ->
                    getBridge().getWebView().evaluateJavascript(
                        "window.__voskError && window.__voskError('permission-denied')", null
                    )
                );
            }
        }
    }

    private void setupVoskBridge() {
        // On enregistre le bridge via registerPlugin pour que Capacitor
        // le rende disponible dès que la WebView est prête, pas avant.
        // Utilisation de getBridge().getWebView() retardée via registerOnPageStarted.
        getBridge().getWebView().addJavascriptInterface(
            new VoskBridgeStub(), "GoReactiveVosk"
        );
        Log.i(TAG, "GoReactiveVosk registered — service inits on first call");
    }

    // Stub minimal enregistré immédiatement — le vrai service est initialisé
    // dans onPageStarted une fois la WebView prête.
    private VoskService voskServiceInstance = null;

    public class VoskBridgeStub {
        @JavascriptInterface
        public void start(String lang, String mode) {
            if (voskServiceInstance == null) initVoskService();
            voskServiceInstance.new JSBridge().start(lang, mode);
        }
        @JavascriptInterface
        public void stop() {
            if (voskServiceInstance != null)
                voskServiceInstance.new JSBridge().stop();
        }
        @JavascriptInterface
        public void setVocabularyMode(String mode) {
            if (voskServiceInstance == null) initVoskService();
            voskServiceInstance.new JSBridge().setVocabularyMode(mode);
        }
        @JavascriptInterface
        public boolean isRunning() {
            return voskServiceInstance != null && voskServiceInstance.new JSBridge().isRunning();
        }
    }

    private synchronized void initVoskService() {
        if (voskServiceInstance != null) return;
        WebView webView = getBridge().getWebView();
        voskServiceInstance = new VoskService(this, webView);
        Log.i(TAG, "VoskService initialized");
    }

    private void setupNativeAudioBridge() {
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.getSettings().setJavaScriptEnabled(true);
            webView.addJavascriptInterface(new GoReactiveAudioBridge(), "GoReactiveAudio");
            Log.i(TAG, "GoReactiveAudio JavaScript interface registered");
        }
    }

    private void muteRecognizerCueVolume() {
        if (audioManager == null || recognizerCuesMuted) return;
        try {
            previousSystemVolume = audioManager.getStreamVolume(AudioManager.STREAM_SYSTEM);
            previousNotificationVolume = audioManager.getStreamVolume(AudioManager.STREAM_NOTIFICATION);
            audioManager.setStreamVolume(AudioManager.STREAM_SYSTEM, 0, 0);
            audioManager.setStreamVolume(AudioManager.STREAM_NOTIFICATION, 0, 0);
            recognizerCuesMuted = true;
            Log.i(TAG, "Recognizer cue volumes muted");
        } catch (Exception e) {
            Log.w(TAG, "Unable to mute recognizer cue volumes", e);
        }
    }

    private void restoreRecognizerCueVolume() {
        if (audioManager == null || !recognizerCuesMuted) return;
        try {
            if (previousSystemVolume >= 0) {
                audioManager.setStreamVolume(AudioManager.STREAM_SYSTEM, previousSystemVolume, 0);
            }
            if (previousNotificationVolume >= 0) {
                audioManager.setStreamVolume(AudioManager.STREAM_NOTIFICATION, previousNotificationVolume, 0);
            }
            Log.i(TAG, "Recognizer cue volumes restored");
        } catch (Exception e) {
            Log.w(TAG, "Unable to restore recognizer cue volumes", e);
        } finally {
            recognizerCuesMuted = false;
            previousSystemVolume = -1;
            previousNotificationVolume = -1;
        }
    }

    public class GoReactiveAudioBridge {
        @JavascriptInterface
        public void muteRecognizerCues(boolean muted) {
            runOnUiThread(() -> {
                if (muted) {
                    muteRecognizerCueVolume();
                } else {
                    restoreRecognizerCueVolume();
                }
            });
        }
    }

    public class GoReactiveTTSBridge {
        @JavascriptInterface
        public void speak(String text, String language, float rate) {
            if (text == null || tts == null || !ttsReady) return;
            runOnUiThread(() -> {
                if (language != null && language.toLowerCase().startsWith("en")) {
                    tts.setLanguage(Locale.US);
                } else {
                    tts.setLanguage(Locale.FRANCE);
                }
                float safeRate = Math.max(0.75f, Math.min(rate, 2.0f));
                tts.setSpeechRate(safeRate);
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "goreactive-tts");
            });
        }

        @JavascriptInterface
        public void cancel() {
            if (tts == null) return;
            runOnUiThread(() -> tts.stop());
        }
    }

    private void enableImmersiveFullscreen() {
        Window window = getWindow();
        window.setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS |
            WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS
        );
        window.setStatusBarColor(android.graphics.Color.TRANSPARENT);
        window.setNavigationBarColor(android.graphics.Color.BLACK);

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attributes = window.getAttributes();
            attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(attributes);
        }

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false);
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );
            }
        } else {
            View decorView = window.getDecorView();
            decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
                View.SYSTEM_UI_FLAG_FULLSCREEN |
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            );
        }
    }
}
