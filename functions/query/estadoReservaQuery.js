const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

exports.consultarEstadoReservaPorId = async function(Id){

    try {
      const item = await db.collection('EstadoReserva').doc(Id).get();
      const estadoReserva = item.data();
      
      return estadoReserva;
    } catch (error) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Hubo un error al consultar el Estado de la Reserva por Id ${Id}
              : ${error.message} `
      );
    }
  
}