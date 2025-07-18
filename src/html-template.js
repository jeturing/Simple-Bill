/**
 * Template HTML para Simple Bill
 * Este template contiene toda la aplicación de facturación
 */

export const htmlTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Simple Billing System - Cloudflare Worker</title>
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
  .sidebar-transition {
    transition: transform 0.3s ease-in-out;
  }
  .content-transition {
    transition: margin-left 0.3s ease-in-out;
  }
  
  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
    }
    .main-content-mobile {
      margin-left: 0 !important;
      padding: 0.5rem !important;
    }
  }
  
  .step-wizard {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
  }
  
  .step {
    flex: 1;
    text-align: center;
    position: relative;
    padding: 0.5rem;
  }
  
  .step::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -50%;
    width: 100%;
    height: 2px;
    background: #e5e7eb;
    transform: translateY(-50%);
  }
  
  .step:last-child::after {
    display: none;
  }
  
  .step.active {
    color: #3b82f6;
    font-weight: 600;
  }
  
  .step.active::after {
    background: #3b82f6;
  }
  
  .step.completed {
    color: #10b981;
  }
  
  .step.completed::after {
    background: #10b981;
  }
</style>
</head>
<body class="bg-gray-100 min-h-screen">

<!-- Sidebar -->
<div id="sidebar" class="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white p-4 sidebar-transition z-10 sidebar">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-xl font-bold">Simple Billing</h1>
    <button id="toggleSidebar" class="text-white hover:text-gray-300">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  </div>
  
  <nav class="space-y-2">
    <button onclick="showSection('dashboard')" class="w-full text-left px-4 py-3 rounded hover:bg-gray-700 nav-item" data-section="dashboard">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
        </svg>
        Dashboard
      </div>
    </button>
    
    <button onclick="showSection('clients')" class="w-full text-left px-4 py-3 rounded hover:bg-gray-700 nav-item" data-section="clients">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
        </svg>
        Clientes
      </div>
    </button>
    
    <button onclick="showSection('products')" class="w-full text-left px-4 py-3 rounded hover:bg-gray-700 nav-item" data-section="products">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
        Productos
      </div>
    </button>
    
    <button onclick="showSection('invoice')" class="w-full text-left px-4 py-3 rounded hover:bg-gray-700 nav-item" data-section="invoice">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Crear Factura
      </div>
    </button>
    
    <button onclick="showSection('history')" class="w-full text-left px-4 py-3 rounded hover:bg-gray-700 nav-item" data-section="history">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        Historial
      </div>
    </button>
  </nav>
</div>

<!-- Mobile menu button -->
<button id="mobileMenuBtn" class="fixed top-4 left-4 z-20 bg-gray-800 text-white p-2 rounded md:hidden">
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
  </svg>
</button>

<!-- Main Content -->
<div id="mainContent" class="content-transition ml-64 p-6 main-content-mobile">
  
  <!-- Dashboard Section -->
  <section id="dashboard-section" class="section-content">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-6">Dashboard</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-blue-50 p-6 rounded-lg">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Clientes</p>
              <p id="totalClients" class="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div class="bg-green-50 p-6 rounded-lg">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Productos</p>
              <p id="totalProducts" class="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-50 p-6 rounded-lg">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Facturas</p>
              <p id="totalInvoices" class="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div class="bg-purple-50 p-6 rounded-lg">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Ventas</p>
              <p id="totalSales" class="text-2xl font-semibold text-gray-900">$0.00</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-blue-800 mb-4">🚀 Guía de Inicio Rápido</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center">
            <div class="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <span class="text-blue-600 font-bold">1</span>
            </div>
            <h4 class="font-medium text-blue-800">Agregar Clientes</h4>
            <p class="text-sm text-blue-600">Comienza añadiendo tus clientes</p>
          </div>
          <div class="text-center">
            <div class="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <span class="text-blue-600 font-bold">2</span>
            </div>
            <h4 class="font-medium text-blue-800">Agregar Productos</h4>
            <p class="text-sm text-blue-600">Crea tu catálogo de productos</p>
          </div>
          <div class="text-center">
            <div class="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <span class="text-blue-600 font-bold">3</span>
            </div>
            <h4 class="font-medium text-blue-800">Crear Factura</h4>
            <p class="text-sm text-blue-600">Genera facturas profesionales</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Clients Section -->
  <section id="clients-section" class="section-content hidden">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Gestión de Clientes</h2>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 class="text-lg font-semibold mb-4" id="clientFormTitle">Agregar Nuevo Cliente</h3>
        <form id="clientForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input id="clientName" type="text" placeholder="Nombre del cliente *" class="border border-gray-300 rounded px-3 py-2" required />
            <input id="clientEmail" type="email" placeholder="Email" class="border border-gray-300 rounded px-3 py-2" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input id="clientPhone" type="tel" placeholder="Teléfono" class="border border-gray-300 rounded px-3 py-2" />
            <input id="clientAddress" type="text" placeholder="Dirección" class="border border-gray-300 rounded px-3 py-2" />
          </div>
          <div class="flex gap-2 mt-4">
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium">Guardar Cliente</button>
            <button type="button" id="cancelClient" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded hidden">Cancelar</button>
          </div>
        </form>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 px-4 py-2">Nombre</th>
              <th class="border border-gray-300 px-4 py-2">Email</th>
              <th class="border border-gray-300 px-4 py-2">Teléfono</th>
              <th class="border border-gray-300 px-4 py-2">Dirección</th>
              <th class="border border-gray-300 px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody id="clientsTable">
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- Products Section -->
  <section id="products-section" class="section-content hidden">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Gestión de Productos</h2>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 class="text-lg font-semibold mb-4" id="productFormTitle">Agregar Nuevo Producto</h3>
        <form id="productForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input id="productName" type="text" placeholder="Nombre del producto *" class="border border-gray-300 rounded px-3 py-2" required />
            <input id="productPrice" type="number" min="0" step="0.01" placeholder="Precio unitario *" class="border border-gray-300 rounded px-3 py-2" required />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input id="productCode" type="text" placeholder="Código del producto" class="border border-gray-300 rounded px-3 py-2" />
            <input id="productStock" type="number" min="0" placeholder="Stock" class="border border-gray-300 rounded px-3 py-2" />
          </div>
          <div class="mt-4">
            <textarea id="productDescription" placeholder="Descripción" class="w-full border border-gray-300 rounded px-3 py-2 h-20"></textarea>
          </div>
          <div class="flex gap-2 mt-4">
            <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium">Guardar Producto</button>
            <button type="button" id="cancelProduct" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded hidden">Cancelar</button>
          </div>
        </form>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 px-4 py-2">Código</th>
              <th class="border border-gray-300 px-4 py-2">Nombre</th>
              <th class="border border-gray-300 px-4 py-2">Precio</th>
              <th class="border border-gray-300 px-4 py-2">Stock</th>
              <th class="border border-gray-300 px-4 py-2">Descripción</th>
              <th class="border border-gray-300 px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody id="productsTable">
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- Invoice Section -->
  <section id="invoice-section" class="section-content hidden">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Crear Factura</h2>
      </div>
      
      <div class="step-wizard mb-8">
        <div class="step active" id="step1">
          <div>1. Información del Cliente</div>
        </div>
        <div class="step" id="step2">
          <div>2. Agregar Productos</div>
        </div>
        <div class="step" id="step3">
          <div>3. Revisión y Guardado</div>
        </div>
      </div>
      
      <!-- Step 1: Client Selection -->
      <div id="invoiceStep1" class="step-content">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block font-semibold mb-2" for="invoiceNumber">Número de Factura</label>
            <input id="invoiceNumber" type="text" readonly class="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100" />
          </div>
          <div>
            <label class="block font-semibold mb-2" for="invoiceClient">Seleccionar Cliente *</label>
            <select id="invoiceClient" class="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">-- Seleccionar cliente --</option>
            </select>
          </div>
        </div>
        <button onclick="goToStep(2)" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium">Siguiente: Agregar Productos →</button>
      </div>
      
      <!-- Step 2: Add Products -->
      <div id="invoiceStep2" class="step-content hidden">
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 class="text-lg font-semibold mb-4">Agregar Productos a la Factura</h3>
          <div class="flex gap-2 mb-4 flex-wrap">
            <select id="productSelect" class="flex-grow min-w-0 border border-gray-300 rounded px-3 py-2">
              <option value="">-- Seleccionar producto --</option>
            </select>
            <button id="addManualItem" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded whitespace-nowrap">Agregar Item Manual</button>
          </div>
        </div>
        
        <div class="overflow-x-auto mb-6">
          <table class="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr class="bg-gray-200">
                <th class="border border-gray-300 px-2 py-2">Producto</th>
                <th class="border border-gray-300 px-2 py-2 w-20">Cant.</th>
                <th class="border border-gray-300 px-2 py-2 w-28">Precio Unit.</th>
                <th class="border border-gray-300 px-2 py-2 w-28">Total</th>
                <th class="border border-gray-300 px-2 py-2 w-12">Eliminar</th>
              </tr>
            </thead>
            <tbody id="invoiceItems">
            </tbody>
          </table>
        </div>
        
        <div class="flex gap-2">
          <button onclick="goToStep(1)" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded">← Anterior</button>
          <button onclick="goToStep(3)" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium">Siguiente: Revisar →</button>
        </div>
      </div>
      
      <!-- Step 3: Review and Totals -->
      <div id="invoiceStep3" class="step-content hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-4">Descuentos e Impuestos</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1">Descuento (%)</label>
                <input id="discountPercent" type="number" min="0" max="100" step="0.1" value="0" class="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Descuento (Monto Fijo)</label>
                <input id="discountAmount" type="number" min="0" step="0.01" value="0" class="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Impuesto (%)</label>
                <input id="taxPercent" type="number" min="0" max="100" step="0.1" value="0" class="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
            </div>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-4">Resumen de Factura</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>Subtotal:</span>
                <span id="subtotal" class="font-semibold">$0.00</span>
              </div>
              <div class="flex justify-between text-red-600">
                <span>Descuento:</span>
                <span id="discount" class="font-semibold">-$0.00</span>
              </div>
              <div class="flex justify-between">
                <span>Impuesto:</span>
                <span id="tax" class="font-semibold">$0.00</span>
              </div>
              <hr class="my-2">
              <div class="flex justify-between text-lg font-bold">
                <span>TOTAL:</span>
                <span id="total" class="text-blue-600">$0.00</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex gap-2 mt-6">
          <button onclick="goToStep(2)" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded">← Anterior</button>
          <button id="saveInvoice" class="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded font-semibold">Guardar Factura</button>
        </div>
      </div>
    </div>
  </section>

  <!-- History Section -->
  <section id="history-section" class="section-content hidden">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-bold mb-6">Historial de Facturas</h2>
      
      <div class="overflow-x-auto">
        <table class="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 px-4 py-2">Número</th>
              <th class="border border-gray-300 px-4 py-2">Cliente</th>
              <th class="border border-gray-300 px-4 py-2">Fecha</th>
              <th class="border border-gray-300 px-4 py-2">Subtotal</th>
              <th class="border border-gray-300 px-4 py-2">Descuento</th>
              <th class="border border-gray-300 px-4 py-2">Impuesto</th>
              <th class="border border-gray-300 px-4 py-2">Total</th>
              <th class="border border-gray-300 px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody id="invoicesTable">
          </tbody>
        </table>
      </div>
    </div>
  </section>

</div>

<script>
  const { jsPDF } = window.jspdf;

  // API Base URL (será la URL del Worker cuando se despliegue)
  const API_BASE = '';

  // Estado de la aplicación
  let appState = {
    clients: [],
    products: [],
    invoices: [],
    currentStep: 1,
    editingClient: null,
    editingProduct: null,
    invoiceItems: [],
    sidebarVisible: true
  };

  // Funciones de la API
  async function apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(\`\${API_BASE}/api\${endpoint}\`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Navegación
  function showSection(sectionName) {
    document.querySelectorAll('.section-content').forEach(section => {
      section.classList.add('hidden');
    });
    
    document.getElementById(\`\${sectionName}-section\`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('bg-gray-700');
    });
    document.querySelector(\`[data-section="\${sectionName}"]\`).classList.add('bg-gray-700');
    
    if (sectionName === 'dashboard') {
      loadDashboard();
    } else if (sectionName === 'clients') {
      loadClients();
    } else if (sectionName === 'products') {
      loadProducts();
    } else if (sectionName === 'invoice') {
      loadInvoiceData();
    } else if (sectionName === 'history') {
      loadInvoices();
    }
  }

  function toggleSidebar() {
    appState.sidebarVisible = !appState.sidebarVisible;
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (appState.sidebarVisible) {
      sidebar.style.transform = 'translateX(0)';
      mainContent.style.marginLeft = '16rem';
    } else {
      sidebar.style.transform = 'translateX(-100%)';
      mainContent.style.marginLeft = '0';
    }
  }

  // Dashboard
  async function loadDashboard() {
    try {
      const data = await apiCall('/dashboard');
      document.getElementById('totalClients').textContent = data.totalClients;
      document.getElementById('totalProducts').textContent = data.totalProducts;
      document.getElementById('totalInvoices').textContent = data.totalInvoices;
      document.getElementById('totalSales').textContent = \`$\${data.totalSales.toFixed(2)}\`;
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }

  // Clientes
  async function loadClients() {
    try {
      appState.clients = await apiCall('/clients');
      renderClients();
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  function renderClients() {
    const table = document.getElementById('clientsTable');
    table.innerHTML = '';
    
    if (appState.clients.length === 0) {
      table.innerHTML = '<tr><td colspan="5" class="text-center py-4">No hay clientes registrados</td></tr>';
      return;
    }

    appState.clients.forEach((client, index) => {
      const row = document.createElement('tr');
      row.classList.add('hover:bg-gray-50');
      row.innerHTML = \`
        <td class="border border-gray-300 px-4 py-2">\${client.nombre}</td>
        <td class="border border-gray-300 px-4 py-2">\${client.email || '-'}</td>
        <td class="border border-gray-300 px-4 py-2">\${client.telefono || '-'}</td>
        <td class="border border-gray-300 px-4 py-2">\${client.direccion || '-'}</td>
        <td class="border border-gray-300 px-4 py-2">
          <button onclick="editClient('\${client.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-1">Editar</button>
          <button onclick="deleteClient('\${client.id}')" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Eliminar</button>
        </td>
      \`;
      table.appendChild(row);
    });
  }

  async function saveClient(clientData) {
    try {
      if (appState.editingClient) {
        await apiCall(\`/clients/\${appState.editingClient}\`, {
          method: 'PUT',
          body: JSON.stringify(clientData)
        });
      } else {
        await apiCall('/clients', {
          method: 'POST',
          body: JSON.stringify(clientData)
        });
      }
      
      resetClientForm();
      loadClients();
      alert(appState.editingClient ? 'Cliente actualizado' : 'Cliente creado');
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error al guardar cliente');
    }
  }

  function editClient(id) {
    const client = appState.clients.find(c => c.id === id);
    if (client) {
      document.getElementById('clientName').value = client.nombre;
      document.getElementById('clientEmail').value = client.email || '';
      document.getElementById('clientPhone').value = client.telefono || '';
      document.getElementById('clientAddress').value = client.direccion || '';
      document.getElementById('clientFormTitle').textContent = 'Editar Cliente';
      document.getElementById('cancelClient').classList.remove('hidden');
      appState.editingClient = id;
    }
  }

  async function deleteClient(id) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await apiCall(\`/clients/\${id}\`, { method: 'DELETE' });
        loadClients();
        alert('Cliente eliminado');
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error al eliminar cliente');
      }
    }
  }

  function resetClientForm() {
    document.getElementById('clientForm').reset();
    document.getElementById('clientFormTitle').textContent = 'Agregar Nuevo Cliente';
    document.getElementById('cancelClient').classList.add('hidden');
    appState.editingClient = null;
  }

  // Productos
  async function loadProducts() {
    try {
      appState.products = await apiCall('/products');
      renderProducts();
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  function renderProducts() {
    const table = document.getElementById('productsTable');
    table.innerHTML = '';
    
    if (appState.products.length === 0) {
      table.innerHTML = '<tr><td colspan="6" class="text-center py-4">No hay productos registrados</td></tr>';
      return;
    }

    appState.products.forEach((product, index) => {
      const row = document.createElement('tr');
      row.classList.add('hover:bg-gray-50');
      row.innerHTML = \`
        <td class="border border-gray-300 px-4 py-2">\${product.codigo || '-'}</td>
        <td class="border border-gray-300 px-4 py-2">\${product.nombre}</td>
        <td class="border border-gray-300 px-4 py-2">$\${product.precio.toFixed(2)}</td>
        <td class="border border-gray-300 px-4 py-2">\${product.stock || '-'}</td>
        <td class="border border-gray-300 px-4 py-2">\${product.descripcion || '-'}</td>
        <td class="border border-gray-300 px-4 py-2">
          <button onclick="editProduct('\${product.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-1">Editar</button>
          <button onclick="deleteProduct('\${product.id}')" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Eliminar</button>
        </td>
      \`;
      table.appendChild(row);
    });
  }

  async function saveProduct(productData) {
    try {
      if (appState.editingProduct) {
        await apiCall(\`/products/\${appState.editingProduct}\`, {
          method: 'PUT',
          body: JSON.stringify(productData)
        });
      } else {
        await apiCall('/products', {
          method: 'POST',
          body: JSON.stringify(productData)
        });
      }
      
      resetProductForm();
      loadProducts();
      alert(appState.editingProduct ? 'Producto actualizado' : 'Producto creado');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar producto');
    }
  }

  function editProduct(id) {
    const product = appState.products.find(p => p.id === id);
    if (product) {
      document.getElementById('productName').value = product.nombre;
      document.getElementById('productPrice').value = product.precio;
      document.getElementById('productCode').value = product.codigo || '';
      document.getElementById('productStock').value = product.stock || '';
      document.getElementById('productDescription').value = product.descripcion || '';
      document.getElementById('productFormTitle').textContent = 'Editar Producto';
      document.getElementById('cancelProduct').classList.remove('hidden');
      appState.editingProduct = id;
    }
  }

  async function deleteProduct(id) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await apiCall(\`/products/\${id}\`, { method: 'DELETE' });
        loadProducts();
        alert('Producto eliminado');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar producto');
      }
    }
  }

  function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productFormTitle').textContent = 'Agregar Nuevo Producto';
    document.getElementById('cancelProduct').classList.add('hidden');
    appState.editingProduct = null;
  }

  // Facturas
  async function loadInvoiceData() {
    await loadClients();
    await loadProducts();
    populateClientSelect();
    populateProductSelect();
    generateInvoiceNumber();
  }

  function populateClientSelect() {
    const select = document.getElementById('invoiceClient');
    select.innerHTML = '<option value="">-- Seleccionar cliente --</option>';
    
    appState.clients.forEach(client => {
      const option = document.createElement('option');
      option.value = client.id;
      option.textContent = \`\${client.nombre} \${client.email ? '(' + client.email + ')' : ''}\`;
      select.appendChild(option);
    });
  }

  function populateProductSelect() {
    const select = document.getElementById('productSelect');
    select.innerHTML = '<option value="">-- Seleccionar producto --</option>';
    
    appState.products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = \`\${product.nombre} - $\${product.precio.toFixed(2)}\`;
      select.appendChild(option);
    });
  }

  function generateInvoiceNumber() {
    const timestamp = Date.now();
    document.getElementById('invoiceNumber').value = \`INV-\${timestamp.toString().slice(-6)}\`;
  }

  function goToStep(step) {
    // Validaciones
    if (step === 2 && !document.getElementById('invoiceClient').value) {
      alert('Por favor seleccione un cliente');
      return;
    }

    if (step === 3 && appState.invoiceItems.length === 0) {
      alert('Por favor agregue al menos un producto');
      return;
    }

    // Ocultar todos los pasos
    for (let i = 1; i <= 3; i++) {
      document.getElementById(\`invoiceStep\${i}\`).classList.add('hidden');
      document.getElementById(\`step\${i}\`).classList.remove('active', 'completed');
    }

    // Mostrar paso actual
    document.getElementById(\`invoiceStep\${step}\`).classList.remove('hidden');
    document.getElementById(\`step\${step}\`).classList.add('active');

    // Marcar pasos anteriores como completados
    for (let i = 1; i < step; i++) {
      document.getElementById(\`step\${i}\`).classList.add('completed');
    }

    appState.currentStep = step;

    if (step === 3) {
      updateInvoiceTotals();
    }
  }

  function addInvoiceItem(productId = null, name = '', quantity = 1, price = 0) {
    if (productId) {
      const product = appState.products.find(p => p.id === productId);
      if (product) {
        name = product.nombre;
        price = product.precio;
      }
    }

    const item = {
      id: Date.now(),
      name: name || 'Producto manual',
      quantity,
      price
    };

    appState.invoiceItems.push(item);
    renderInvoiceItems();
  }

  function removeInvoiceItem(id) {
    appState.invoiceItems = appState.invoiceItems.filter(item => item.id !== id);
    renderInvoiceItems();
  }

  function renderInvoiceItems() {
    const tbody = document.getElementById('invoiceItems');
    tbody.innerHTML = '';

    appState.invoiceItems.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = \`
        <td class="border border-gray-300 px-2 py-2">
          <input type="text" class="w-full border border-gray-300 rounded px-2 py-1" 
                 value="\${item.name}" 
                 onchange="updateItemName(\${item.id}, this.value)" />
        </td>
        <td class="border border-gray-300 px-2 py-2">
          <input type="number" min="1" class="w-full border border-gray-300 rounded px-2 py-1" 
                 value="\${item.quantity}" 
                 onchange="updateItemQuantity(\${item.id}, this.value)" />
        </td>
        <td class="border border-gray-300 px-2 py-2">
          <input type="number" min="0" step="0.01" class="w-full border border-gray-300 rounded px-2 py-1" 
                 value="\${item.price.toFixed(2)}" 
                 onchange="updateItemPrice(\${item.id}, this.value)" />
        </td>
        <td class="border border-gray-300 px-2 py-2 text-right font-semibold">
          $\${(item.quantity * item.price).toFixed(2)}
        </td>
        <td class="border border-gray-300 px-2 py-2 text-center">
          <button class="text-red-600 hover:text-red-800 font-bold" onclick="removeInvoiceItem(\${item.id})">&times;</button>
        </td>
      \`;
      tbody.appendChild(row);
    });

    updateInvoiceTotals();
  }

  function updateItemName(id, name) {
    const item = appState.invoiceItems.find(i => i.id === id);
    if (item) item.name = name;
  }

  function updateItemQuantity(id, quantity) {
    const item = appState.invoiceItems.find(i => i.id === id);
    if (item) {
      item.quantity = parseInt(quantity) || 1;
      renderInvoiceItems();
    }
  }

  function updateItemPrice(id, price) {
    const item = appState.invoiceItems.find(i => i.id === id);
    if (item) {
      item.price = parseFloat(price) || 0;
      renderInvoiceItems();
    }
  }

  function updateInvoiceTotals() {
    const subtotal = appState.invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
    const taxPercent = parseFloat(document.getElementById('taxPercent').value) || 0;

    const discountFromPercent = subtotal * (discountPercent / 100);
    const totalDiscount = discountFromPercent + discountAmount;
    const subtotalAfterDiscount = subtotal - totalDiscount;
    const tax = subtotalAfterDiscount * (taxPercent / 100);
    const total = subtotalAfterDiscount + tax;

    document.getElementById('subtotal').textContent = \`$\${subtotal.toFixed(2)}\`;
    document.getElementById('discount').textContent = \`-$\${totalDiscount.toFixed(2)}\`;
    document.getElementById('tax').textContent = \`$\${tax.toFixed(2)}\`;
    document.getElementById('total').textContent = \`$\${total.toFixed(2)}\`;
  }

  async function saveInvoice() {
    try {
      const clientId = document.getElementById('invoiceClient').value;
      const client = appState.clients.find(c => c.id === clientId);
      
      if (!client) {
        alert('Cliente no válido');
        return;
      }

      if (appState.invoiceItems.length === 0) {
        alert('Agregue al menos un producto');
        return;
      }

      const subtotal = appState.invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
      const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
      const taxPercent = parseFloat(document.getElementById('taxPercent').value) || 0;

      const discountFromPercent = subtotal * (discountPercent / 100);
      const totalDiscount = discountFromPercent + discountAmount;
      const subtotalAfterDiscount = subtotal - totalDiscount;
      const tax = subtotalAfterDiscount * (taxPercent / 100);
      const total = subtotalAfterDiscount + tax;

      const invoiceData = {
        number: document.getElementById('invoiceNumber').value,
        client,
        items: appState.invoiceItems,
        subtotal,
        discount: totalDiscount,
        tax,
        total,
        discountPercent,
        discountAmount,
        taxPercent
      };

      await apiCall('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData)
      });

      // Generar PDF
      generateInvoicePDF(invoiceData);

      // Limpiar formulario
      resetInvoiceForm();
      alert('Factura guardada correctamente');

    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error al guardar factura');
    }
  }

  function resetInvoiceForm() {
    document.getElementById('invoiceClient').value = '';
    appState.invoiceItems = [];
    renderInvoiceItems();
    document.getElementById('discountPercent').value = '0';
    document.getElementById('discountAmount').value = '0';
    document.getElementById('taxPercent').value = '0';
    generateInvoiceNumber();
    goToStep(1);
  }

  function generateInvoicePDF(invoice) {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", 14, 30);

    // Información de la empresa
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Mi Empresa", 14, 45);
    doc.text("contacto@miempresa.com", 14, 52);
    doc.text("+123 456 7890", 14, 59);
    doc.text("123 Calle Principal, Ciudad", 14, 66);

    // Número de factura y fecha
    doc.setFont("helvetica", "bold");
    doc.text(\`Factura: \${invoice.number}\`, 120, 45);
    doc.setFont("helvetica", "normal");
    doc.text(\`Fecha: \${new Date().toLocaleDateString()}\`, 120, 52);

    // Información del cliente
    doc.setFont("helvetica", "bold");
    doc.text("FACTURAR A:", 14, 85);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.client.nombre, 14, 92);
    if (invoice.client.email) doc.text(invoice.client.email, 14, 99);
    if (invoice.client.telefono) doc.text(invoice.client.telefono, 14, 106);
    if (invoice.client.direccion) doc.text(invoice.client.direccion, 14, 113);

    // Tabla de productos
    const headers = [["DESCRIPCIÓN", "CANT.", "PRECIO", "TOTAL"]];
    const rows = invoice.items.map(item => [
      item.name,
      item.quantity.toString(),
      \`$\${item.price.toFixed(2)}\`,
      \`$\${(item.quantity * item.price).toFixed(2)}\`
    ]);

    doc.autoTable({
      startY: 125,
      head: headers,
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [240, 240, 240] },
      theme: "grid"
    });

    // Totales
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", 140, finalY);
    doc.text(\`$\${invoice.subtotal.toFixed(2)}\`, 180, finalY, null, null, "right");

    if (invoice.discount > 0) {
      doc.text("Descuento:", 140, finalY + 8);
      doc.text(\`-$\${invoice.discount.toFixed(2)}\`, 180, finalY + 8, null, null, "right");
    }

    if (invoice.tax > 0) {
      doc.text("Impuesto:", 140, finalY + 16);
      doc.text(\`$\${invoice.tax.toFixed(2)}\`, 180, finalY + 16, null, null, "right");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL:", 140, finalY + 28);
    doc.text(\`$\${invoice.total.toFixed(2)}\`, 180, finalY + 28, null, null, "right");

    // Guardar PDF
    doc.save(\`\${invoice.number}.pdf\`);
  }

  // Historial de facturas
  async function loadInvoices() {
    try {
      appState.invoices = await apiCall('/invoices');
      renderInvoices();
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  }

  function renderInvoices() {
    const table = document.getElementById('invoicesTable');
    table.innerHTML = '';
    
    if (appState.invoices.length === 0) {
      table.innerHTML = '<tr><td colspan="8" class="text-center py-4">No hay facturas registradas</td></tr>';
      return;
    }

    appState.invoices.forEach(invoice => {
      const row = document.createElement('tr');
      row.classList.add('hover:bg-gray-50');
      row.innerHTML = \`
        <td class="border border-gray-300 px-4 py-2">\${invoice.number}</td>
        <td class="border border-gray-300 px-4 py-2">\${invoice.client.nombre}</td>
        <td class="border border-gray-300 px-4 py-2">\${new Date(invoice.createdAt).toLocaleDateString()}</td>
        <td class="border border-gray-300 px-4 py-2">$\${invoice.subtotal.toFixed(2)}</td>
        <td class="border border-gray-300 px-4 py-2">$\${invoice.discount.toFixed(2)}</td>
        <td class="border border-gray-300 px-4 py-2">$\${invoice.tax.toFixed(2)}</td>
        <td class="border border-gray-300 px-4 py-2">$\${invoice.total.toFixed(2)}</td>
        <td class="border border-gray-300 px-4 py-2">
          <button onclick="viewInvoice('\${invoice.id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-1">Ver</button>
          <button onclick="deleteInvoice('\${invoice.id}')" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">Eliminar</button>
        </td>
      \`;
      table.appendChild(row);
    });
  }

  async function viewInvoice(id) {
    try {
      const invoice = await apiCall(\`/invoices/\${id}\`);
      generateInvoicePDF(invoice);
    } catch (error) {
      console.error('Error viewing invoice:', error);
      alert('Error al ver factura');
    }
  }

  async function deleteInvoice(id) {
    if (confirm('¿Está seguro de eliminar esta factura?')) {
      try {
        await apiCall(\`/invoices/\${id}\`, { method: 'DELETE' });
        loadInvoices();
        alert('Factura eliminada');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Error al eliminar factura');
      }
    }
  }

  // Event Listeners
  document.addEventListener('DOMContentLoaded', function() {
    // Sidebar
    document.getElementById('toggleSidebar').addEventListener('click', toggleSidebar);
    document.getElementById('mobileMenuBtn').addEventListener('click', toggleSidebar);

    // Clients
    document.getElementById('clientForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const clientData = {
        nombre: formData.get('clientName') || document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        telefono: document.getElementById('clientPhone').value,
        direccion: document.getElementById('clientAddress').value
      };
      saveClient(clientData);
    });

    document.getElementById('cancelClient').addEventListener('click', resetClientForm);

    // Products
    document.getElementById('productForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const productData = {
        nombre: document.getElementById('productName').value,
        precio: parseFloat(document.getElementById('productPrice').value),
        codigo: document.getElementById('productCode').value,
        stock: parseInt(document.getElementById('productStock').value) || 0,
        descripcion: document.getElementById('productDescription').value
      };
      saveProduct(productData);
    });

    document.getElementById('cancelProduct').addEventListener('click', resetProductForm);

    // Invoice
    document.getElementById('productSelect').addEventListener('change', function() {
      if (this.value) {
        addInvoiceItem(this.value);
        this.value = '';
      }
    });

    document.getElementById('addManualItem').addEventListener('click', function() {
      addInvoiceItem();
    });

    document.getElementById('saveInvoice').addEventListener('click', saveInvoice);

    // Discount and tax inputs
    ['discountPercent', 'discountAmount', 'taxPercent'].forEach(id => {
      document.getElementById(id).addEventListener('input', updateInvoiceTotals);
    });

    // Responsive sidebar
    function checkScreenSize() {
      if (window.innerWidth < 768) {
        appState.sidebarVisible = false;
        document.getElementById('sidebar').style.transform = 'translateX(-100%)';
        document.getElementById('mainContent').style.marginLeft = '0';
      } else {
        appState.sidebarVisible = true;
        document.getElementById('sidebar').style.transform = 'translateX(0)';
        document.getElementById('mainContent').style.marginLeft = '16rem';
      }
    }

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // Load initial data
    showSection('dashboard');
  });

  // Expose functions globally
  window.showSection = showSection;
  window.editClient = editClient;
  window.deleteClient = deleteClient;
  window.editProduct = editProduct;
  window.deleteProduct = deleteProduct;
  window.goToStep = goToStep;
  window.addInvoiceItem = addInvoiceItem;
  window.removeInvoiceItem = removeInvoiceItem;
  window.updateItemName = updateItemName;
  window.updateItemQuantity = updateItemQuantity;
  window.updateItemPrice = updateItemPrice;
  window.viewInvoice = viewInvoice;
  window.deleteInvoice = deleteInvoice;
</script>
</body>
</html>`;
