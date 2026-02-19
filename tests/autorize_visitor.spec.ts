import { test, expect, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const USER_EMAIL = process.env.USER_EMAIL || '';
const USER_PASSWORD = process.env.USER_PASSWORD || '';
const BASE_URL = process.env.BASE_URL || 'https://alex.queo.dev';
const EXECUTION_TYPE = process.env.EXECUTION_TYPE || 'plan';
const VISITOR_DNI = process.env.VISITOR_DNI || '10234284';

// Función auxiliar para formatear fechas en español según el formato del calendario
function formatDateForCalendar(date: Date): string {
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  // El formato del calendario parece ser "Choose [día], [número] de [mes] de" (sin año)
  return `Choose ${dayName}, ${day} de ${month} de`;
}

// Clase VisitorAuthorizationPage para encapsular la lógica de autorización de visitantes
class VisitorAuthorizationPage {
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

  async authorizeVisitor(dni: string): Promise<void> {
    console.log('🌐 Navegando a la sección de visitantes...');
    
    // Navegar a Control de acceso > Visitantes
    await this.page.getByRole('button', { name: 'Control de acceso' }).waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByRole('button', { name: 'Control de acceso' }).click();
    await this.page.waitForTimeout(1000);
    
    await this.page.getByRole('link', { name: 'Visitantes' }).waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByRole('link', { name: 'Visitantes' }).click();
    await this.page.waitForTimeout(2000);
    
    console.log('🔍 Buscando visitante por DNI...');
    // Seleccionar tipo de búsqueda: Cédula
    await this.page.getByRole('button', { name: 'Cédula' }).waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByRole('button', { name: 'Cédula' }).click();
    await this.page.waitForTimeout(500);
    
    await this.page.getByRole('option', { name: 'Cédula' }).locator('div').nth(2).waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByRole('option', { name: 'Cédula' }).locator('div').nth(2).click();
    await this.page.waitForTimeout(1000);
    
    // Buscar por DNI
    const searchField = this.page.getByRole('textbox', { name: 'Escriba el término para' });
    await searchField.waitFor({ state: 'visible', timeout: this.timeout });
    await searchField.click();
    await searchField.fill(dni);
    await this.page.waitForTimeout(2000);
    
    // Seleccionar el resultado de la búsqueda
    await this.page.getByText(`RESULTADOS PARA "${dni}"`).waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByText(`RESULTADOS PARA "${dni}"`).click();
    await this.page.waitForTimeout(1000);
    
    await this.page.getByText(dni, { exact: true }).waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByText(dni, { exact: true }).click();
    await this.page.waitForTimeout(2000);
    
    console.log('📝 Creando nueva autorización...');
    // Crear nueva autorización
    await this.page.getByRole('link', { name: 'Nueva autorización' }).waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByRole('link', { name: 'Nueva autorización' }).click();
    await this.page.waitForTimeout(2000);
    
    // Seleccionar copropiedades
    await this.page.getByTestId('properties-container').locator('svg').first().waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByTestId('properties-container').locator('svg').first().click();
    await this.page.waitForTimeout(1000);
    
    await this.page.getByText('Seleccionar copropiedades').waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByText('Seleccionar copropiedades').click();
    await this.page.waitForTimeout(1000);
    
    const propertySelect = this.page.locator('#react-select-2-input');
    await propertySelect.waitFor({ state: 'visible', timeout: this.timeout });
    await propertySelect.fill('QA Prueba Auto (No tocar)');
    await this.page.waitForTimeout(1000);
    
    await this.page.locator('#react-select-2-option-0').waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.locator('#react-select-2-option-0').click();
    await this.page.waitForTimeout(1000);
    
    // Seleccionar empresa
    const companyIndicator = this.page.locator('.react-select__indicator.react-select__dropdown-indicator.css-tlfecz-indicatorContainer');
    await companyIndicator.waitFor({ state: 'visible', timeout: this.timeout });
    await companyIndicator.click();
    await this.page.waitForTimeout(1000);
    
    await this.page.getByText('Empresa Test 1764176028736', { exact: true }).waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByText('Empresa Test 1764176028736', { exact: true }).click();
    await this.page.waitForTimeout(1000);
    
    // Seleccionar grupo de puertas (hacer click en los botones de flecha)
    const arrowButtons = this.page.getByRole('button', { name: '' });
    const count = await arrowButtons.count();
    for (let i = 0; i < Math.min(count, 4); i++) {
      await arrowButtons.nth(i).waitFor({ state: 'visible', timeout: this.timeout });
      await arrowButtons.nth(i).click();
      await this.page.waitForTimeout(500);
    }
    
    await this.page.getByText('Todas las puertas - QA Prueba').waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByText('Todas las puertas - QA Prueba').click();
    await this.page.waitForTimeout(1000);
    
    console.log('📅 Configurando fechas y horarios...');
    // Calcular fechas dinámicamente basadas en la fecha actual
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 2); // 2 días después de hoy (3 días en total)
    
    const startDateText = formatDateForCalendar(today);
    const endDateText = formatDateForCalendar(endDate);
    
    console.log(`📅 Fecha inicio: ${startDateText}`);
    console.log(`📅 Fecha fin: ${endDateText}`);
    
    // Configurar fechas
    const dateField = this.page.getByRole('textbox', { name: 'Fechas de la visita' });
    await dateField.waitFor({ state: 'visible', timeout: this.timeout });
    await dateField.click();
    await this.page.waitForTimeout(1000);
    
    // Seleccionar fecha de inicio (hoy)
    // Usar un selector que excluya días fuera del mes actual
    const startDateOption = this.page.locator(`[role="option"][aria-label*="${startDateText}"]:not(.react-datepicker__day--outside-month)`).first();
    await startDateOption.waitFor({ state: 'visible', timeout: this.timeout });
    await startDateOption.click();
    await this.page.waitForTimeout(1000);
    
    // Seleccionar fecha final (hoy + 2 días)
    // Usar un selector que excluya días fuera del mes actual
    const endDateOption = this.page.locator(`[role="option"][aria-label*="${endDateText}"]:not(.react-datepicker__day--outside-month)`).first();
    await endDateOption.waitFor({ state: 'visible', timeout: this.timeout });
    await endDateOption.click();
    await this.page.waitForTimeout(1000);
    
    // Configurar horarios
    const startTime = this.page.getByTestId('startTime');
    await startTime.waitFor({ state: 'visible', timeout: this.timeout });
    await startTime.click();
    await startTime.fill('00:00');
    await this.page.waitForTimeout(500);
    
    const endTime = this.page.getByTestId('endTime');
    await endTime.waitFor({ state: 'visible', timeout: this.timeout });
    await endTime.click();
    await endTime.fill('23:59');
    await this.page.waitForTimeout(500);
    
    // Llenar observaciones
    const textarea = this.page.locator('textarea');
    await textarea.waitFor({ state: 'visible', timeout: this.timeout });
    await textarea.click();
    await textarea.fill('Prueba QA para invitaciones de visitantes automatizadas');
    await this.page.waitForTimeout(1000);
    
    console.log('✅ Autorizando visitante...');
    // Autorizar
    await this.page.getByRole('button', { name: 'Autorizar' }).waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByRole('button', { name: 'Autorizar' }).click();
    await this.page.waitForTimeout(2000);
    
    // Confirmar mensaje de éxito
    await this.page.getByText('Se envió una notificación al').waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByTestId('undefined-confirmation-modal-confirm-button').waitFor({ state: 'visible', timeout: this.timeout });
    await this.page.getByTestId('undefined-confirmation-modal-confirm-button').click();
    await this.page.waitForTimeout(2000);
    
    console.log('✅ Autorización completada exitosamente');
  }
}

// Función para enviar resultados a Firebase (opcional)
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

test('test_authorize_visitor', async ({ page }) => {
  // Aumentar timeout si es necesario (60000 para tests complejos)
  test.setTimeout(60000);
  
  const startTime = Date.now();
  let errorMsg = '';
  let status = 'passed';

  try {
    // Configurar timeout de la página
    page.setDefaultTimeout(50000);
    
    // Instanciar Page Object
    const visitorAuthPage = new VisitorAuthorizationPage(page);
    await visitorAuthPage.login(USER_EMAIL, USER_PASSWORD);
    
    // Esperar a que la URL contenga "dashboard"
    console.log('⏳ Esperando redirección al dashboard...');
    await page.waitForURL('**/dashboard**', { timeout: 20000 });
    console.log('✅ Redirección al dashboard completada');
    
    // Ejecutar acción principal
    await visitorAuthPage.authorizeVisitor(VISITOR_DNI);
    
    // Validar que la autorización fue exitosa
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
      name: 'test_authorize_visitor',
      status: status,
      duration: Math.round(duration * 100) / 100,
      date: dateIso,
      error: errorMsg,
      executionType: EXECUTION_TYPE
    });
  }
});