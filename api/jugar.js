let intentosPorDispositivo = {};

const MAX_INTENTOS = 3;
const BLOQUEO_MS = 24 * 60 * 60 * 1000;

export default function handler(req, res){
  const { deviceId } = req.body || {};

  if(!deviceId){
    return res.json({ ok:false, mensaje:"Dispositivo inválido" });
  }

  const ahora = Date.now();

  if(!intentosPorDispositivo[deviceId]){
    intentosPorDispositivo[deviceId] = {
      count: 0,
      firstTime: null
    };
  }

  const d = intentosPorDispositivo[deviceId];

  if(d.firstTime && ahora - d.firstTime >= BLOQUEO_MS){
    d.count = 0;
    d.firstTime = null;
  }

  if(d.count >= MAX_INTENTOS){
    return res.json({
      ok:false,
      mensaje:"🚫 Ya usaste los intentos de hoy.",
      proximoIntento: new Date(d.firstTime + BLOQUEO_MS).toISOString()
    });
  }

  d.count++;
  if(d.count === 1) d.firstTime = ahora;

  // 🎁 PREMIOS CONFIGURADOS
  const premios = [
    { t:"❌ SIN PREMIO – PROBÁ EN TU PRÓXIMA CARGA", p:80, g:false },
    { t:"🎁 GANASTE 3.000 FICHAS (NO EXTRAÍBLE)", p:15, g:true },
    { t:"🎉 GANASTE 5.000 FICHAS (NO EXTRAÍBLE)", p:5, g:true }
  ];

  let r = Math.random() * 100;
  let acc = 0;
  let resu = premios[0];

  for(const pr of premios){
    acc += pr.p;
    if(r < acc){
      resu = pr;
      break;
    }
  }

  return res.json({
    ok:true,
    ganador:resu.g,
    premio:resu.t,
    id:"RB-" + Date.now().toString().slice(-6),
    intentosRestantes: MAX_INTENTOS - d.count
  });
}
