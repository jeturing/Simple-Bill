/**
 * Simple Bill - Cloudflare Worker
 * Sistema de facturación simple para Cloudflare Workers
 */

import { htmlTemplate } from './html-template.js';

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
        return new Response(htmlTemplate, {
          headers: {
            'Content-Type': 'text/html',
            ...corsHeaders
          }
        });
      }

      // API endpoints
      if (url.pathname.startsWith('/api/')) {
        return await handleApiRequest(request, env, url);
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
async function handleApiRequest(request, env, url) {
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
async function getClients(env) {
  const clients = await env.BILL_KV.get('clients', 'json') || [];
  return new Response(JSON.stringify(clients), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function createClient(request, env) {
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
async function getProducts(env) {
  const products = await env.BILL_KV.get('products', 'json') || [];
  return new Response(JSON.stringify(products), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function createProduct(request, env) {
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
async function getInvoices(env) {
  const invoices = await env.BILL_KV.get('invoices', 'json') || [];
  return new Response(JSON.stringify(invoices), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function createInvoice(request, env) {
  const invoice = await request.json();
  const invoices = await env.BILL_KV.get('invoices', 'json') || [];
  
  // Generar número de factura
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
