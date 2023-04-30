const functions = require("firebase-functions");
const admin = require("firebase-admin");
const notificarReserva = require("../helpers/notificacionGmail");

const db = admin.firestore();

exports.crearReserva = functions.https.onCall(async (data, context) => {
  try {
    const reservaExiste = consultarReservaFechaYHora(data);
    
    if ((await reservaExiste).size == 0) {
      const fechaActual = new Date();
      fechaActual.setUTCDate(fechaActual.getUTCDate() + 15);
      const fecha1 = fechaActual.toISOString().substring(0, 10);
      const fecha2 = new Date().toISOString().substring(0, 10);
      if (data.Fecha >= fecha2 && data.Fecha <= fecha1) {
        await db.collection("Reserva").doc().create({
          Fecha: data.Fecha,
          Hora: data.Hora,
          Id_Cliente: data.Id_Cliente,
          Id_EstadoReserva: data.Id_EstadoReserva,
          Id_Servicio: data.Id_Servicio,
          Lugar: data.Lugar,
          Observaciones: data.Observaciones,
        });
        try {
          notificarReserva("unilarajuancamilo@gmail.com", "Reserva", data);
        } catch (error) {
          return {
            message: `error enviando correo ${data.Fecha} y ${data.Hora} ha sido creada correctamente`,
          };
        }

        return {
          message: `Reserva ${data.Fecha} y ${data.Hora} ha sido creada correctamente`,
        };
      } else {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `La ${data.Fecha} debe ser mayor o igual a la actual y no superar 15 días mas`
        );
      }
    } else {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `La reserva para el día: ${data.Fecha} con horario: ${data.Hora} ya esta creada`
      );
    }
  } catch (error) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      `Hubo un error al crear la reserva: ${error.message}`
    );
  }
});

exports.consultarReservasFecha = functions.https.onCall(
  async (data, context) => {
    try {
      const lista = [];
      const querySnapshot = await db
        .collection("Reserva")
        .where("Fecha", "==", data.Fecha)
        .get();

      querySnapshot.forEach((doc) => {
        lista.push(doc.data().Hora);
      });
      return lista;
    } catch (error) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Hubo un error al consultar las reservas para la fecha ${data.Fecha}: 
        ${error.message}`
      );
    }
  }
);

exports.consultarReservasPorFecha = functions.https.onCall(async (data, context) => {
    try {
        const listaReservas = [];
        const querySnapshot = await db.collection("Reserva")
        .where("Fecha", "==", data.Fecha).get();

        querySnapshot.forEach(doc => {
            listaReservas.push(doc.data());
        })
        return listaReservas;
    } catch (error) {
        throw new functions.https.HttpsError('failed-precondition',
            `Hubo un error al consultar las reservas para la fecha ${data.Fecha}: 
        ${error.message}`);
    }
});

exports.consultarReservas = functions.https.onCall(async (data, context) => {
  try {
    const listaReservas = [];
    const querySnapshot = await db.collection("Reserva").get();

    querySnapshot.forEach((doc) => {
      listaReservas.push(doc.data());
    });
    return listaReservas;
  } catch (error) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      `Hubo un error al consultar las reservas.
        ${error.message}`
    );
  }
});

exports.consultarReservaId = functions.https.onCall(async (data, context) => {
  (async () => {
    try {
      const doc = db.collection("Reserva").doc(data.Id);
      const item = (await doc.get()).data();

      return item;
    } catch (error) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Hubo un error al consultar la reserva por Id ${data.Id}
            : ${error.message} `
      );
    }
  })();
});

function consultarReservaFechaYHora(data) {
  try {
    const reservasQuery = db
      .collection("Reserva")
      .where("Fecha", "==", data.Fecha)
      .where("Hora", "==", data.Hora)
      .get();

    return reservasQuery;
  } catch (error) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      `Hubo un error al consultar la reserva para el día: 
            ${data.Fecha} con horario: ${data.Hora}: ${error.message} `
    );
  }
}
