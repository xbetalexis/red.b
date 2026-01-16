let intentosPorIP = {};
let ganadoresTotales = 0;

const MAX_INTENTOS = 3;
const BLOQUEO_MS = 24 * 60 * 60 * 1000; // 24 horas
const LIMITE_GANADORES = 50;

export default function handler(req, res) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "ip";

  const ahora = Date.now();

  // Inicializar IP
  if (!intentosPorIP[ip]) {
    intentosPorIP[ip] = {
      count: 0,
      firstTime: ahora
    };
  }

  const data = intentosPorIP[ip];

  // Si pasó el bloqueo, reset
  if (ahora - data.firstTime >= BLOQUEO_MS) {
    data.count = 0;
    data.firstTime = ahora;
  }

  // 🚫 Límite alcanzado
  if (data.count >= MAX_INTENTOS) {
    const proximo = new Date(data.firstTime + BLOQUEO_MS);

    return res.json({
      ok: false,
      mensaje: "🚫 Ya usaste los intentos de hoy.",
      proximoIntento: proximo.toISOString()
    });
  }

  // Registrar intento
  data.count++;

  // Premios ocultos
  const premios = [
    { texto: "❌ SIN PREMIO – PROBÁ EN TU PRÓXIMA CARGA", prob: 80, ganador: false },
    { texto: "🎁 GANASTE 100 FICHAS", prob: 15, ganador: true },
    { texto: "🎉 GANASTE 300 FICHAS", prob: 5, ganador: true }
  ];

  // Sorteo
  let r = Math.random() * 100;
  let acc = 0;
  let resultado = premios[0];

  for (const p of premios) {
    acc += p.prob;
    if (r < acc) {
      resultado = p;
      break;
    }
  }

  if (resultado.ganador && ganadoresTotales < LIMITE_GANADORES) {
    ganadoresTotales++;
  }

  return res.json({
    ok: true,
    ganador: resultado.ganador,
    premio: resultado.texto,
    id: "RB-" + Date.now().toString().slice(-6),
    intentosRestantes: MAX_INTENTOS - data.count
  });
}
