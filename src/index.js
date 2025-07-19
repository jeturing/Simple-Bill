/**
 * Simple Bill - Cloudflare Worker
 * Sistema de facturación simple para Cloudflare Workers
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Ruta principal - servir la aplicación HTML
      if (url.pathname === '/' || url.pathname === '/index.html') {
        return new Response(getHTMLTemplate(), {
          headers: {
            'Content-Type': 'text/html',
            ...corsHeaders
          }
        });
      }

      // Servir archivos JavaScript estáticos
      if (url.pathname.startsWith('/frontend/')) {
        return await serveStaticFile(url.pathname);
      }

      // 404 para otras rutas
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders 
      });

    } catch (error) {
      console.error('Error handling request:', error);
      return new Response('Internal Server Error', { 
        status: 500,
        headers: corsHeaders 
      });
    }
  }
};

/**
 * Maneja las peticiones de la API
 */
async function serveStaticFile(pathname) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Map of file paths to their content
  const staticFiles = {
    '/frontend/main.js': getMainJS(),
    '/frontend/menu.js': getMenuJS(),
    '/frontend/clients.js': getClientsJS(),
    '/frontend/products.js': getProductsJS(),
    '/frontend/invoice.js': getInvoiceJS(),
    '/frontend/config.js': getConfigJS(),
    '/frontend/pdf.js': getPdfJS()
  };

  const content = staticFiles[pathname];
  if (content) {
    return new Response(content, {
      headers: {
        'Content-Type': 'application/javascript',
        ...corsHeaders
      }
    });
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}

function getHTMLTemplate() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Factura Simple</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"></script>
<style>
  tbody::-webkit-scrollbar {
    height: 6px;
  }
  tbody::-webkit-scrollbar-thumb {
    background-color: #a0aec0;
    border-radius: 3px;
  }
</style>
</head>
<body class="bg-gray-100 min-h-screen p-4">

<div class="max-w-5xl mx-auto bg-white p-6 rounded shadow">
  <h1 class="text-3xl font-bold mb-6 text-center">App Simple de Facturación</h1>

  <!-- Menú de Navegación -->
  <nav class="flex justify-center mb-6 border-b">
    <button data-section="configuracion" class="nav-btn px-4 py-2 text-gray-600 hover:text-blue-600 border-b-2 border-transparent">Configuración</button>
    <button data-section="clientes" class="nav-btn px-4 py-2 text-gray-600 hover:text-blue-600 border-b-2 border-transparent">Clientes</button>
    <button data-section="productos" class="nav-btn px-4 py-2 text-gray-600 hover:text-blue-600 border-b-2 border-transparent">Productos</button>
    <button data-section="factura" class="nav-btn px-4 py-2 text-gray-600 hover:text-blue-600 border-b-2 border-transparent">Nueva Factura</button>
    <button data-section="historial" class="nav-btn px-4 py-2 text-gray-600 hover:text-blue-600 border-b-2 border-transparent">Historial</button>
  </nav>

  <!-- Contenido dinámico -->
  <main id="main-content">
    <!-- Sección Configuración -->
    <section id="configuracion-section" class="content-section mb-6 hidden">
      <h2 class="text-xl font-semibold mb-2">Configuración de la Empresa</h2>
      <div class="mb-4">
        <label class="font-semibold" for="nombreEmpresa">Nombre de la Empresa</label>
        <input id="nombreEmpresa" type="text" class="w-full border border-gray-300 rounded px-3 py-2" placeholder="Nombre de la empresa" />
      </div>
      <div class="mb-4">
        <label class="font-semibold" for="logoEmpresa">Logotipo de la Empresa</label>
        <input id="logoEmpresa" type="file" accept="image/*" class="w-full border border-gray-300 rounded px-3 py-2" />
      </div>
      <button id="btnGuardarEmpresa" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Guardar Configuración</button>
    </section>

    <!-- Sección Clientes -->
    <section id="clientes-section" class="content-section mb-6 hidden">
      <h2 class="text-xl font-semibold mb-2">Clientes</h2>
      <div class="flex gap-2 mb-4">
        <input id="inputClienteNombre" type="text" placeholder="Nombre cliente" class="flex-grow border border-gray-300 rounded px-3 py-2" />
        <input id="inputClienteEmail" type="email" placeholder="Email cliente (opcional)" class="flex-grow border border-gray-300 rounded px-3 py-2" />
        <button id="btnAgregarCliente" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Agregar</button>
      </div>
      <select id="selectClientes" class="w-full border border-gray-300 rounded px-3 py-2" aria-label="Lista de clientes">
        <option value="">-- Selecciona cliente --</option>
      </select>
    </section>

    <!-- Sección Productos -->
    <section id="productos-section" class="content-section mb-6 hidden">
      <h2 class="text-xl font-semibold mb-2">Productos</h2>
      <div class="flex gap-2 mb-4">
        <input id="inputProductoNombre" type="text" placeholder="Nombre producto" class="flex-grow border border-gray-300 rounded px-3 py-2" />
        <input id="inputProductoPrecio" type="number" min="0" step="0.01" placeholder="Precio unitario" class="w-40 border border-gray-300 rounded px-3 py-2" />
        <button id="btnAgregarProducto" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Agregar</button>
      </div>
      <select id="selectProductos" class="w-full border border-gray-300 rounded px-3 py-2" aria-label="Lista de productos">
        <option value="">-- Selecciona producto --</option>
      </select>
    </section>

    <!-- Sección Factura -->
    <section id="factura-section" class="content-section mb-6">
      <h2 class="text-xl font-semibold mb-2">Nueva Factura</h2>
      <div class="mb-4">
        <label class="font-semibold" for="codigoFactura">Código Factura</label>
        <input id="codigoFactura" type="text" readonly class="w-full border border-gray-300 rounded px-3 py-2 bg-gray-200 cursor-not-allowed" />
      </div>
      <div class="mb-4">
        <label class="font-semibold" for="facturaCliente">Cliente</label>
        <select id="facturaCliente" class="w-full border border-gray-300 rounded px-3 py-2" aria-label="Cliente para factura">
          <option value="">-- Selecciona cliente --</option>
        </select>
      </div>
      <div class="overflow-x-auto mb-4">
        <table class="w-full table-auto border-collapse border border-gray-300 text-sm">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 px-2 py-1">Producto</th>
              <th class="border border-gray-300 px-2 py-1 w-20">Cantidad</th>
              <th class="border border-gray-300 px-2 py-1 w-28">Precio Unitario</th>
              <th class="border border-gray-300 px-2 py-1 w-28">Subtotal</th>
              <th class="border border-gray-300 px-2 py-1 w-12">Eliminar</th>
            </tr>
          </thead>
          <tbody id="tbodyFacturaProductos" class="max-h-60 overflow-y-auto"></tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="text-right font-bold px-2 py-1">Total</td>
              <td id="totalFactura" class="font-bold px-2 py-1">$0.00</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button id="btnAgregarLinea" class="mb-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Agregar línea producto</button>
      <button id="btnGuardarFactura" class="w-full bg-green-700 hover:bg-green-800 text-white px-4 py-3 rounded font-semibold">Guardar Factura y Generar PDF</button>
    </section>

    <!-- Sección Historial -->
    <section id="historial-section" class="content-section mb-6 hidden">
      <h2 class="text-xl font-semibold mb-2">Facturas Guardadas</h2>
      <div class="overflow-x-auto max-h-80">
        <table class="w-full table-auto border-collapse border border-gray-300 text-sm">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 px-2 py-1 w-32">Código</th>
              <th class="border border-gray-300 px-2 py-1">Cliente</th>
              <th class="border border-gray-300 px-2 py-1 w-28">Fecha</th>
              <th class="border border-gray-300 px-2 py-1 w-28">Total</th>
              <th class="border border-gray-300 px-2 py-1 w-24">Acción</th>
            </tr>
          </thead>
          <tbody id="tbodyFacturasGuardadas"></tbody>
        </table>
      </div>
    </section>
    
    <!-- Visor de PDF -->
    <section id="pdf-viewer-section" class="content-section mb-6 hidden">
        <h2 class="text-xl font-semibold mb-2">Vista Previa de Factura</h2>
        <div class="mb-4">
          <button id="btnVolverHistorial" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">← Volver al Historial</button>
        </div>
        <iframe id="visorPDF" class="w-full h-96 border border-gray-300 rounded" src="" frameborder="0"></iframe>
    </section>

  </main>
</div>

<script type="module" src="/frontend/main.js"></script>
</body>
</html>`;
}
function getMainJS() {
  return \`import { init as initMenu } from './menu.js';
import { init as initConfig } from './config.js';
import { init as initClients } from './clients.js';
import { init as initProducts } from './products.js';
import { init as initInvoice } from './invoice.js';

document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initConfig();
    initClients();
    initProducts();
    initInvoice();
});\`;
}

function getMenuJS() {
  return \`export function init() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');

    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });
        const activeSection = document.getElementById(\\\`\\\${sectionId}-section\\\`);
        if (activeSection) {
            activeSection.classList.remove('hidden');
        }
        navButtons.forEach(btn => {
            btn.classList.remove('text-blue-600', 'border-blue-600');
            if (btn.dataset.section === sectionId) {
                btn.classList.add('text-blue-600', 'border-blue-600');
            }
        });
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            showSection(button.dataset.section);
        });
    });

    // Botón para volver al historial desde el visor PDF
    const btnVolverHistorial = document.getElementById('btnVolverHistorial');
    if (btnVolverHistorial) {
        btnVolverHistorial.addEventListener('click', () => {
            showSection('historial');
        });
    }

    // Show default section
    showSection('factura');
}\`;
}

function getClientsJS() {
  return \`const KEY_CLIENTES = 'app_factura_clientes';
let clientes = [];

function cargarClientes() {
    clientes = JSON.parse(localStorage.getItem(KEY_CLIENTES) || '[]');
}

function guardarClientes() {
    localStorage.setItem(KEY_CLIENTES, JSON.stringify(clientes));
}

function renderClientes() {
    const selectClientes = document.getElementById('selectClientes');
    const facturaClienteSelect = document.getElementById('facturaCliente');
    
    const options = clientes.map((c, i) => \\\`<option value="\\\${i}">\\\${c.nombre} \\\${c.email ? '(' + c.email + ')' : ''}</option>\\\`).join('');
    
    if(selectClientes) selectClientes.innerHTML = \\\`<option value="">-- Selecciona cliente --</option>\\\${options}\\\`;
    if(facturaClienteSelect) facturaClienteSelect.innerHTML = \\\`<option value="">-- Selecciona cliente --</option>\\\${options}\\\`;
}

export function init() {
    const inputClienteNombre = document.getElementById('inputClienteNombre');
    const inputClienteEmail = document.getElementById('inputClienteEmail');
    const btnAgregarCliente = document.getElementById('btnAgregarCliente');

    btnAgregarCliente.addEventListener('click', () => {
        const nombre = inputClienteNombre.value.trim();
        const email = inputClienteEmail.value.trim();
        if (!nombre) {
            alert('El nombre del cliente es obligatorio');
            return;
        }
        clientes.push({ nombre, email });
        guardarClientes();
        renderClientes();
        inputClienteNombre.value = '';
        inputClienteEmail.value = '';
        alert('Cliente agregado');
    });

    cargarClientes();
    renderClientes();
}

export function getClient(index) {
    return clientes[index];
}\`;
}

function getProductsJS() {
  return \`const KEY_PRODUCTOS = 'app_factura_productos';
let productos = [];

function cargarProductos() {
    productos = JSON.parse(localStorage.getItem(KEY_PRODUCTOS) || '[]');
}

function guardarProductos() {
    localStorage.setItem(KEY_PRODUCTOS, JSON.stringify(productos));
}

function renderProductos() {
    const selectProductos = document.getElementById('selectProductos');
    if (!selectProductos) return;
    selectProductos.innerHTML = \\\`<option value="">-- Selecciona producto --</option>\\\` +
        productos.map((p, i) => \\\`<option value="\\\${i}">\\\${p.nombre} - $\\\${p.precio.toFixed(2)}</option>\\\`).join('');
}

export function init() {
    const inputProductoNombre = document.getElementById('inputProductoNombre');
    const inputProductoPrecio = document.getElementById('inputProductoPrecio');
    const btnAgregarProducto = document.getElementById('btnAgregarProducto');
    const selectProductos = document.getElementById('selectProductos');

    btnAgregarProducto.addEventListener('click', () => {
        const nombre = inputProductoNombre.value.trim();
        const precio = parseFloat(inputProductoPrecio.value);
        if (!nombre) {
            alert('El nombre del producto es obligatorio');
            return;
        }
        if (isNaN(precio) || precio < 0) {
            alert('Precio inválido');
            return;
        }
        productos.push({ nombre, precio });
        guardarProductos();
        renderProductos();
        inputProductoNombre.value = '';
        inputProductoPrecio.value = '';
        alert('Producto agregado');
    });
    
    if(selectProductos) {
        selectProductos.addEventListener('change', () => {
            const idx = parseInt(selectProductos.value);
            if (!isNaN(idx)) {
                const prod = productos[idx];
                document.dispatchEvent(new CustomEvent('productSelected', { detail: prod }));
                selectProductos.value = '';
            }
        });
    }

    cargarProductos();
    renderProductos();
}\`;
}

function getConfigJS() {
  return \`const KEY_EMPRESA = 'app_factura_empresa';
let empresa = { nombre: '', logo: '' };

function cargarEmpresa() {
    const data = localStorage.getItem(KEY_EMPRESA);
    if (data) {
        empresa = JSON.parse(data);
        document.getElementById('nombreEmpresa').value = empresa.nombre;
    }
}

function guardarEmpresa() {
    empresa.nombre = document.getElementById('nombreEmpresa').value.trim();
    const file = document.getElementById('logoEmpresa').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            empresa.logo = e.target.result;
            localStorage.setItem(KEY_EMPRESA, JSON.stringify(empresa));
            alert('Configuración de la empresa guardada');
        };
        reader.readAsDataURL(file);
    } else {
        localStorage.setItem(KEY_EMPRESA, JSON.stringify(empresa));
        alert('Configuración de la empresa guardada');
    }
}

export function init() {
    const btnGuardarEmpresa = document.getElementById('btnGuardarEmpresa');
    btnGuardarEmpresa.addEventListener('click', guardarEmpresa);
    cargarEmpresa();
}

export function getCompany() {
    return empresa;
}\`;
}
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const method = request.method;
  const pathname = url.pathname;

  try {
    // Clientes
    if (pathname === '/api/clients') {
      if (method === 'GET') {
        return await getClients(env);
      } else if (method === 'POST') {
        return await createClient(request, env);
      }
    }

    if (pathname.match(/^\/api\/clients\/\d+$/)) {
      const id = pathname.split('/')[3];
      if (method === 'PUT') {
        return await updateClient(request, env, id);
      } else if (method === 'DELETE') {
        return await deleteClient(env, id);
      }
    }

    // Productos
    if (pathname === '/api/products') {
      if (method === 'GET') {
        return await getProducts(env);
      } else if (method === 'POST') {
        return await createProduct(request, env);
      }
    }

    if (pathname.match(/^\/api\/products\/\d+$/)) {
      const id = pathname.split('/')[3];
      if (method === 'PUT') {
        return await updateProduct(request, env, id);
      } else if (method === 'DELETE') {
        return await deleteProduct(env, id);
      }
    }

    // Facturas
    if (pathname === '/api/invoices') {
      if (method === 'GET') {
        return await getInvoices(env);
      } else if (method === 'POST') {
        return await createInvoice(request, env);
      }
    }

    if (pathname.match(/^\/api\/invoices\/\d+$/)) {
      const id = pathname.split('/')[3];
      if (method === 'GET') {
        return await getInvoice(env, id);
      } else if (method === 'DELETE') {
        return await deleteInvoice(env, id);
      }
    }

    // Datos del dashboard
    if (pathname === '/api/dashboard') {
      return await getDashboardData(env);
    }

    return new Response('API endpoint not found', { 
      status: 404,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Funciones de la API para Clientes
/**
 * Fallback al almacenamiento local si el KV namespace no está disponible
 */
function getLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function getClients(env) {
  try {
    const clients = await env.BILL_KV.get('clients', 'json') || [];
    return new Response(JSON.stringify(clients), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error fetching clients from KV:', error);
    const clients = getLocalStorage('clients');
    return new Response(JSON.stringify(clients), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function createClient(request, env) {
  try {
    const client = await request.json();
    const clients = await env.BILL_KV.get('clients', 'json') || [];

    client.id = Date.now().toString();
    client.createdAt = new Date().toISOString();

    clients.push(client);
    await env.BILL_KV.put('clients', JSON.stringify(clients));

    return new Response(JSON.stringify(client), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error saving client to KV:', error);
    const client = await request.json();
    const clients = getLocalStorage('clients');

    client.id = Date.now().toString();
    client.createdAt = new Date().toISOString();

    clients.push(client);
    setLocalStorage('clients', clients);

    return new Response(JSON.stringify(client), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function updateClient(request, env, id) {
  const updatedClient = await request.json();
  const clients = await env.BILL_KV.get('clients', 'json') || [];
  
  const index = clients.findIndex(c => c.id === id);
  if (index === -1) {
    return new Response('Client not found', { status: 404 });
  }
  
  clients[index] = { ...clients[index], ...updatedClient, updatedAt: new Date().toISOString() };
  await env.BILL_KV.put('clients', JSON.stringify(clients));
  
  return new Response(JSON.stringify(clients[index]), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function deleteClient(env, id) {
  const clients = await env.BILL_KV.get('clients', 'json') || [];
  const filteredClients = clients.filter(c => c.id !== id);
  
  await env.BILL_KV.put('clients', JSON.stringify(filteredClients));
  
  return new Response('Client deleted', {
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}

// Funciones de la API para Productos
// Modificar las funciones de productos para usar localStorage como respaldo
async function getProducts(env) {
  try {
    const products = await env.BILL_KV.get('products', 'json') || [];
    return new Response(JSON.stringify(products), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error fetching products from KV:', error);
    const products = getLocalStorage('products');
    return new Response(JSON.stringify(products), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function createProduct(request, env) {
  try {
    const product = await request.json();
    const products = await env.BILL_KV.get('products', 'json') || [];

    product.id = Date.now().toString();
    product.createdAt = new Date().toISOString();

    products.push(product);
    await env.BILL_KV.put('products', JSON.stringify(products));

    return new Response(JSON.stringify(product), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error saving product to KV:', error);
    const product = await request.json();
    const products = getLocalStorage('products');

    product.id = Date.now().toString();
    product.createdAt = new Date().toISOString();

    products.push(product);
    setLocalStorage('products', products);

    return new Response(JSON.stringify(product), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function updateProduct(request, env, id) {
  const updatedProduct = await request.json();
  const products = await env.BILL_KV.get('products', 'json') || [];
  
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return new Response('Product not found', { status: 404 });
  }
  
  products[index] = { ...products[index], ...updatedProduct, updatedAt: new Date().toISOString() };
  await env.BILL_KV.put('products', JSON.stringify(products));
  
  return new Response(JSON.stringify(products[index]), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function deleteProduct(env, id) {
  const products = await env.BILL_KV.get('products', 'json') || [];
  const filteredProducts = products.filter(p => p.id !== id);
  
  await env.BILL_KV.put('products', JSON.stringify(filteredProducts));
  
  return new Response('Product deleted', {
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}

// Funciones de la API para Facturas
// Modificar las funciones de facturas para usar localStorage como respaldo
async function getInvoices(env) {
  try {
    const invoices = await env.BILL_KV.get('invoices', 'json') || [];
    return new Response(JSON.stringify(invoices), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error fetching invoices from KV:', error);
    const invoices = getLocalStorage('invoices');
    return new Response(JSON.stringify(invoices), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function createInvoice(request, env) {
  try {
    const invoice = await request.json();
    const invoices = await env.BILL_KV.get('invoices', 'json') || [];

    const invoiceNumber = await getNextInvoiceNumber(env);

    invoice.id = Date.now().toString();
    invoice.number = invoiceNumber;
    invoice.createdAt = new Date().toISOString();

    invoices.push(invoice);
    await env.BILL_KV.put('invoices', JSON.stringify(invoices));

    return new Response(JSON.stringify(invoice), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error saving invoice to KV:', error);
    const invoice = await request.json();
    const invoices = getLocalStorage('invoices');

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    invoice.id = Date.now().toString();
    invoice.number = invoiceNumber;
    invoice.createdAt = new Date().toISOString();

    invoices.push(invoice);
    setLocalStorage('invoices', invoices);

    return new Response(JSON.stringify(invoice), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function getInvoice(env, id) {
  const invoices = await env.BILL_KV.get('invoices', 'json') || [];
  const invoice = invoices.find(i => i.id === id);
  
  if (!invoice) {
    return new Response('Invoice not found', { status: 404 });
  }
  
  return new Response(JSON.stringify(invoice), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function deleteInvoice(env, id) {
  const invoices = await env.BILL_KV.get('invoices', 'json') || [];
  const filteredInvoices = invoices.filter(i => i.id !== id);
  
  await env.BILL_KV.put('invoices', JSON.stringify(filteredInvoices));
  
  return new Response('Invoice deleted', {
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}

// Función para obtener el siguiente número de factura
async function getNextInvoiceNumber(env) {
  const currentNumber = await env.BILL_KV.get('invoice_counter') || '0';
  const nextNumber = parseInt(currentNumber) + 1;
  await env.BILL_KV.put('invoice_counter', nextNumber.toString());
  return `INV-${nextNumber.toString().padStart(6, '0')}`;
}



// Función para obtener datos del dashboard
async function getDashboardData(env) {
  const clients = await env.BILL_KV.get('clients', 'json') || [];
  const products = await env.BILL_KV.get('products', 'json') || [];
  const invoices = await env.BILL_KV.get('invoices', 'json') || [];
  
  const totalSales = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  
  return new Response(JSON.stringify({
    totalClients: clients.length,
    totalProducts: products.length,
    totalInvoices: invoices.length,
    totalSales: totalSales
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
