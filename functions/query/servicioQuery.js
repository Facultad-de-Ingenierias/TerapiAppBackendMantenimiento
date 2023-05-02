const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

exports.crearServicio = functions.https.onCall(async (data, context) => {
    try {
        const servicioExiste = consultarServicioNombre(data);
        if ((await servicioExiste).size == 0) {

            if (data.Duracion > 0 && data.Duracion <= 60) {

                if (data.Precio > 0) {

                    await db.collection("Servicio").doc().create({
                        Nombre: data.Nombre,
                        Imagenes: data.Imagenes,
                        Precio: data.Precio,
                        Duracion: data.Duracion,
                        Materiales: data.Materiales,
                        Descripcion: data.Descripcion,
                        Procedimiento: data.Procedimiento,
                    });
                    return {
                        message: `Servicio ${data.Nombre} ha sido creado correctamente`,
                    };
                } else {
                    throw new functions.https.HttpsError(
                        "failed-precondition",
                        `El Precio: ${data.Precio} debe ser mayor a 0`
                    );
                }

            } else {
                throw new functions.https.HttpsError(
                    "failed-precondition",
                    `La Duracion: ${data.Duracion} debe ser menor o igual a 60 y mayor a 0`
                );
            }



        } else {
            throw new functions.https.HttpsError(
                "failed-precondition",
                `El serivico: ${data.Nombre} ya esta creado`
            );
        }
    } catch (error) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            `Hubo un error al crear el servicio: ${error.message}`
        );
    }
});

function consultarServicioNombre(data) {
    try {
        const servicioQuery = db
            .collection("Servicio")
            .where("Nombre", "==", data.Nombre)
            .get();

        return servicioQuery;
    } catch (error) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            `Hubo un error al consultar servicio por nombre : 
              ${data.Nombre}: ${error.message} `
        );
    }
}

exports.consultarServicios = functions.https.onCall(async (data, context) => {
    try {
      const listaServicios = [];
      const querySnapshot = await db.collection("Servicio").get();
  
      querySnapshot.forEach((doc) => {
        listaServicios.push(doc.data());
      });
      return listaServicios;
    } catch (error) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Hubo un error al consultar los servicios.
          ${error.message}`
      );
    }
  });

