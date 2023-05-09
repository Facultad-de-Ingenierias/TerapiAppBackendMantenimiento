const assert = require('assert');
const admin = require('firebase-admin');
//const serviceAccount = require('../secretAccount.json'); Dede de ir la ruta de la key
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
const test = require('firebase-functions-test')();
const sinon = require('sinon');
const reporte = require('../query/reporteQuery');

describe('miMetodo', () => {
  let myFunctions, adminInitStub;

  before(() => {
    adminInitStub = sinon.stub(admin, 'initializeApp');
    myFunctions = require('../query/reporteQuery');
  });

  after(() => {
    adminInitStub.restore();
    test.cleanup();
  });

  it('debería devolver un resultado esperado', async () => {
    const fechaEntrante = { Fecha: "2023-07-10" };
    const contexto = {};
    const resultado = await test.wrap(myFunctions.reservasMasVendidasMes)(fechaEntrante, contexto);
    const salidaEsperada = [{
        Nombre: "Masaje relajante de cuerpo completo",
        Precio: 50000,
        Duracion: 60,
        Cantidad: 1
    }];

    assert.deepStrictEqual(resultado, salidaEsperada);
  }).timeout(200000);
});