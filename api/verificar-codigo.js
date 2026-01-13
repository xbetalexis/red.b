import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ mensaje: "Método no permitido" });
  }

  try {
    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const body = JSON.parse(Buffer.concat(buffers).toString());
    const { codigo } = body;

    if (!codigo) {
      return res.json({ mensaje: "❌ Código vacío" });
    }

    const ruta = path.join(process.cwd(), "data", "codigos.json");
    const lista = JSON.parse(fs.readFileSync(ruta, "utf8"));

    const item = lista.find(c => c.codigo === codigo);

    if (!item) {
      return res.json({ mensaje: "❌ Código inválido" });
    }

    if (item.usado) {
      return res.json({ mensaje: "⚠️ Código ya utilizado" });
    }

    item.usado = true;
    fs.writeFileSync(ruta, JSON.stringify(lista, null, 2));

    return res.json({ mensaje: item.premio });

  } catch (error) {
    return res.status(500).json({ mensaje: "Error interno" });
  }
}
