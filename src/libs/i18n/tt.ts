// Embedded translations - developers add their keys here
const translations: Record<string, Record<string, string>> = {
  en: {
    // Shell
    'SM.SHELL.INITIALIZING': 'Initializing...',

    // Outbound Manager
    'SM.OUTBOUND.TITLE': 'Outbound Manager',
    'SM.OUTBOUND.LOADING': 'Loading campaigns...',
    'SM.OUTBOUND.NO_CAMPAIGNS': 'No campaigns available',
    'SM.OUTBOUND.CAMPAIGN.STATUS': 'Status',
    'SM.OUTBOUND.CAMPAIGN.DIALED': 'Dialed',
    'SM.OUTBOUND.CAMPAIGN.CONNECTED': 'Connected',
    'SM.OUTBOUND.CAMPAIGN.START': 'Start Campaign',
    'SM.OUTBOUND.CAMPAIGN.PAUSE': 'Pause Campaign',
    'SM.OUTBOUND.CAMPAIGN.SELECTED': 'Selected: {{name}}', // Example with interpolation
  },
  it: {
    'SM.SHELL.INITIALIZING': 'Inizializzazione...',

    'SM.OUTBOUND.TITLE': 'Gestione Outbound',
    'SM.OUTBOUND.LOADING': 'Caricamento campagne...',
    'SM.OUTBOUND.NO_CAMPAIGNS': 'Nessuna campagna disponibile',
    'SM.OUTBOUND.CAMPAIGN.STATUS': 'Stato',
    'SM.OUTBOUND.CAMPAIGN.DIALED': 'Chiamate',
    'SM.OUTBOUND.CAMPAIGN.CONNECTED': 'Connesse',
    'SM.OUTBOUND.CAMPAIGN.START': 'Avvia Campagna',
    'SM.OUTBOUND.CAMPAIGN.PAUSE': 'Pausa Campagna',
    'SM.OUTBOUND.CAMPAIGN.SELECTED': 'Selezionata: {{name}}', // Example with interpolation
  },
};

// Current language (defaults to English)
let currentLang = 'en';

/**
 * Translate a key to the current language with optional mustache interpolation
 *
 * @param key Translation key (e.g., 'SM.OUTBOUND.TITLE')
 * @param opts Optional variables for {{mustache}} interpolation (e.g., { name: 'John', count: '5' })
 * @returns Translated string or key if not found
 *
 * @example
 * // Simple translation
 * tt('SM.OUTBOUND.TITLE')
 * // Returns: "Outbound Manager"
 *
 * @example
 * // Translation with interpolation
 * tt('SM.OUTBOUND.WELCOME', { name: 'John' })
 * // If template is "Welcome {{name}}"
 * // Returns: "Welcome John"
 */
export function tt(key: string, opts?: Record<string, string>): string {
  const template = translations[currentLang]?.[key] || key;

  // If no variables provided, return template as-is
  if (!opts) {
    return template;
  }

  // Mustache interpolation: replace {{varname}} with opts.varname
  return template.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
    return opts[varName] || '';
  });
}

/**
 * Change the current language
 *
 * @param lang Language code ('en', 'it', etc.)
 */
export function setLanguage(lang: string): void {
  if (translations[lang]) {
    currentLang = lang;
  }
}

/**
 * Get the current language code
 */
export function getCurrentLanguage(): string {
  return currentLang;
}

/**
 * Get all available language codes
 */
export function getAvailableLanguages(): string[] {
  return Object.keys(translations);
}
