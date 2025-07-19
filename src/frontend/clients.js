import { generatePDF } from './pdf.js';

const KEY_CLIENTES = 'app_factura_clientes';
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
    
    const options = clientes.map((c, i) => `<option value="${i}">${c.nombre} ${c.email ? '(' + c.email + ')' : ''}</option>`).join('');
    
    if(selectClientes) selectClientes.innerHTML = `<option value="">-- Selecciona cliente --</option>${options}`;
    if(facturaClienteSelect) facturaClienteSelect.innerHTML = `<option value="">-- Selecciona cliente --</option>${options}`;
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
}
