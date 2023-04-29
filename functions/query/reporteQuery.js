const functions = require("firebase-functions");
const admin = require("firebase-admin");
const servicio = require("../query/servicioQuery");
const consultarServicios = require("./servicioQuery");

const db = admin.firestore();

exports.reservasMasVendidasMes = functions.https.onCall(async (data, context) => {
    try {
        const querySnapshot = await db.collection("Reserva").where("Id_EstadoReserva", "==", 1).get();
        const fechaEntrante = new Date(data.Fecha);
        const list = [];
        let masVendidos = new Map();
        const listaServicios = await consultarServicios();
        let cantidad = 0;
        //Al parecer no se puede en los foreach de las consultas...
        for (let i = 0; i < listaServicios.length; i++) {
            let servicio = listaServicios[i];
            let cantidad = 0;
            querySnapshot.forEach((doc) => {
                let fechaSalida = new Date(doc.data().Fecha);
                if (fechaSalida.getMonth() == fechaEntrante.getMonth()) {
                    if (servicio.Id == doc.data().Id_Servicio) {
                        cantidad += 1;
                    }
                }
            });
            masVendidos.set(servicio.Nombre, cantidad);
        }
        return listaServicios[0].Id+"-"+querySnapshot.docs[0].get("Id_Servicio");
    } catch (error) {
        throw new functions.https.HttpsError('failed-precondition',
            `Hubo un error al consultar las reservas para la fecha ${data.Fecha}: 
        ${error.message}`);
    }
});