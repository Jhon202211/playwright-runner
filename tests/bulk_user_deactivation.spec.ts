import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = process.env.BASE_URL || 'https://alex.queo.dev';
const USER_EMAIL = process.env.USER_EMAIL;
const USER_PASSWORD = process.env.USER_PASSWORD;

test('test', async ({ page }) => {
  // Login
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(USER_EMAIL!);
  await page.locator('#password').fill(USER_PASSWORD!);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  
  // Validar que carga la página del dashboard después del login
  await expect(page).toHaveURL(/.*\/dashboard.*/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  
  // Esperar a que el sidebar se renderice completamente
  await page.waitForLoadState('domcontentloaded');
  const controlAccesoButton = page.getByRole('button', { name: 'Control de acceso' });
  await expect(controlAccesoButton).toBeVisible({ timeout: 10000 });
  
  // Hacer click en Control de acceso y esperar a que se vea el menú del sidebar
  await controlAccesoButton.scrollIntoViewIfNeeded();
  await controlAccesoButton.click();
  
  // Esperar a que aparezca el list del sidebar (menú desplegable)
  await expect(page.getByRole('link', { name: 'Usuarios' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('link', { name: 'Usuarios' }).click();
  await page.getByRole('link', { name: 'Desactivar Usuarios' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Choose File' }).click();
  // Cargar archivo Excel desde la ruta especificada
  const filePath = 'C:\\laragon\\www\\Automatizacion\\playwright\\fixtures\\FormatoDesactivarUsuariosQueoAccess.xlsx';
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(filePath);
  await page.getByRole('button', { name: 'Verificar archivo Excel' }).click();
  await page.getByRole('link', { name: 'Desactivar usuarios' }).click();
  await page.getByRole('button', { name: 'Cerrar' }).click();
});