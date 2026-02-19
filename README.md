# playwright-runner

Backend para ejecutar tests de Playwright desde tu panel en Cloudflare. Pensado para desplegar en **Railway**.

## Estructura

```
playwright-runner/
├── package.json
├── server.js           # API: GET /, GET /tests, POST /run
├── playwright.config.ts
├── Dockerfile          # Opcional: despliegue con imagen oficial Playwright
├── tests/
│   └── example.spec.ts
└── README.md
```

## API

| Método | Ruta   | Descripción |
|--------|--------|-------------|
| GET    | `/`    | Health: responde "Runner activo" |
| GET    | `/tests` | Lista archivos `*.spec.ts` en `tests/` |
| POST   | `/run` | Ejecuta un test. Body: `{ "test": "example.spec.ts" }` |

## Despliegue en Railway

### Opción A: Sin Docker (Railway usa Node por defecto)

1. Crea un repo en GitHub con este proyecto.
2. En Railway: **New Project** → **Deploy from GitHub** → elige el repo.
3. Variables: no obligatorias (Railway asigna `PORT`).
4. Deploy. Revisa **Logs** y confirma que ves `Servidor listo en puerto XXXX`.
5. En **Settings** → **Networking** → **Generate Domain** para obtener `https://xxx.up.railway.app`.

### Opción B: Con Docker (recomendado)

Evita fallos de Chromium por dependencias Linux:

1. Mismo repo en GitHub.
2. En Railway: **New Project** → **Deploy from GitHub**.
3. En el servicio, **Settings** → **Build**:
   - **Builder**: Dockerfile  
   (Railway detecta el `Dockerfile` y construye la imagen.)
4. Deploy y genera el dominio como arriba.

## Probar

- `https://tu-app.up.railway.app/` → "Runner activo"
- `https://tu-app.up.railway.app/tests` → `["example.spec.ts", ...]`
- `POST https://tu-app.up.railway.app/run` con body `{ "test": "example.spec.ts" }`

## Conectar con el panel (Cloudflare)

En la UI del panel, donde antes usabas `http://localhost:3000/run`, cambia la URL base a la de Railway:

`https://tu-app.up.railway.app`

Así las peticiones serán a `https://tu-app.up.railway.app/tests` y `https://tu-app.up.railway.app/run`.

## Añadir los tests del panel

Puedes copiar los `.spec.ts` de tu proyecto principal (playwright) a `playwright-runner/tests/`. Si usan `dotenv` o `BASE_URL`, define variables de entorno en Railway (Settings → Variables) y ajusta `playwright.config.ts` o los tests para leerlas.
