import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONSECUTIVE_FILE = path.join(__dirname, '../../fixtures/last_consecutive.txt');
const EXCEL_FILE = path.join(__dirname, '../../fixtures/FormatoImportarUsuariosQueoAccess (11).xlsx');

function getLastConsecutive(): number {
  try {
    if (fs.existsSync(CONSECUTIVE_FILE)) {
      const content = fs.readFileSync(CONSECUTIVE_FILE, 'utf-8').trim();
      return parseInt(content, 10) || 271;
    }
  } catch {
    console.log('No se encontró archivo de consecutivo, empezando desde 272');
  }
  return 271;
}

function saveLastConsecutive(consecutive: number): void {
  try {
    const dir = path.dirname(CONSECUTIVE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONSECUTIVE_FILE, consecutive.toString(), 'utf-8');
  } catch (error) {
    console.error('Error guardando consecutivo:', error);
  }
}

export function generateExcelFile(recordsCount: number = 25): string {
  const startConsecutive = getLastConsecutive() + 1;
  const endConsecutive = startConsecutive + recordsCount - 1;

  const headers = [
    'NOMBRES', 'APELLIDOS', 'EMAIL', 'CELULAR', 'CEDULA',
    'VEHICULO: PLACA', 'VEHICULO: TIPO (BICICLETA|MOTO|CARRO)', 'VEHICULO: COLOR', 'VEHICULO: MARCA', 'VEHICULO: MODELO',
    'RFID', 'ACCESO POR FACIAL (SI/NO)', 'ACCESO AL GRUPO DE PUERTAS (SI/NO): RFID test - 1135', 'ACCESO A LA PUERTA (SI/NO): RFID test - 18940',
    'MENSAJE', 'COMENTARIO'
  ];

  const data = [headers];
  for (let i = startConsecutive; i <= endConsecutive; i++) {
    data.push([
      `Usuario${i}`, 'Set Facial', `usuario${i}@prueba.com`, `456123011${i}`, `12311111${i}`,
      '', '', '', '', '', '', 'SI', '', '', '', ''
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  const dir = path.dirname(EXCEL_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (fs.existsSync(EXCEL_FILE)) {
    try {
      fs.unlinkSync(EXCEL_FILE);
    } catch {
      throw new Error(`El archivo está abierto: ${EXCEL_FILE}`);
    }
  }

  XLSX.writeFile(wb, EXCEL_FILE);
  saveLastConsecutive(endConsecutive);
  console.log(`✅ Archivo Excel generado: ${recordsCount} registros (${startConsecutive} - ${endConsecutive})`);
  return EXCEL_FILE;
}
