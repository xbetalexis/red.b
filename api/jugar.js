let intentosPorDispositivo = {};

const MAX_INTENTOS = 3;
const BLOQUEO_MS = 24 * 60 * 60 * 1000; // 24 horas

export default function handler(req, res) {
  const { deviceId } = req.body || {};

  if (!deviceId) {
    return res.json({
      ok: false,
      mensaje: "Dispositivo inválido"
    });
  }

  const ahora = Date.now();

  // Inicializar dispositivo
  if (!intentosPorDispositivo[deviceId]) {
    intentosPorDispositivo[deviceId] = {
      count: 0,
      firstTime: null
    };
  }

  const data = intentosPorDispositivo[deviceId];

  // Reset si pasaron 24hs desde el primer intento
  if (data.firstTime && ahora - data.firstTime >= BLOQUEO_MS) {
    data.count = 0;
    data.firstTime = null;
  }

  // 🚫 Bloqueo si ya usó los intentos
  if (data.count >= MAX_INTENTOS) {
    return res.json({
      ok: false,
      mensaje: "🚫 Ya usaste los intentos de hoy.",
      proximoIntento: new Date(data.firstTime + BLOQUEO_MS).toISOString()
    });
  }

  // 👉 Registrar intento real
  data.count++;
  if (data.count === 1) {
    data.firstTime = ahora;
  }

  // 🎁 PREMIOS — 80 / 15 / 5 (SUMA 100)
  const premios = [
    {
      t: "❌ SIN PREMIO – PROBÁ EN TU PRÓXIMA CARGA",
      p: 80,
      g: false
    },
    {
      t: "🎁 GANASTE 3.000 FICHAS (NO EXTRAÍBLE)",
      p: 15,
      g: true
    },
    {
      t: "🎉 GANASTE 5.000 FICHAS (NO EXTRAÍBLE)",
      p: 5,
      g: true
    }
  ];

  // 🎲 Sorteo correcto
  let r = Math.random() * 100;
  let acc = 0;
  let resultado = premios[0];

  for (const pr of premios) {
    acc += pr.p;
    if (r < acc) {
      resultado = pr;
      break;
    }
  }

  return res.json({
    ok: true,
    ganador: resultado.g,
    premio: resultado.t,
    id: "RB-" + Date.now().toString().slice(-6),
    intentosRestantes: MAX_INTENTOS - data.count
  });
}
