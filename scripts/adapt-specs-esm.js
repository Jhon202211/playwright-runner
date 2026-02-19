import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testsDir = path.join(__dirname, '../tests');
const files = fs.readdirSync(testsDir).filter((f) => f.endsWith('.spec.ts'));

const esmBlock = `import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
`;

for (const file of files) {
  const filePath = path.join(testsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. ESM: add __dirname and fix dotenv path (only if not already present)
  if (!content.includes('fileURLToPath(import.meta.url)')) {
    content = content.replace(
      /dotenv\.config\(\s*\{\s*path:\s*path\.resolve\(__dirname,\s*['\"]\.\.\/\.env['\"]\)\s*\}\s*\);/,
      esmBlock.trim() + "\ndotenv.config({ path: path.join(__dirname, '../.env') });"
    );
    if (!content.includes('fileURLToPath(import.meta.url)')) {
      content = content.replace(
        /(import \* as path from ['\"]path['\"];)\n/,
        "$1\n" + esmBlock
      );
      content = content.replace(/path\.resolve\(__dirname,\s*['\"]\.\.\/\.env['\"]\)/g, "path.join(__dirname, '../.env')");
    }
  }

  // 2. Password field: Contraseña -> #password
  content = content.replace(/page\.getByRole\s*\(\s*['\"]textbox['\"]\s*,\s*\{\s*name:\s*['\"]Contraseña['\"]\s*\}\s*\)/g, "page.locator('#password')");
  content = content.replace(/this\.page\.getByRole\s*\(\s*['\"]textbox['\"]\s*,\s*\{\s*name:\s*['\"]Contraseña['\"]\s*\}\s*\)/g, "this.page.locator('#password')");

  // 3. Password field: ********* -> #password
  content = content.replace(/page\.getByRole\s*\(\s*['\"]textbox['\"]\s*,\s*\{\s*name:\s*['\"]\*\*\*\*\*\*\*\*\*['\"]\s*\}\s*\)/g, "page.locator('#password')");

  // 4. Remove redundant .click() before .fill() for password
  content = content.replace(/\.locator\s*\(\s*['\"]#password['\"]\s*\)\.click\s*\(\s*\)\s*\n\s*await [^;]+\.locator\s*\(\s*['\"]#password['\"]\s*\)\.fill/g, ".locator('#password').fill");

  // 5. Hardcoded credentials -> env vars
  content = content.replace(/\.fill\s*\(\s*['\"]userrfid2109@refactor\.com['\"]\s*\)/g, '.fill(USER_EMAIL!)');
  content = content.replace(/\.fill\s*\(\s*['\"]userrfid2109['\"]\s*\)/g, '.fill(USER_PASSWORD!)');
  content = content.replace(/\.fill\s*\(\s*['\"]usuarior15@simultaneo\.com['\"]\s*\)/g, '.fill(USER_EMAIL!)');
  content = content.replace(/\.fill\s*\(\s*['\"]usuarior15['\"]\s*\)/g, '.fill(USER_PASSWORD!)');

  // 6. Ensure USER_EMAIL and USER_PASSWORD are declared (after BASE_URL)
  if ((content.includes('USER_EMAIL!') || content.includes('USER_PASSWORD!')) && !content.includes('const USER_EMAIL =')) {
    content = content.replace(
      /(const BASE_URL = process\.env\.BASE_URL[^;]+;)/,
      "$1\nconst USER_EMAIL = process.env.USER_EMAIL;\nconst USER_PASSWORD = process.env.USER_PASSWORD;"
    );
  }

  fs.writeFileSync(filePath, content);
  console.log('OK', file);
}
console.log('Done.', files.length, 'files');
