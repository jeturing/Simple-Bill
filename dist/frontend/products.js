const KEY_PRODUCTOS = 'app_factura_productos';
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
    selectProductos.innerHTML = `<option value="">-- Selecciona producto --</option>` +
        productos.map((p, i) => `<option value="${i}">${p.nombre} - $${p.precio.toFixed(2)}</option>`).join('');
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
                // This will be handled by invoice.js, which should be listening for a custom event
                document.dispatchEvent(new CustomEvent('productSelected', { detail: prod }));
                selectProductos.value = '';
            }
        });
    }


    cargarProductos();
    renderProductos();
}
