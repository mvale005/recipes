/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const cors = require("cors")({origin: true}); // Allow all origins

exports.getApiKey = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const apiKey = "AIzaSyCiRHWB8KxYom7TAAztSDRLc0kiLNoPpzg";
    res.status(200).json({key: apiKey});
  });
});


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
