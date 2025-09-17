const { JWT } = require("google-auth-library");
const fs = require("fs");

const PRIVATE_KEY_PATH =
  "/home/hackd/Desktop/dev/RMG_Groupe/wizeco/wizecoApp/firebase-private-key.json";

async function getAccessToken() {
  const key = JSON.parse(fs.readFileSync(PRIVATE_KEY_PATH, "utf8"));

  const jwtClient = new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const tokens = await jwtClient.authorize();
  return tokens.access_token;
}

getAccessToken().then((token) => {
  console.log("🔑 Token d'accès Firebase :");
  console.log(token);
  console.log("\n📋 Commande curl :");
  console.log(`curl -X POST https://fcm.googleapis.com/v1/projects/wizecoapp-38a6a/messages:send \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": {
      "token": "eYES09U3RLCjE0pFzCkMFi:APA91bGbVtNIvvpKmwP8H0M4ihAsB6lgZj5DA5McgJRAFDpYjkHULC-ac2ITrw8dHRnBpPQI170MbQueLZDpOiw1XRCH4lnSDgrNv5595zPanTFe3RZNjmA",
      "data": {
        "title": "🚀 Test FCM Direct",
        "body": "Notification envoyée via curl !"
      }
    }
  }'`);
});
