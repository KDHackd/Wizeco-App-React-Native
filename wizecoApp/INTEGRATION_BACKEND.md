# 🔗 Intégration Backend - WizEco App

## 📋 Configuration requise

### 1. **URL du Backend**

Modifiez le fichier `config/api.ts` pour pointer vers votre backend :

```typescript
export const API_CONFIG = {
  // Remplacez par l'URL de votre backend
  BASE_URL: "https://votre-backend.com/api/partner/v1",

  // Ou pour le développement local
  // BASE_URL: "http://localhost:3000/api/partner/v1",

  TIMEOUT: 10000,
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
};
```

### 2. **Variables d'environnement Backend**

Assurez-vous que votre backend a ces variables :

- `JWT_SECRET_PARTNER` : Secret pour signer les JWT
- `KV_REST_API_URL` : URL Redis (Upstash)
- `KV_REST_API_TOKEN` : Token Redis (Upstash)

## 🔄 Flux d'authentification

### **Connexion Google :**

1. **App Mobile** → Connexion Google (récupère accessToken)
2. **App Mobile** → Envoie à `/api/partner/v1/account/login`
3. **Backend** → Vérifie le token Google
4. **Backend** → Crée l'utilisateur s'il n'existe pas
5. **Backend** → Retourne JWT token
6. **App Mobile** → Stocke le JWT pour les futures requêtes

### **Déconnexion :**

1. **App Mobile** → Supprime le JWT local
2. **App Mobile** → Déconnexion Google
3. **Backend** → Token JWT devient invalide (expiration)

## 🧪 Test de l'intégration

### **1. Test de connexion :**

```bash
# Dans les logs de l'app, vous devriez voir :
🔐 Début de la connexion Google...
✅ Connexion Google réussie: user@example.com
🌐 Connexion avec le backend...
✅ Connexion backend réussie
```

### **2. Test de déconnexion :**

```bash
# Dans les logs de l'app, vous devriez voir :
✅ Déconnexion backend réussie
✅ Utilisateur supprimé
```

## 🚨 Gestion d'erreurs

L'app est conçue pour fonctionner même si le backend est indisponible :

- **Connexion Google réussie** + **Backend indisponible** = Auth locale uniquement
- **Déconnexion** = Suppression locale + tentative backend

## 📱 Utilisation dans l'app

### **Vérifier l'authentification :**

```typescript
import ApiService from "@/services/ApiService";

const isAuthenticated = await ApiService.isAuthenticated();
```

### **Faire une requête authentifiée :**

```typescript
const response = await ApiService.authenticatedRequest("/some-endpoint", {
  method: "GET",
});
```

## 🔧 Dépannage

### **Problème : "Aucun accessToken Google disponible"**

- Vérifiez la configuration Google Sign-In
- Assurez-vous que `offlineAccess: false` dans GoogleSignin.configure()

### **Problème : "Erreur backend"**

- Vérifiez l'URL dans `config/api.ts`
- Vérifiez que le backend est accessible
- Vérifiez les logs du backend

### **Problème : "Token JWT invalide"**

- Vérifiez `JWT_SECRET_PARTNER` sur le backend
- Vérifiez l'expiration du token (60 jours par défaut)

## 📝 Notes importantes

- Le JWT est stocké localement avec AsyncStorage
- L'app fonctionne en mode dégradé si le backend est indisponible
- Les tokens Google sont utilisés uniquement pour l'authentification initiale
- Le JWT backend est utilisé pour toutes les requêtes authentifiées
