const KEY_EMPRESA = 'app_factura_empresa';
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
}
