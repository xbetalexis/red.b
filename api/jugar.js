export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  const { deviceId } = req.body;

  if (!deviceId) {
    return res.json({ ok: false });
  }

  // ===== CONFIGURACIÓN =====
  const INTENTOS_MAX = 3;
  const PREMIO_TEXTO = "GANASTE 2.000 FICHAS (NO EXTRAÍBLE)";
  const PROBABILIDAD_PREMIO = 3; // 3%

  // ===== STORAGE SIMPLE EN MEMORIA =====
  global.intentosPorDispositivo ??= {};
  global.intentosPorDispositivo[deviceId] ??= {
    intentos: 0,
    ultimoUso: Date.now(),
  };

  const registro = global.intentosPorDispositivo[deviceId];

  // ===== RESET CADA 24 HS =====
  const ahora = Date.now();
  const VEINTICUATRO_HS = 24 * 60 * 60 * 1000;

  if (ahora - registro.ultimoUso > VEINTICUATRO_HS) {
    registro.intentos = 0;
    registro.ultimoUso = ahora;
  }

  // ===== SIN INTENTOS =====
  if (registro.intentos >= INTENTOS_MAX) {
    return res.json({
      ok: false,
      proximoIntento: registro.ultimoUso + VEINTICUATRO_HS,
    });
  }

  // ===== CONSUMIR INTENTO =====
  registro.intentos += 1;
  registro.ultimoUso = ahora;

  const intentosRestantes = INTENTOS_MAX - registro.intentos;

  // ===== PROBABILIDAD =====
  const chance = Math.floor(Math.random() * 100) + 1;

  let ganador = false;
  let premio = "❌ SIN PREMIO";

  if (chance <= PROBABILIDAD_PREMIO) {
    ganador = true;
    premio = PREMIO_TEXTO;
  }

  // ===== CÓDIGO DE REFERENCIA =====
  const ref =
    "RB-" +
    Math.random().toString(36).substring(2, 8).toUpperCase();

  // ===== RESPUESTA =====
  return res.json({
    ok: true,
    ganador,
    premio,
    id: ref,
    intentosRestantes,
  });
}
