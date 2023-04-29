const functions = require("firebase-functions");
const admin = require("firebase-admin");
const servicio = require("../query/servicioQuery");
const consultarServicios = require("./servicioQuery");

const db = admin.firestore();

exports.reservasMasVendidasMes = functions.https.onCall(async (data, context) => {
    try {
        const fechaActual = new Date();
        const fechaEntrante = new Date(data.Fecha);
        let masVendidos = [];

        if (fechaEntrante.getMonth() <= fechaActual.getMonth() ) {
            const listaReservas = await db.collection("Reserva").where("Id_EstadoReserva", "==", 2).get();
            const listaServicios = await consultarServicios.consultarServicios();
            //Al parecer no se puede en los foreach de las consultas...
            for (let i = 0; i < listaServicios.length; i++) {
                let cantidad = 0;
                let servicio = listaServicios[i];
                listaReservas.forEach((doc) => {
                    let fechaSalida = new Date(doc.data().Fecha);
                    if (fechaSalida.getMonth() == fechaEntrante.getMonth()) {
                        if (servicio.Id == doc.data().Id_Servicio) {
                            cantidad += 1;
                        }
                    }
                });
                let respuesta = {
                    Nombre: servicio.Nombre,
                    Cantidad: cantidad
                }
                masVendidos.push(respuesta);
            }
            return masVendidos;
        } else {
            throw new functions.https.HttpsError(
                "failed-precondition",
                `La ${data.Fecha} no puede tener un mes mayor al de la fecha actual.`
              );
        }
    } catch (error) {
        throw new functions.https.HttpsError('failed-precondition',
            `Hubo un error al consultar los servicios mas vendidos para la fecha ${data.Fecha}: 
        ${error.message}`);
    }
});