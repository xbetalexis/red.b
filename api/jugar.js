// /api/jugar.js

// intentos por IP: { ip: { count, firstTime } }
let intentosPorIP = {};
let ganadoresTotales = 0;

const MAX_INTENTOS = 3;
const BLOQUEO_MS = 24 * 60 * 60 * 1000; // 24 horas
const LIMITE_GANADORES = 50; // ajustable

export default function handler(req, res) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "ip-desconocida";

  const ahora = Date.now();

  // 🔁 inicializar IP si no existe
  if (!intentosPorIP[ip]) {
    intentosPorIP[ip] = {
      count: 0,
      firstTime: ahora
    };
  }

  const dataIP = intentosPorIP[ip];

  // ⏱️ reset si pasaron 24hs
  if (ahora - dataIP.firstTime > BLOQUEO_MS) {
    dataIP.count = 0;
    dataIP.firstTime = ahora;
  }

  // 🚫 si superó intentos
  if (dataIP.count >= MAX_INTENTOS) {
    return res.status(200).json({
      ok: false,
      mensaje: "🚫 Ya intentaste en este dispositivo. Volvé luego de las 24hs."
    });
  }

  // 👉 registrar intento
  dataIP.count++;

  // 🎁 premios (OCULTOS)
  const premios = [
    { texto: "❌ SIN PREMIO – PROBÁ EN TU PRÓXIMA CARGA", prob: 80, ganador: false },
    { texto: "🎁 GANASTE 100 FICHAS", prob: 15, ganador: true },
    { texto: "🎉 GANASTE 300 FICHAS", prob: 5, ganador: true }
  ];

  // 🚫 límite de ganadores global
  if (ganadoresTotales >= LIMITE_GANADORES) {
    return res.status(200).json({
      ok: true,
      ganador: false,
      premio: "❌ SIN PREMIO – CAMPAÑA FINALIZADA",
      id: generarID()
    });
  }

  // 🎲 sorteo
  const resultado = elegirPremio(premios);

  if (resultado.ganador) {
    ganadoresTotales++;
  }

  return res.status(200).json({
    ok: true,
    ganador: resultado.ganador,
    premio: resultado.texto,
    id: generarID()
  });
}

// =======================
// FUNCIONES AUXILIARES
// =======================

function elegirPremio(lista) {
  const r = Math.random() * 100;
  let acumulado = 0;

  for (const p of lista) {
    acumulado += p.prob;
    if (r < acumulado) return p;
  }

  return lista[0];
}

function generarID() {
  return "RB-" + Date.now().toString().slice(-6);
}
