// Configuration de l'API backend
export const API_CONFIG = {
  // URL pour l'API publique (catalogues, promos, haltes)
  // PUBLIC_BASE_URL: "http://192.168.100.95:3000/api/public/v1",
  // PUBLIC_BASE_URL: "http://localhost:3000/api/public/v1",
  PUBLIC_BASE_URL:
    "https://wizeco-cloud-function-a9jv.vercel.app/api/public/v1",

  // URL pour l'API partenaire (connexion, création de compte)
  // PARTNER_BASE_URL: "http://192.168.100.95:3000/api/partner/v1",
  // PARTNER_BASE_URL: "http://localhost:3000/api/partner/v1",
  PARTNER_BASE_URL:
    "https://wizeco-cloud-function-a9jv.vercel.app/api/partner/v1",

  // Ou pour le développement local (si vous testez en local)
  // PUBLIC_BASE_URL: "http://localhost:3000/api/public/v1",
  // PARTNER_BASE_URL: "http://localhost:3000/api/partner/v1",
  // PARTNER_BASE_URL: "http://localhost:3000/api/partner/v1",

  // Timeout pour les requêtes (en millisecondes)
  TIMEOUT: 10000,

  // Headers par défaut
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
};

// Fonction pour obtenir l'URL complète d'un endpoint public
export const getPublicApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.PUBLIC_BASE_URL}${endpoint}`;
};

// Fonction pour obtenir l'URL complète d'un endpoint partenaire
export const getPartnerApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.PARTNER_BASE_URL}${endpoint}`;
};

// Fonction de compatibilité (utilise l'API publique par défaut)
export const getApiUrl = (endpoint: string): string => {
  return getPublicApiUrl(endpoint);
};
