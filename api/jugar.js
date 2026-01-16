let intentosPorIP = {};
let ganadoresTotales = 0;

const MAX_INTENTOS = 3;
const BLOQUEO_MS = 24*60*60*1000;
const LIMITE_GANADORES = 50;

export default function handler(req,res){
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "ip";

  const ahora = Date.now();

  if(!intentosPorIP[ip]){
    intentosPorIP[ip]={count:0,first:ahora};
  }

  const d = intentosPorIP[ip];

  if(ahora - d.first > BLOQUEO_MS){
    d.count=0;
    d.first=ahora;
  }

  if(d.count >= MAX_INTENTOS){
    return res.json({
      ok:false,
      mensaje:"🚫 Ya intentaste en este dispositivo. Volvé luego de las 24hs."
    });
  }

  d.count++;

  const premios=[
    {t:"❌ SIN PREMIO – PROBÁ EN TU PRÓXIMA CARGA",p:80,g:false},
    {t:"🎁 GANASTE 100 FICHAS",p:15,g:true},
    {t:"🎉 GANASTE 300 FICHAS",p:5,g:true}
  ];

  let r=Math.random()*100,a=0,resu=premios[0];
  for(const pr of premios){
    a+=pr.p;
    if(r<a){resu=pr;break;}
  }

  if(resu.g && ganadoresTotales < LIMITE_GANADORES){
    ganadoresTotales++;
  }

  return res.json({
    ok:true,
    ganador:resu.g,
    premio:resu.t,
    id:"RB-"+Date.now().toString().slice(-6),
    intentosRestantes: MAX_INTENTOS - d.count
  });
}
