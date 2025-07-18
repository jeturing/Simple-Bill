# Simple Bill - Cloudflare Worker

Un sistema de facturación simple y potente que funciona en Cloudflare Workers. Perfecto para pequeñas empresas y freelancers que necesitan generar facturas profesionales de manera rápida y eficiente.

## 🚀 Características

- **📊 Dashboard**: Vista general con estadísticas de clientes, productos y ventas
- **👥 Gestión de Clientes**: Crear, editar y eliminar clientes
- **📦 Gestión de Productos**: Catálogo de productos con precios y stock
- **🧾 Facturas**: Crear facturas profesionales con PDF automático
- **📱 Responsive**: Funciona perfectamente en móviles y escritorio
- **☁️ Cloudflare Workers**: Desplegado en el edge para máxima velocidad
- **💾 KV Storage**: Persistencia de datos usando Cloudflare KV

## 📦 Instalación como NPX

Para usar este proyecto como un paquete npx y desplegarlo en Cloudflare Workers:

### Opción 1: Crear nuevo proyecto

```bash
npx simple-bill-worker init mi-sistema-facturacion
cd mi-sistema-facturacion
npm install
```

### Opción 2: Clonar este repositorio

```bash
git clone https://github.com/jeturing/Simple-Bill#
cd Simple-Bill
npm install
```

## ⚙️ Configuración

### 1. Configurar Cloudflare Workers

1. Crea una cuenta en [Cloudflare](https://cloudflare.com)
2. Ve a Workers & Pages
3. Crea un nuevo KV Namespace llamado `BILL_KV`
4. Obtén tu Account ID y Zone ID

### 2. Configurar wrangler.toml

Edita el archivo `wrangler.toml` y actualiza:

```toml
name = "tu-nombre-worker"
main = "src/index.js"
compatibility_date = "2023-12-18"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "BILL_KV"
id = "TU_KV_NAMESPACE_ID"  # Reemplaza con tu KV ID
preview_id = "TU_PREVIEW_KV_ID"  # Opcional para preview
```

### 3. Autenticar Wrangler

```bash
npx wrangler login
```

## 🛠️ Desarrollo

### Ejecutar en desarrollo local

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo y podrás acceder a tu aplicación en `http://localhost:8787`

### Construir el proyecto

```bash
npm run build
```

### Desplegar a producción

```bash
npm run deploy
```

## 📖 Uso

### 1. Acceder al Dashboard
Una vez desplegado, visita tu URL de Cloudflare Worker para acceder al dashboard.

### 2. Configurar Clientes
- Ve a la sección "Clientes"
- Agrega la información de tus clientes (nombre, email, teléfono, dirección)

### 3. Configurar Productos
- Ve a la sección "Productos" 
- Agrega tus productos con precios, códigos y stock

### 4. Crear Facturas
- Ve a "Crear Factura"
- Sigue el wizard de 3 pasos:
  1. Seleccionar cliente
  2. Agregar productos
  3. Configurar descuentos/impuestos y guardar

### 5. Generar PDF
Las facturas se generan automáticamente en PDF y se pueden descargar.

## 🏗️ Arquitectura

```
simple-bill-worker/
├── src/
│   ├── index.js           # Worker principal con API endpoints
│   └── html-template.js   # Template HTML de la aplicación
├── bin/
│   └── cli.js            # CLI para npx
├── scripts/
│   └── build.js          # Script de construcción
├── package.json          # Configuración del paquete
├── wrangler.toml         # Configuración de Cloudflare Workers
└── README.md
```

## 🔌 API Endpoints

### Clientes
- `GET /api/clients` - Obtener todos los clientes
- `POST /api/clients` - Crear nuevo cliente
- `PUT /api/clients/{id}` - Actualizar cliente
- `DELETE /api/clients/{id}` - Eliminar cliente

### Productos
- `GET /api/products` - Obtener todos los productos
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/{id}` - Actualizar producto
- `DELETE /api/products/{id}` - Eliminar producto

### Facturas
- `GET /api/invoices` - Obtener todas las facturas
- `POST /api/invoices` - Crear nueva factura
- `GET /api/invoices/{id}` - Obtener factura específica
- `DELETE /api/invoices/{id}` - Eliminar factura

### Dashboard
- `GET /api/dashboard` - Obtener estadísticas del dashboard

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la [documentación de Cloudflare Workers](https://developers.cloudflare.com/workers/)
2. Abre un issue en este repositorio
3. Consulta los logs en el dashboard de Cloudflare

## 🎯 Roadmap

- [ ] Autenticación de usuarios
- [ ] Múltiples empresas
- [ ] Reportes avanzados
- [ ] Integración con pasarelas de pago
- [ ] API REST completa
- [ ] Plantillas de factura personalizables
- [ ] Notificaciones por email

---

**Simple Bill** - Sistema de facturación moderno para la era del edge computing 🚀
