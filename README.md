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

Puedes copiar los `.spec.ts` de tu proyecto principal (playwright) a `playwright-runner/tests/`.

### Qué debe tener el runner (resumen)

| En el runner | Descripción |
|--------------|-------------|
| `playwright.config.ts` | Con **ESM**: usar `fileURLToPath(import.meta.url)` para `__dirname`, no `__dirname` directo. |
| `tests/*.spec.ts` | Cada spec que use `dotenv` con `__dirname` debe definir `__dirname` en ESM (ver abajo). |
| `tests/helpers/*.ts` | Si algún spec hace `import ... from './helpers/...'`, copia esa carpeta. |
| `fixtures/` | Solo si algún test lee archivos de ahí (ej. Excel); copia los que use. |
| Variables en Railway | `BASE_URL` (y las que lean tus tests). Opcional: `.env` en la raíz del runner. |

### ESM: evitar `__dirname is not defined`

En Node con módulos ES no existe `__dirname`. En **playwright.config.ts** y en **cada .spec.ts** que use `path.resolve(__dirname, ...)` pon al inicio:

```ts
import { fileURLToPath } from 'url';
import * as path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// luego: path.join(__dirname, '../.env') o path.resolve(__dirname, '...')
```

### Tests que usan helpers

Ej.: `import_users_from_excel.spec.ts` importa `./helpers/generateExcelFile`. Si lo copias al runner, copia también `tests/helpers/generateExcelFile.ts` (y sus dependencias, ej. `xlsx` en package.json).
