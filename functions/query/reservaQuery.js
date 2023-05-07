const functions = require("firebase-functions");
const admin = require("firebase-admin");
const notificarReserva = require("../helpers/notificacionGmail");

const consultarServicio = require("./servicioQuery");
const consultarEstadoReserva = require("./estadoReservaQuery");

const db = admin.firestore();

exports.crearReserva = functions.https.onCall(async (data, context) => {
  try {
    const reservaExiste = consultarReservaFechaYHora(data);
    if ((await reservaExiste).size == 0) {
      const DateCurrent = new Date();
      DateCurrent.setUTCDate(DateCurrent.getUTCDate() + 15);
      const Date1 = DateCurrent.toISOString().substring(0, 10);
      const Date2 = new Date().toISOString().substring(0, 10);
      if (data.Fecha >= Date2 && data.Fecha <= Date1) {
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
    let listaReservas = [];
    let querySnapshot = await db.collection("Reserva").where("Fecha", "==", data.Fecha).get();

    let promises = querySnapshot.docs.map(async (doc) => {

      let servicio = await consultarServicio.consultarServicioPorId(doc.data().Id_Servicio);
      let estadoReserva = await consultarEstadoReserva.consultarEstadoReservaPorId(doc.data().Id_EstadoReserva);
      let respuesta = {
        Id_Reserva: doc.id,
        Fecha: doc.data().Fecha,
        Hora: doc.data().Hora,
        Id_Cliente: doc.data().Id_Cliente,
        Id_EstadoReserva: doc.data().Id_EstadoReserva,
        Id_Servicio: doc.data().Id_Servicio,
        Lugar: doc.data().Lugar,
        Observaciones: doc.data().Observaciones,
        NombreServicio: servicio.Nombre,
        PrecioServicio: servicio.Precio,
        DuracionServicio: servicio.Duracion,
        MaterialesServicio: servicio.Materiales,
        ProcedimientoServicio: servicio.Procedimiento,
        DescripcionServicio: servicio.Descripcion,
        ImagenesServicio: servicio.Imagenes,
        NombreEstadoReserva: estadoReserva.Nombre
      }
      listaReservas.push(respuesta);

    });

    await Promise.all(promises); // esperar a que todas las consultas a la base de datos se resuelvan
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

exports.consultarReservasIdCliente = functions.https.onCall(
  async (data, context) => {
    try {
      const lista = [];
      const querySnapshot = await db
        .collection("Reserva")
        .where("Id_Cliente", "==", data.Id_Cliente)
        .get();

      querySnapshot.forEach((doc) => {
        lista.push(doc.data());
      });
      return lista;
    } catch (error) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Hubo un error al consultar las reservas para el cliente con id ${data.Id_Cliente}: 
        ${error.message}`
      );
    }
  }
);
