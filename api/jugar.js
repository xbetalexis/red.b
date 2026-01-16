// /api/jugar.js

let intentosPorIP = {};
let ganadoresTotales = 0;
let registros = []; // 📒 REGISTRO DE INTENTOS

const MAX_INTENTOS = 3;
const BLOQUEO_MS = 24 * 60 * 60 * 1000; // 24hs
const LIMITE_GANADORES = 50;

export default function handler(req, res) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "ip-desconocida";

  const ahora = Date.now();

  // inicializar IP
  if (!intentosPorIP[ip]) {
    intentosPorIP[ip] = {
      count: 0,
      firstTime: ahora
    };
  }

  const dataIP = intentosPorIP[ip];

  // reset a las 24hs
  if (ahora - dataIP.firstTime > BLOQUEO_MS) {
    dataIP.count = 0;
    dataIP.firstTime = ahora;
  }

  // 🚫 bloqueado por límite
  if (dataIP.count >= MAX_INTENTOS) {
    registrarIntento({
      ip,
      ganador: false,
      premio: "BLOQUEADO – LIMITE ALCANZADO"
    });

    return res.status(200).json({
      ok: false,
      mensaje: "🚫 Ya intentaste en este dispositivo. Volvé luego de las 24hs."
    });
  }

  dataIP.count++;

  // 🎁 premios ocultos
  const premios = [
    { texto: "❌ SIN PREMIO – PROBÁ EN TU PRÓXIMA CARGA", prob: 80, ganador: false },
    { texto: "🎁 GANASTE 100 FICHAS", prob: 15, ganador: true },
    { texto: "🎉 GANASTE 300 FICHAS", prob: 5, ganador: true }
  ];

  // límite global de ganadores
  if (ganadoresTotales >= LIMITE_GANADORES) {
    const id = generarID();
    registrarIntento({
      ip,
      ganador: false,
      premio: "SIN PREMIO – CAMPAÑA FINALIZADA",
      id
    });

    return res.status(200).json({
      ok: true,
      ganador: false,
      premio: "❌ SIN PREMIO – CAMPAÑA FINALIZADA",
      id
    });
  }

  // sorteo
  const resultado = elegirPremio(premios);
  const id = generarID();

  if (resultado.ganador) {
    ganadoresTotales++;
  }

  // 📒 guardar registro
  registrarIntento({
    ip,
    ganador: resultado.ganador,
    premio: resultado.texto,
    id
  });

  return res.status(200).json({
    ok: true,
    ganador: resultado.ganador,
    premio: resultado.texto,
    id
  });
}

// =======================
// FUNCIONES AUXILIARES
// =======================

function elegirPremio(lista) {
  const r = Math.random() * 100;
  let acc = 0;
  for (const p of lista) {
    acc += p.prob;
    if (r < acc) return p;
  }
  return lista[0];
}

function generarID() {
  return "RB-" + Date.now().toString().slice(-6);
}

function registrarIntento(data) {
  registros.push({
    ...data,
    fecha: new Date().toISOString()
  });

  // 👉 solo para debug (opcional)
  console.log("📒 REGISTRO:", registros[registros.length - 1]);
}
