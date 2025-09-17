# Configuration Google Sign-In pour Wizeco App

## 📋 Configuration actuelle

### ✅ Déjà configuré

- ✅ Plugin Expo ajouté dans `app.json`
- ✅ Package `@react-native-google-signin/google-signin` installé
- ✅ GoogleAuthService mis à jour selon la documentation
- ✅ Configuration des clés client dans `config/google.ts`

### 🔧 Configuration requise

## 1. Configuration Android

### Étape 1: Obtenir les empreintes SHA-1

#### Pour le développement (Debug)

```bash
# Obtenir l'empreinte SHA-1 du keystore de debug
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### Pour EAS Build (Production)

```bash
# Obtenir les informations de credentials EAS
eas credentials
```

### Étape 2: Configurer Google Cloud Console

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionner le projet Wizeco
3. Aller dans "APIs & Services" > "Credentials"
4. Créer un "OAuth 2.0 Client ID" de type **Android**
5. Ajouter les empreintes SHA-1 obtenues à l'étape 1
6. Package name: `com.evixgroup.wizeco`

### Étape 3: Vérifier la configuration

Les OAuth Client IDs Android doivent être créés avec :

- **Package name**: `com.evixgroup.wizeco`
- **SHA-1 fingerprints**: Toutes les empreintes (debug + production)

## 2. Configuration iOS

### Étape 1: Vérifier la configuration actuelle

Dans `app.json`, nous avons :

```json
{
  "iosUrlScheme": "com.googleusercontent.apps.647553138923-treeu2mmrlfcn9s717r3visdvdu1crmb"
}
```

### Étape 2: Configurer Google Cloud Console

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionner le projet Wizeco
3. Aller dans "APIs & Services" > "Credentials"
4. Vérifier qu'il existe un "OAuth 2.0 Client ID" de type **iOS**
5. Bundle ID: `com.evixgroup.wizeco`
6. URL scheme: `com.googleusercontent.apps.647553138923-treeu2mmrlfcn9s717r3visdvdu1crmb`

## 3. Configuration Web

### Étape 1: Vérifier le Web Client ID

Le Web Client ID actuel est :

```
647553138923-nv59klfd73mkpnc89ct58ru8n7qir1g6.apps.googleusercontent.com
```

### Étape 2: Configurer les domaines autorisés

Dans Google Cloud Console :

1. Aller dans "APIs & Services" > "Credentials"
2. Sélectionner le Web Client ID
3. Ajouter les domaines autorisés :
   - `localhost:3000` (pour le développement)
   - `wizeco.app` (pour la production)

## 4. Build et Test

### Étape 1: Prebuild

```bash
npx expo prebuild --clean
```

### Étape 2: Build Android

```bash
npx expo run:android
```

### Étape 3: Build iOS

```bash
npx expo run:ios
```

## 5. Vérification des erreurs communes

### DEVELOPER_ERROR

- Vérifier que les empreintes SHA-1 sont correctes
- Vérifier que le package name correspond
- Utiliser le Configuration Doctor si nécessaire

### PLAY_SERVICES_NOT_AVAILABLE

- Mettre à jour Google Play Services sur l'appareil
- Vérifier que l'appareil supporte Google Play Services

### SIGN_IN_CANCELLED

- L'utilisateur a annulé la connexion (normal)

## 6. Configuration Doctor (Optionnel)

Si vous rencontrez des erreurs, utilisez l'outil de diagnostic :

```bash
# Avec un appareil connecté
npx @react-native-google-signin/config-doctor --package-name com.evixgroup.wizeco

# Avec un fichier APK
npx @react-native-google-signin/config-doctor --apk-path ./app-release.apk
```

## 7. URLs de configuration

### Google Cloud Console

- **Projet**: Wizeco
- **APIs & Services**: https://console.cloud.google.com/apis/credentials
- **OAuth consent screen**: https://console.cloud.google.com/apis/credentials/consent

### Clés client actuelles

- **Web Client ID**: `647553138923-nv59klfd73mkpnc89ct58ru8n7qir1g6.apps.googleusercontent.com`
- **iOS Client ID**: `647553138923-treeu2mmrlfcn9s717r3visdvdu1crmb.apps.googleusercontent.com`
- **Android Client ID**: `647553138923-4141s2u15eplaefnrmkcalm0fd7rd2cg.apps.googleusercontent.com`

## 8. Prochaines étapes

1. ✅ Configurer les empreintes SHA-1 dans Google Cloud Console
2. ✅ Vérifier la configuration iOS
3. ✅ Tester la connexion sur Android
4. ✅ Tester la connexion sur iOS
5. ✅ Tester la connexion sur Web

## 9. Support

En cas de problème :

1. Vérifier les logs dans la console
2. Utiliser le Configuration Doctor
3. Consulter la documentation : `google-signin-documentation.txt`
4. Vérifier la configuration dans Google Cloud Console
