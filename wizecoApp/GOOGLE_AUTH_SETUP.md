# Configuration Google Sign-In pour WizEco

## Étapes de configuration

### 1. Créer un projet Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Notez l'ID du projet : wizecoapp

### 2. Activer les APIs nécessaires

1. Dans la console Google Cloud, allez dans "APIs et services" > "Bibliothèque"
2. Recherchez et activez :
   - **Google+ API** (ou **Google Identity**)
   - **Google OAuth2 API**

### 3. Configurer l'écran de consentement OAuth

1. Allez dans "APIs et services" > "Écran de consentement OAuth"
2. Sélectionnez "Externe" (pour les tests) ou "Interne" (pour les organisations)
3. Remplissez les informations requises :
   - Nom de l'application : "WizEco"
   - Adresse e-mail de support : votre email
   - Domaine autorisé : `evix-group.com` (si applicable)
4. Ajoutez les scopes :
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

### 4. Créer les identifiants OAuth 2.0

#### Pour l'application Web (obligatoire)

1. Allez dans "APIs et services" > "Identifiants"
2. Cliquez sur "Créer des identifiants" > "ID client OAuth"
3. Sélectionnez "Application Web"
4. Nom : "WizEco Web Client"
5. URI de redirection autorisées :
   ```
   https://auth.expo.io/@evix-group/wizeco
   ```
6. Cliquez sur "Créer"
7. **Copiez le Client ID** (vous en aurez besoin)

#### Pour iOS (optionnel)

1. Créez un autre ID client OAuth
2. Sélectionnez "iOS"
3. Nom : "WizEco iOS"
4. ID du bundle : `com.evixgroup.wizeco`
5. **Copiez le Client ID**

#### Pour Android (optionnel)

1. Créez un autre ID client OAuth
2. Sélectionnez "Android"
3. Nom : "WizEco Android"
4. Nom du package : `com.evixgroup.wizeco`
5. Empreinte SHA-1 : `A7:63:F1:2D:48:D0:B5:97:B4:71:B2:51:FD:FC:B5:FB:DC:8B:5C:EA`
6. **Copiez le Client ID**

### 5. Configurer l'application

1. Ouvrez le fichier `config/google.ts`
2. Remplacez les valeurs par vos vrais Client IDs :

```typescript
export const GOOGLE_CONFIG = {
  webClientId: "votre_web_client_id.apps.googleusercontent.com",
  iosClientId: "votre_ios_client_id.apps.googleusercontent.com",
  androidClientId: "votre_android_client_id.apps.googleusercontent.com",
};
```

### 6. Tester la configuration

1. Redémarrez l'application Expo
2. Allez sur la page Profil
3. Cliquez sur "Se connecter avec Google"
4. Vous devriez voir le flux d'authentification Google

## Dépannage

### Erreur "Invalid client"

- Vérifiez que le Client ID est correct
- Assurez-vous que l'URI de redirection correspond exactement

### Erreur "Access blocked"

- Vérifiez l'écran de consentement OAuth
- Assurez-vous que les scopes sont correctement configurés

### L'authentification ne fonctionne pas

- Vérifiez que les APIs sont activées
- Assurez-vous que le projet Google Cloud est correctement configuré

## Production

Pour la production, vous devrez :

1. Configurer l'écran de consentement OAuth en mode "Production"
2. Ajouter les vraies URIs de redirection de production
3. Configurer les Client IDs pour iOS et Android avec les vrais certificats
