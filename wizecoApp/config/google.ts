// Configuration Google OAuth
// Remplacez par vos vrais Client IDs de Google Cloud Console

export const GOOGLE_CONFIG = {
  // Client ID Web (obligatoire)
  webClientId:
    "647553138923-nv59klfd73mkpnc89ct58ru8n7qir1g6.apps.googleusercontent.com",

  // Client ID iOS (optionnel, pour les builds iOS)
  iosClientId:
    "647553138923-treeu2mmrlfcn9s717r3visdvdu1crmb.apps.googleusercontent.com",

  // Client ID Android (optionnel, pour les builds Android)
  androidClientId:
    "647553138923-4141s2u15eplaefnrmkcalm0fd7rd2cg.apps.googleusercontent.com",
};

// Instructions pour obtenir les Client IDs :
// 1. Allez sur https://console.cloud.google.com/
// 2. Créez un nouveau projet ou sélectionnez un projet existant
// 3. Activez l'API Google+ (ou Google Identity)
// 4. Allez dans "Identifiants" > "Créer des identifiants" > "ID client OAuth"
// 5. Sélectionnez "Application Web" et ajoutez les URI de redirection :
//    - Pour le développement : https://auth.expo.io/@evix-group/wizeco
//    - Pour la production : https://auth.expo.io/@evix-group/wizeco
// 6. Copiez le Client ID et remplacez les valeurs ci-dessus
