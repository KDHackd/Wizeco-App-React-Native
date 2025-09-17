const { JWT } = require("google-auth-library");
const fs = require("fs");

// Votre token FCM récupéré
const DEVICE_TOKEN =
  "eYES09U3RLCjE0pFzCkMFi:APA91bGbVtNIvvpKmwP8H0M4ihAsB6lgZj5DA5McgJRAFDpYjkHULC-ac2ITrw8dHRnBpPQI170MbQueLZDpOiw1XRCH4lnSDgrNv5595zPanTFe3RZNjmA";

// Votre clé privée Firebase (à télécharger depuis Firebase Console)
const PRIVATE_KEY_PATH =
  "/home/hackd/Desktop/dev/RMG_Groupe/wizeco/wizecoApp/firebase-private-key.json";

async function getAccessToken() {
  try {
    console.log("📁 Lecture du fichier:", PRIVATE_KEY_PATH);
    const keyContent = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
    console.log(
      "📄 Contenu du fichier lu:",
      keyContent.substring(0, 100) + "..."
    );
    const key = JSON.parse(keyContent);
    console.log("🔑 Clé parsée, client_email:", key.client_email);

    console.log("🔐 private_key présent:", !!key.private_key);
    console.log(
      "🔐 private_key longueur:",
      key.private_key ? key.private_key.length : 0
    );

    const jwtClient = new JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const tokens = await jwtClient.authorize();
    return tokens.access_token;
  } catch (error) {
    console.error("❌ Erreur lors de la génération du token:", error.message);
    console.log(
      "📝 Assurez-vous d'avoir téléchargé la clé privée Firebase dans firebase-private-key.json"
    );
    process.exit(1);
  }
}

async function sendFCMNotification() {
  try {
    console.log("🔑 Génération du token d'accès Firebase...");
    const accessToken = await getAccessToken();
    console.log("✅ Token d'accès généré !");

    const messageBody = {
      message: {
        token: DEVICE_TOKEN,
        notification: {
          title: "🚀 WIZECO NOTIFICATION",
          body: "Test de notification depuis votre app !",
        },
        android: {
          priority: "high",
          notification: {
            sound: "default",
          },
        },
        data: {
          channelId: "default",
          message: "Test FCM Direct",
          title: "🚀 Notification FCM Direct",
          body: "Envoyée depuis curl !",
          scopeKey: "@evix-group/wizeco",
          experienceId: "@evix-group/wizeco",
        },
      },
    };

    console.log("📤 Envoi de la notification...");
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/wizecoapp-38a6a/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageBody),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Notification envoyée avec succès !");
      console.log("📱 Vérifiez votre appareil Android");
    } else {
      console.error("❌ Erreur lors de l'envoi:", result);
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

sendFCMNotification();
