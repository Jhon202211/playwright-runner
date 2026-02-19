import { test, expect, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const USER_EMAIL = process.env.USER_EMAIL || '';
const USER_PASSWORD = process.env.USER_PASSWORD || '';
const ROOM_NAME = process.env.ROOM_NAME || 'Sala de Juntas QA';
const DATE = process.env.DATE || new Date().toISOString().split('T')[0];
const PURPOSE = process.env.PURPOSE || `Reunión de prueba ${Date.now()}`;
const BASE_URL = process.env.BASE_URL || 'https://alex.queo.dev';
const EXECUTION_TYPE = process.env.EXECUTION_TYPE || 'plan';

class RoomReservationPage {
  private page: Page;
  private timeout: number;

  constructor(page: Page) {
    this.page = page;
    this.timeout = 30000;
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.goto(`${BASE_URL}/login`);
    
    const emailField = this.page.locator("input[name='email']");
    await emailField.waitFor({ state: 'visible', timeout: this.timeout });
    await emailField.clear();
    await emailField.fill(email);
    await this.page.waitForTimeout(1000);
    
    const passwordField = this.page.locator("input[name='password']");
    await passwordField.waitFor({ state: 'visible', timeout: this.timeout });
    await passwordField.clear();
    await passwordField.fill(password);
    await this.page.waitForTimeout(1000);
    
    const submitButton = this.page.locator("button[type='submit']");
    await submitButton.waitFor({ state: 'visible', timeout: this.timeout });
    await submitButton.click();
    await this.page.waitForTimeout(2000);
  }

  async navigateToRoomReservation(): Promise<void> {
    // Ir directamente a la página de salas
    console.log('🌐 Navegando a la página de salas...');
    await this.page.goto(`${BASE_URL}/rooms?searchType=search&`);
    
    // Esperar y hacer clic en el botón 'Reservar sala'
    console.log('🔍 Buscando botón "Reservar sala"...');
    const reservarBtn = this.page.locator("//button[contains(., 'Reservar sala')]");
    await reservarBtn.waitFor({ state: 'visible', timeout: this.timeout });
    await reservarBtn.click();
    await this.page.waitForTimeout(2000);
  }

  async createRoomReservation(
    roomName: string,
    date: string,
    startTime: string,
    endTime: string,
    purpose: string
  ): Promise<void> {
    console.log('🚀 Iniciando creación de reserva...');
    await this.navigateToRoomReservation();
    await this.page.waitForTimeout(3000);

    // Seleccionar la fecha
    console.log('📅 Seleccionando fecha...');
    try {
      // Formatear la fecha para el selector
      const day = date.split('-')[2];
      const dateButton = this.page.locator(`//button[contains(@aria-label, '${day}')]`);
      await dateButton.waitFor({ state: 'visible', timeout: this.timeout });
      await dateButton.click();
      console.log(`✅ Fecha seleccionada: ${day}`);
      await this.page.waitForTimeout(2000);
    } catch (e) {
      console.log(`⚠️ Error al seleccionar la fecha: ${e}`);
    }

    // Seleccionar la hora de inicio
    console.log(`⏰ Seleccionando hora de inicio: ${startTime}...`);
    const startTimeInput = this.page.locator('#startTime');
    await startTimeInput.waitFor({ state: 'visible', timeout: this.timeout });
    await startTimeInput.clear();
    await startTimeInput.fill(startTime);
    await this.page.waitForTimeout(2000);

    // Seleccionar la hora final
    console.log(`⏰ Seleccionando hora final: ${endTime}...`);
    const endTimeInput = this.page.locator('#endTime');
    await endTimeInput.waitFor({ state: 'visible', timeout: this.timeout });
    await endTimeInput.clear();
    await endTimeInput.fill(endTime);
    await this.page.waitForTimeout(2000);

    // Buscar la sala escribiendo el nombre exacto en el input de búsqueda
    console.log(`🔍 Buscando sala: ${roomName}...`);
    const searchInput = this.page.getByRole('textbox', { name: 'Buscar sala por nombre' });
    await searchInput.waitFor({ state: 'visible', timeout: this.timeout });
    await searchInput.clear();
    await searchInput.fill(roomName);
    await this.page.waitForTimeout(2000);

    // Seleccionar la card de la sala con el nombre exacto
    console.log('🔍 Seleccionando sala...');
    const salaCard = this.page.locator(`//div[contains(@class, 'cursor-pointer')]//div[contains(text(), '${roomName}')]`);
    await salaCard.waitFor({ state: 'visible', timeout: this.timeout });
    await salaCard.click();
    console.log(`✅ Sala "${roomName}" seleccionada`);
    await this.page.waitForTimeout(2000);

    // Buscar y agregar como invitado a employee@queotest.com
    console.log('👤 Agregando invitado...');
    try {
      const personasInput = this.page.locator("//input[contains(@placeholder, 'Buscar personas')]");
      await personasInput.waitFor({ state: 'visible', timeout: 20000 });
      await personasInput.clear();
      await personasInput.fill('employee@queotest.com');
      await this.page.waitForTimeout(3000);

      // Intentar hacer clic en el card del invitado si aparece
      try {
        console.log('🔍 Buscando card del invitado...');
        const invitadoCard = this.page.locator("//div[contains(@class, 'flex') and contains(@class, 'cursor-pointer') and .//p[text()='employee@queotest.com']]");
        await invitadoCard.waitFor({ state: 'visible', timeout: 5000 });
        await invitadoCard.click();
        console.log('✅ Se hizo clic en el invitado.');
        await this.page.waitForTimeout(2000);
      } catch (e) {
        console.log('⚠️ No se encontró el card del invitado:', e);
      }

      // Siempre intentar hacer clic en el botón naranja 'Añadir de todas formas' si está presente
      try {
        console.log('🔍 Buscando botón "Añadir de todas formas"...');
        const anadirBtn = this.page.locator("//button[contains(@class, 'bg-orange-1000') and contains(., 'Añadir de todas formas')]");
        await anadirBtn.waitFor({ state: 'visible', timeout: 5000 });
        await anadirBtn.click();
        console.log('✅ Se hizo clic en "Añadir de todas formas".');
        await this.page.waitForTimeout(2000);
      } catch (e) {
        console.log('⚠️ No se encontró el botón "Añadir de todas formas":', e);
      }
    } catch (e) {
      console.log(`⚠️ No se pudo seleccionar el invitado ni añadir de todas formas: ${e}`);
    }

    // Hacer clic en el botón de confirmar reserva (pantalla principal)
    console.log('🔍 Confirmando reserva (pantalla principal)...');
    try {
      const confirmarBtn = this.page.locator("//button[contains(@class, 'bg-orange-1000') and contains(., 'Confirmar reserva')]");
      await confirmarBtn.waitFor({ state: 'visible', timeout: this.timeout });
      await confirmarBtn.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(1000);
      await confirmarBtn.click();
      console.log('✅ Se hizo clic en "Confirmar reserva" (pantalla principal).');
      await this.page.waitForTimeout(3000);
    } catch (e) {
      console.log(`⚠️ Error al confirmar la reserva (pantalla principal): ${e}`);
    }

    // Llenar el modal de confirmación de reserva
    console.log('📝 Llenando el modal de confirmación de reserva...');
    try {
      // Título de la reunión
      console.log('📝 Ingresando título...');
      const tituloInput = this.page.locator("input[name='title']");
      await tituloInput.waitFor({ state: 'visible', timeout: this.timeout });
      await tituloInput.clear();
      await tituloInput.fill('Reserva automatizada QA');
      console.log('✅ Título ingresado');
      await this.page.waitForTimeout(1000);

      // Descripción de la reunión
      console.log('📝 Ingresando descripción...');
      const descripcionInput = this.page.locator("textarea[name='description']").or(this.page.locator("input[name='description']"));
      await descripcionInput.waitFor({ state: 'visible', timeout: this.timeout });
      await descripcionInput.clear();
      await descripcionInput.fill('Esta es una reserva creada automáticamente por un test de Playwright.');
      console.log('✅ Descripción ingresada');
      await this.page.waitForTimeout(1000);

      // Botón Confirmar reserva en el modal
      console.log('🔍 Buscando botón "Confirmar reserva" en el modal...');
      const confirmarModalBtn = this.page.locator("//div[contains(@class, 'shadow') and contains(@class, 'rounded-lg')]//button[contains(., 'Confirmar reserva')]");
      await confirmarModalBtn.waitFor({ state: 'visible', timeout: this.timeout });
      await confirmarModalBtn.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(1000);
      await confirmarModalBtn.click();
      console.log('✅ Se hizo clic en "Confirmar reserva" del modal.');
      await this.page.waitForTimeout(3000);
    } catch (e) {
      console.log(`⚠️ Error en el modal de confirmación de reserva: ${e}`);
    }
  }

  async isReservationCreated(): Promise<boolean> {
    try {
      // Verificar si aparece un mensaje de éxito específico en la página
      console.log('⏳ Esperando mensaje de éxito...');
      const successMessage = this.page.locator(
        "//*[contains(text(), 'Reserva editada satisfactoriamente') or contains(text(), 'Tu reserva se ha procesado correctamente') or contains(@class, 'success') or contains(@class, 'alert-success')]"
      ).first();
      await successMessage.waitFor({ state: 'visible', timeout: 25000 });
      console.log('✅ Mensaje de éxito encontrado');
      return true;
    } catch (e) {
      // Verificar si estamos en la página de reservas
      try {
        console.log('⏳ Verificando URL de reservas...');
        await this.page.waitForURL('**/reservations**', { timeout: 10000 });
        console.log('✅ Estamos en la página de reservas');
        return true;
      } catch (e2) {
        console.log('⚠️ No se encontró mensaje de éxito ni redirección a reservas');
        return false;
      }
    }
  }
}

async function sendTestResultsToFirebase(data: {
  name: string;
  status: string;
  duration: number;
  date: string;
  error: string;
  executionType: string;
}): Promise<void> {
  // TODO: Implementar integración con Firebase si es necesario
  // Por ahora solo logueamos los resultados
  console.log('Test Results:', JSON.stringify(data, null, 2));
  
  // Si tienes una función de Firebase, descomenta y ajusta:
  // await sendTestResultsToFirebase(data);
}

test('test_create_room_reservation', async ({ page }) => {
  // Aumentar timeout si es necesario (60000 para tests complejos)
  test.setTimeout(60000);
  
  const startTime = Date.now();
  let errorMsg = '';
  let status = 'passed';

  try {
    // Configurar timeout de la página
    page.setDefaultTimeout(50000);
    
    // Instanciar Page Object
    const roomReservationPage = new RoomReservationPage(page);
    await roomReservationPage.login(USER_EMAIL, USER_PASSWORD);
    await page.waitForTimeout(3000);
    
    // Calcular la hora de inicio (5 minutos después de la hora actual)
    const now = new Date();
    const startTimeDt = new Date(now.getTime() + 5 * 60000); // 5 minutos después
    const endTimeDt = new Date(startTimeDt.getTime() + 60 * 60000); // 1 hora después
    
    // Formatear las horas para el input (HH:MM)
    const startTimeStr = startTimeDt.toTimeString().slice(0, 5);
    const endTimeStr = endTimeDt.toTimeString().slice(0, 5);
    
    // Usar variables de entorno si están presentes
    const roomName = ROOM_NAME;
    const date = DATE;
    const purpose = PURPOSE;
    
    // Ejecutar acción principal
    await roomReservationPage.createRoomReservation(
      roomName,
      date,
      startTimeStr,
      endTimeStr,
      purpose
    );
    
    // Validar resultado
    const isCreated = await roomReservationPage.isReservationCreated();
    expect(isCreated).toBe(true);
    console.log('✅ Test completado exitosamente');

  } catch (error) {
    status = 'failed';
    errorMsg = error instanceof Error ? error.message : String(error);
    
    // Tomar screenshot del error en la carpeta screenshot_error_
    const timestamp = Date.now();
    await page.screenshot({ path: `screenshot_error_/screenshot_error_${timestamp}.png` });
    
    console.log(`❌ Error en el test: ${errorMsg}`);
    throw error;
  } finally {
    const duration = (Date.now() - startTime) / 1000;
    const dateIso = new Date().toISOString();
    
    await sendTestResultsToFirebase({
      name: 'test_create_room_reservation',
      status: status,
      duration: Math.round(duration * 100) / 100,
      date: dateIso,
      error: errorMsg,
      executionType: EXECUTION_TYPE
    });
  }
});