#!/bin/bash

# Script pour obtenir les empreintes SHA-1 pour Google Sign-In
# Usage: ./scripts/get-sha1.sh

echo "🔍 Récupération des empreintes SHA-1 pour Google Sign-In"
echo "=================================================="

# Vérifier si keytool est disponible
if ! command -v keytool &> /dev/null; then
    echo "❌ keytool n'est pas trouvé. Assurez-vous que Java JDK est installé."
    exit 1
fi

echo ""
echo "📱 1. Empreinte SHA-1 du keystore de debug (développement):"
echo "------------------------------------------------------------"

# Empreinte SHA-1 du keystore de debug
DEBUG_KEYSTORE="$HOME/.android/debug.keystore"
if [ -f "$DEBUG_KEYSTORE" ]; then
    keytool -list -v -keystore "$DEBUG_KEYSTORE" -alias androiddebugkey -storepass android -keypass android | grep "SHA1:"
else
    echo "❌ Keystore de debug non trouvé à: $DEBUG_KEYSTORE"
    echo "💡 Créez d'abord un build Android pour générer le keystore de debug"
fi

echo ""
echo "🏗️ 2. Empreinte SHA-1 d'EAS Build (production):"
echo "------------------------------------------------"

# Vérifier si EAS CLI est installé
if command -v eas &> /dev/null; then
    echo "📋 Exécution de: eas credentials"
    echo "💡 Copiez l'empreinte SHA-1 affichée dans la section 'Keystore'"
    echo ""
    eas credentials
else
    echo "❌ EAS CLI n'est pas installé."
    echo "💡 Installez-le avec: npm install -g @expo/eas-cli"
    echo "💡 Puis exécutez: eas credentials"
fi

echo ""
echo "📋 3. Instructions pour Google Cloud Console:"
echo "--------------------------------------------"
echo "1. Allez sur: https://console.cloud.google.com/"
echo "2. Sélectionnez le projet Wizeco"
echo "3. Allez dans 'APIs & Services' > 'Credentials'"
echo "4. Créez un 'OAuth 2.0 Client ID' de type Android"
echo "5. Package name: com.evixgroup.wizeco"
echo "6. Ajoutez TOUTES les empreintes SHA-1 obtenues ci-dessus"
echo ""
echo "✅ Une fois configuré, testez avec: npx expo run:android"
