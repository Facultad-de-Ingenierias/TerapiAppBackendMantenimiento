const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    service: "Gmail",
    auth:{
        user: "spaterapiapp@gmail.com",
        pass: "vlrnxqyrbnhrbsfq"
    }

    
})

function notificarReserva(email,subject,data){
    return transport.sendMail({
        from: "TerapiApp Spa <spaterapiapp@gmail.com>",
        to: email,
        subject: subject,
        html: `<h1>Hola Juan</h1>
        <p>Se creo una nueva reserva para el servicio de chocolaterapia para el dia: ${data.Fecha}
        en el horario: ${data.Hora}</p>`
    })
    .then(r=>r)
    .catch(e=>e);
}

module.exports = notificarReserva;