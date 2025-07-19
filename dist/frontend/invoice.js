import { getClient } from './clients.js';
import { generatePDF } from './pdf.js';

const KEY_FACTURAS = 'app_factura_facturas';
const KEY_CODIGO = 'app_factura_codigo';

let facturas = [];
let codigoFactura = 1;

function cargarFacturas() {
    facturas = JSON.parse(localStorage.getItem(KEY_FACTURAS) || '[]');
    codigoFactura = parseInt(localStorage.getItem(KEY_CODIGO) || '1');
}

function guardarFacturas() {
    localStorage.setItem(KEY_FACTURAS, JSON.stringify(facturas));
    localStorage.setItem(KEY_CODIGO, codigoFactura.toString());
}

function actualizarCodigoFactura() {
    const codigoFacturaInput = document.getElementById('codigoFactura');
    if(codigoFacturaInput) codigoFacturaInput.value = 'FAC-' + codigoFactura.toString().padStart(6, '0');
}

function renderFacturasGuardadas() {
    const tbodyFacturasGuardadas = document.getElementById('tbodyFacturasGuardadas');
    if (!tbodyFacturasGuardadas) return;
    tbodyFacturasGuardadas.innerHTML = '';
    if (facturas.length === 0) {
        tbodyFacturasGuardadas.innerHTML = `<tr><td colspan="5" class="text-center py-4">No hay facturas guardadas</td></tr>`;
        return;
    }
    facturas.forEach((f, i) => {
        const tr = document.createElement('tr');
        tr.classList.add('hover:bg-gray-100');
        tr.innerHTML = `
            <td class="border px-2 py-1">${f.codigo}</td>
            <td class="border px-2 py-1">${f.cliente.nombre}</td>
            <td class="border px-2 py-1">${f.fecha}</td>
            <td class="border px-2 py-1">$${f.total.toFixed(2)}</td>
            <td class="border px-2 py-1 text-center">
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded imprimirBtn" data-index="${i}">Imprimir</button>
            </td>
        `;
        tbodyFacturasGuardadas.appendChild(tr);
    });

    tbodyFacturasGuardadas.querySelectorAll('.imprimirBtn').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(e.target.dataset.index);
            generatePDF(facturas[idx], true); // true for preview
        });
    });
}

function agregarLineaFactura(nombre = '', cantidad = 1, precio = 0) {
    const tbodyFacturaProductos = document.getElementById('tbodyFacturaProductos');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border px-2 py-1"><input type="text" class="w-full border border-gray-300 rounded px-1 py-1 productoNombre" value="${nombre}" placeholder="Nombre producto" /></td>
      <td class="border px-2 py-1 w-20"><input type="number" min="1" class="w-full border border-gray-300 rounded px-1 py-1 productoCantidad" value="${cantidad}" /></td>
      <td class="border px-2 py-1 w-28"><input type="number" min="0" step="0.01" class="w-full border border-gray-300 rounded px-1 py-1 productoPrecio" value="${precio.toFixed(2)}" /></td>
      <td class="border px-2 py-1 w-28 productoSubtotal">$0.00</td>
      <td class="border px-2 py-1 w-12 text-center"><button class="text-red-600 font-bold eliminarLinea">&times;</button></td>
    `;
    tbodyFacturaProductos.appendChild(tr);
    actualizarSubtotal(tr);
    tr.querySelectorAll('input').forEach(input => input.oninput = () => actualizarSubtotal(tr));
    tr.querySelector('.eliminarLinea').onclick = () => {
        tr.remove();
        actualizarTotalFactura();
    };
    actualizarTotalFactura();
}

function actualizarSubtotal(tr) {
    const cant = parseInt(tr.querySelector('.productoCantidad').value) || 0;
    const precio = parseFloat(tr.querySelector('.productoPrecio').value) || 0;
    tr.querySelector('.productoSubtotal').textContent = '$' + (cant * precio).toFixed(2);
    actualizarTotalFactura();
}

function actualizarTotalFactura() {
    const totalFacturaEl = document.getElementById('totalFactura');
    let total = 0;
    document.querySelectorAll('#tbodyFacturaProductos tr').forEach(tr => {
        total += parseFloat(tr.querySelector('.productoSubtotal').textContent.replace('$', '')) || 0;
    });
    if(totalFacturaEl) totalFacturaEl.textContent = '$' + total.toFixed(2);
}

export function init() {
    const btnGuardarFactura = document.getElementById('btnGuardarFactura');
    const btnAgregarLinea = document.getElementById('btnAgregarLinea');
    const facturaClienteSelect = document.getElementById('facturaCliente');
    const tbodyFacturaProductos = document.getElementById('tbodyFacturaProductos');

    if (btnAgregarLinea) {
        btnAgregarLinea.addEventListener('click', () => agregarLineaFactura());
    }
    
    document.addEventListener('productSelected', (e) => {
        const prod = e.detail;
        agregarLineaFactura(prod.nombre, 1, prod.precio);
    });

    if (btnGuardarFactura) {
        btnGuardarFactura.addEventListener('click', () => {
            const clienteIdx = facturaClienteSelect.value;
            if (clienteIdx === '') {
                alert('Debe seleccionar un cliente para la factura');
                return;
            }
            const cliente = getClient(clienteIdx);
            const lineas = [];
            let hayLineaValida = false;
            tbodyFacturaProductos.querySelectorAll('tr').forEach(tr => {
                const nombre = tr.querySelector('.productoNombre').value.trim();
                const cant = parseInt(tr.querySelector('.productoCantidad').value);
                const precio = parseFloat(tr.querySelector('.productoPrecio').value);
                if (nombre && !isNaN(cant) && cant > 0 && !isNaN(precio) && precio >= 0) {
                    hayLineaValida = true;
                    lineas.push({ nombre, cantidad: cant, precio });
                }
            });

            if (!hayLineaValida) {
                alert('Debe agregar al menos una línea de producto válida');
                return;
            }

            const total = parseFloat(document.getElementById('totalFactura').textContent.replace('$', '')) || 0;
            const fecha = new Date().toLocaleDateString();
            const factura = {
                codigo: document.getElementById('codigoFactura').value,
                cliente,
                productos: lineas,
                total,
                fecha
            };

            facturas.push(factura);
            codigoFactura++;
            guardarFacturas();
            facturaClienteSelect.value = '';
            tbodyFacturaProductos.innerHTML = '';
            actualizarTotalFactura();
            actualizarCodigoFactura();
            renderFacturasGuardadas();
            alert('Factura guardada y PDF generado');
            generatePDF(factura, true);
        });
    }

    cargarFacturas();
    actualizarCodigoFactura();
    renderFacturasGuardadas();
}
