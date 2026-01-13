import fs from "fs";
import path from "path";

export default function handler(req, res){
  if(req.method !== "POST"){
    return res.status(405).json({ mensaje:"Método no permitido" });
  }

  const { codigo } = req.body;
  const ruta = path.join(process.cwd(),"data","codigos.json");
  const lista = JSON.parse(fs.readFileSync(ruta,"utf8"));

  const item = lista.find(c => c.codigo === codigo);

  if(!item){
    return res.json({ mensaje:"❌ Código inválido" });
  }

  if(item.usado){
    return res.json({ mensaje:"⚠️ Código ya utilizado" });
  }

  item.usado = true;
  fs.writeFileSync(ruta, JSON.stringify(lista,null,2));

  return res.json({ mensaje: item.premio });
}
