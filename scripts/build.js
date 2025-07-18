const fs = require('fs');
const path = require('path');

/**
 * Script de construcción para Simple Bill
 * Prepara los archivos para el despliegue en Cloudflare Workers
 */

console.log('🔨 Construyendo Simple Bill...');

// Verificar que existen los archivos necesarios
const requiredFiles = [
  'src/index.js',
  'src/html-template.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Archivo requerido no encontrado: ${file}`);
    process.exit(1);
  }
}

// Crear directorio dist si no existe
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Leer el template HTML
const htmlTemplate = fs.readFileSync('src/html-template.js', 'utf8');

// Leer el archivo principal
const indexContent = fs.readFileSync('src/index.js', 'utf8');

// Verificar que el HTML template esté correctamente formateado
if (!htmlTemplate.includes('export const htmlTemplate')) {
  console.error('❌ El archivo html-template.js debe exportar htmlTemplate');
  process.exit(1);
}

console.log('✅ Archivos verificados correctamente');
console.log('✅ Construcción completada');

console.log(`
🚀 Tu proyecto está listo para el despliegue!

Próximos pasos:
1. Configurar wrangler.toml con tus credenciales de Cloudflare
2. Crear un KV namespace en Cloudflare Dashboard
3. Ejecutar: npm run deploy

Para desarrollo local:
npm run dev
`);
