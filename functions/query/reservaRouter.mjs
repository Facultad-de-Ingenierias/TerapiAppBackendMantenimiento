const express = require('express');
const router = express();
const admin = require('firebase-admin');
const db = admin.firestore();
const table = db.collection("Reserva");


router.post("/api/reserva", async (req, res) => {
    try {
        const DateCurrent = new Date();
        DateCurrent.setUTCDate(DateCurrent.getUTCDate() + 15);
        const Date1 = DateCurrent.toISOString().substring(0, 10);
        const Date2 = new Date().toISOString().substring(0, 10);

        if (req.body.Fecha >= Date2 &&
            req.body.Fecha <= Date1) {
            await table.doc().create({
                Id_Servicio: req.body.Id_Servicio,
                Id_Cliente: req.body.Id_Cliente,
                Id_EstadoReserva: req.body.Id_EstadoReserva,
                Fecha: req.body.Fecha,
                Hora: req.body.Hora,
                Lugar: req.body.Lugar,
                Observaciones: req.body.Observaciones
            });
            return res.status(204).json();
        } else {
            return res.status(404).json();
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

router.get("/api/consultarHorasFecha/:Fecha", (req, res) => {
    let lista = [];
    (async () => {
        try {
            table.where("Fecha", "==", req.params.Fecha).get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    console.log(doc.data().Hora);
                    lista.push(doc.data().Hora);
                });
                if (lista.length > 0) {
                    return res.status(200).json(lista);
                } else {
                    return res.status(404).json();
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

router.get("/api/reserva/:Id", (req, res) => {
    (async () => {
        try {
            const doc = table.doc(req.params.Id);
            const item = (await doc.get()).data();

            if (item != null) {
                return res.status(200).json(item);
            } else {
                return res.status(404).json();
            }

        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

module.exports = router;