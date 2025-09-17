// Configuration Google OAuth
// Remplacez par vos vrais Client IDs de Google Cloud Console

export const GOOGLE_CONFIG = {
  // Client ID Web (obligatoire)
  webClientId: process.env.WEBCLIENTID,

  // Client Secret Web (obligatoire pour l'échange de token)
  // ⚠️ REMPLACEZ par votre vrai client_secret depuis Google Cloud Console
  webClientSecret: process.env.WEBCLIENTSECRET,

  // Client ID iOS (optionnel, pour les builds iOS)
  iosClientId: process.env.IOSCLIENTID,

  // Client ID Android (optionnel, pour les builds Android)
  androidClientId: process.env.ANDROIDCLIENTID,
};

// Instructions pour obtenir les Client IDs et Client Secret :
// 1. Allez sur https://console.cloud.google.com/
// 2. Créez un nouveau projet ou sélectionnez un projet existant
// 3. Activez l'API Google+ (ou Google Identity)
// 4. Allez dans "Identifiants" > "Créer des identifiants" > "ID client OAuth"
// 5. Sélectionnez "Application Web" et ajoutez les URI de redirection :
//    - Pour le développement : http://localhost:8081/auth
//    - Pour la production : https://your-domain.com/auth
// 6. Copiez le Client ID et Client Secret
// 7. Remplacez les valeurs ci-dessus :
//    - webClientId : Votre Client ID Web
//    - webClientSecret : Votre Client Secret Web (commence par GOCSPX-)
//    - androidClientId : Votre Client ID Android (optionnel)
//    - iosClientId : Votre Client ID iOS (optionnel)
