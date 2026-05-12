

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Webhook déclenché par Payhip à chaque vente
exports.payhipWebhook = functions.https.onRequest(async (req, res) => {
  // Payhip envoie un POST
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const email = (req.body.buyer_email || "").toLowerCase().trim();

  if (!email) {
    console.error("Webhook reçu sans email :", req.body);
    return res.status(400).send("Missing buyer_email");
  }

  try {
    await db.collection("authorized_emails").doc(email).set({
      email: email,
      authorizedAt: admin.firestore.FieldValue.serverTimestamp(),
      source: "payhip",
    });

    console.log(`Email autorisé : ${email}`);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Erreur Firestore :", error);
    res.status(500).send("Internal error");
  }
});