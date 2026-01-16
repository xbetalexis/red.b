// /api/jugar.js

let jugadasPorIP = {};
let ganadoresTotales = 0;
const LIMITE_GANADORES = 50; // podés cambiar esto

export default function handler(req, res) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "ip-desconocida";

  // 🔒 1 intento por IP
  if (jugadasPorIP[ip]) {
    return res.status(200).json({
      ok: false,
      mensaje: "🚫 Ya participaste desde este dispositivo/red."
    });
  }

  jugadasPorIP[ip] = true;

  // 🎁 premios y probabilidades (OCULTOS)
  const premios = [
    { texto: "❌ SIN PREMIO – PROBÁ EN TU PRÓXIMA CARGA", prob: 80, ganador: false },
    { texto: "🎁 GANASTE 100 FICHAS", prob: 15, ganador: true },
    { texto: "🎉 GANASTE 300 FICHAS", prob: 5, ganador: true }
  ];

  // 🚫 límite de ganadores
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
