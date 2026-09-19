export const normalizeSpeech = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim();

export function matchMovementCommand(transcript: string, language: "fr" | "en") {
  const normalized = normalizeSpeech(transcript);
  const words = normalized.split(/\s+/);
  // Vosk segmente parfois un mot en plusieurs tokens ("non" → "n ont").
  // On teste donc aussi le transcript complet sans espaces pour attraper ces cas.
  const compact = normalized.replace(/\s+/g, '');

  const aliasesFR: Record<string, string[]> = {
    faux: ["faux", "fausse", "fausses", "faut", "faute", "fautes", "faus", "fau",
           "fo", "foe", "faw"],
    non:  ["non", "nan", "nom", "none",
           // variantes segmentées par Vosk ("non" → "n ont")
           "nont", "nons",
           // confusions phonétiques proches
           "bon", "bons", "mont", "mon"],
    fin:  ["fin", "faim", "frein", "faine", "fain", "fein", "fing", "faing",
           "arrêt", "arret", "arrêter", "arreter", "terminer"]
  };

  const aliasesEN: Record<string, string[]> = {
    no:    ["no", "nope", "nah", "non", "nan"],
    false: ["false", "fault", "faux", "wrong", "rong"],
    finish: ["finish", "end", "quit", "stop"]
  };

  const aliases = language === "en" ? aliasesEN : aliasesFR;

  for (const [command, variants] of Object.entries(aliases)) {
    // Test mot par mot
    if (words.some(word => variants.includes(word))) return command;
    // Test sur le transcript compacté (ex: "n ont" → "nont")
    if (variants.includes(compact)) return command;
    // Test sur le transcript normalisé complet (ex: "n ont" contient "non" ?)
    if (variants.some(v => normalized.replace(/\s+/g, '') === v)) return command;
  }

  return null;
}
