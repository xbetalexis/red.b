import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ mensaje: "Método no permitido" });
  }

  try {
    const { codigo } = req.body;

    if (!codigo) {
      return res.json({ mensaje: "❌ Código vacío" });
    }

    const ruta = path.join(process.cwd(), "data", "codigos.json");
    const lista = JSON.parse(fs.readFileSync(ruta, "utf8"));

    const item = lista.find(c => c.codigo === codigo);

    if (!item) {
      return res.json({ mensaje: "❌ Código inválido" });
    }

    return res.json({
      mensaje: item.premio,
      valido: true,
      codigo: codigo
    });

  } catch (e) {
    return res.status(500).json({ mensaje: "Error interno" });
  }
}
