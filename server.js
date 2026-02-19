import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testsDir = path.join(__dirname, "tests");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Runner activo");
});

app.get("/tests", (req, res) => {
  try {
    const files = fs.readdirSync(testsDir).filter((f) => f.endsWith(".spec.ts") || f.endsWith(".spec.js"));
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/run", (req, res) => {
  const test = req.body?.test;
  if (!test) {
    return res.status(400).json({ success: false, error: "Falta body.test (nombre del archivo, ej: example.spec.ts)" });
  }
  // Evitar path traversal: solo nombre de archivo
  const safeName = path.basename(test).replace(/[\/\\]/g, "");
  const testPath = path.join(testsDir, safeName);
  if (!fs.existsSync(testPath)) {
    return res.status(400).json({ success: false, error: "Archivo de test no encontrado" });
  }

  // Railway: sin pantalla → siempre headless, solo Chromium. Comando lo arma el backend (no --headed, no cross-env).
  const env = { ...process.env, CI: "1", PLAYWRIGHT_HEADLESS: "1" };
  const cmd = `npx playwright test "${safeName}" --project=chromium --reporter=line`;
  exec(cmd, { cwd: __dirname, maxBuffer: 10 * 1024 * 1024, env }, (err, stdout, stderr) => {
    const out = stdout || "";
    const errOut = stderr || "";
    res.json({
      success: !err,
      stdout: out,
      stderr: errOut,
      error: err ? (errOut || out || err.message).slice(0, 500) : undefined,
    });
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log("Servidor listo en", HOST + ":" + PORT);
});
