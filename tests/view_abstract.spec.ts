import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = process.env.BASE_URL || 'https://alex.queo.dev';
const USER_EMAIL = process.env.USER_EMAIL;
const USER_PASSWORD = process.env.USER_PASSWORD;

test('test', async ({ page }) => {
  // ========== LOGIN ==========
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole('textbox', { name: 'Correo electrónico' }).click();
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(USER_EMAIL!);
  await page.locator('#password').click();
  await page.locator('#password').click();
  await page.locator('#password').fill(USER_PASSWORD!);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  
  // Esperar a que la página cargue después del login
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  
  // ========== NAVEGAR A CONTROL DE ACCESO ==========
  // Esperar a que el botón "Control de acceso" esté visible en el sidebar
  const controlAccesoButton = page.getByRole('button', { name: 'Control de acceso' });
  await expect(controlAccesoButton).toBeVisible({ timeout: 10000 });
  await controlAccesoButton.scrollIntoViewIfNeeded();
  await controlAccesoButton.click();
  
  // Esperar a que se expanda el menú del sidebar y aparezcan las opciones
  await page.waitForTimeout(500); // Pequeño delay para que se complete la animación del menú
  await expect(page.getByRole('link', { name: 'Resumen' })).toBeVisible({ timeout: 10000 });
  
  // ========== NAVEGAR A RESUMEN ==========
  await page.getByRole('link', { name: 'Resumen' }).click();
  
  // Esperar a que cargue la página de Resumen
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
});