const REQUIRED_CONFIG = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
];

function getFirebaseConfig() {
  const missing = REQUIRED_CONFIG.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing Firebase configuration values: ${missing.join(", ")}`
    );
  }
  return {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || undefined,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const firebaseConfig = getFirebaseConfig();
    res.status(200).json({
      firebaseConfig,
      modelName:
        process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash-preview-09-2025",
    });
  } catch (error) {
    console.error("[config] load failure", error);
    res.status(500).json({ error: "Configuration unavailable" });
  }
};

