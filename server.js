import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testsDir = path.join(__dirname, "tests");
const reportDir = path.join(__dirname, "playwright-report");

// Asegurar que la carpeta del reporte exista (tras un deploy nuevo está vacía hasta que se ejecute un test)
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json());

// Servir el reporte HTML de Playwright (para que el panel pueda abrir la URL en producción)
app.use("/report", express.static(reportDir, { index: "index.html" }));

app.get("/", (req, res) => {
  res.send("Runner activo");
});

/** URL base pública del servidor (para enlaces al reporte). Railway/proxy suelen enviar X-Forwarded-* */
function getBaseUrl(req) {
  const proto = req.get("x-forwarded-proto") || req.protocol || "https";
  const host = req.get("x-forwarded-host") || req.get("host") || "";
  return `${proto}://${host}`.replace(/\/$/, "");
}

/** GET /api/open-report: devuelve la URL pública del reporte para que el panel la abra en el navegador */
app.get("/api/open-report", (req, res) => {
  const indexPath = path.join(reportDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    return res.status(404).json({
      success: false,
      error: "No se encontró ningún reporte. Ejecuta algunos tests primero para generar un reporte.",
      suggestion: "Ejecuta al menos un test antes de intentar ver el reporte",
    });
  }
  const baseUrl = getBaseUrl(req);
  const reportUrl = `${baseUrl}/report`;
  res.setHeader("Cache-Control", "no-store");
  res.json({
    success: true,
    message: "Reporte disponible. Abre el enlace en tu navegador.",
    url: reportUrl,
  });
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

  // Railway: sin pantalla → siempre headless, solo Chromium. Sin --reporter=line para que se genere el reporte HTML (config).
  const env = { ...process.env, CI: "1", PLAYWRIGHT_HEADLESS: "1" };
  const cmd = `npx playwright test "${safeName}" --project=chromium`;
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
