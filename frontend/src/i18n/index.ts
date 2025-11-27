import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Basic resources for immediate functionality
const resources = {
  en: {
    translation: {
      welcome: 'Welcome',
      hello: 'Hello',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    }
  },
  es: {
    translation: {
      welcome: 'Bienvenido',
      hello: 'Hola',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
    }
  },
  fr: {
    translation: {
      welcome: 'Bienvenue',
      hello: 'Bonjour',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
    }
  },
  de: {
    translation: {
      welcome: 'Willkommen',
      hello: 'Hallo',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'echo-language',
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
