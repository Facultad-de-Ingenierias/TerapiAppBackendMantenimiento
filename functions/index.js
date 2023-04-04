const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const reservaQuery = require("./query/reservaQuery");
const prueba = require("./helpers/notificacionGmail");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});

exports.crearReserva = reservaQuery.crearReserva;
exports.consultarReservaId = reservaQuery.consultarReservaId;
exports.consultarReservasFecha = reservaQuery.consultarReservasFecha;
