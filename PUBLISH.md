# Guía de Publicación NPX

## Pasos para convertir y publicar Simple Bill como paquete NPX

### 1. Preparar el paquete

```bash
# Renombrar package.json actual
mv package.json package-dev.json

# Usar la configuración NPX
mv package-npx.json package.json
```

### 2. Inicializar npm (si no tienes cuenta)

```bash
# Crear cuenta en npmjs.com si no tienes una
npm adduser
```

### 3. Configurar el paquete

Edita `package.json` y cambia:
- `name`: Debe ser único en npm (ej: `@tuusuario/simple-bill-worker`)
- `repository.url`: Tu repositorio de GitHub
- `bugs.url`: URL de issues de tu repo
- `homepage`: URL de tu proyecto

### 4. Probar localmente

```bash
# Instalar dependencias
npm install

# Probar el CLI localmente
node bin/cli.js help

# Probar creación de proyecto
node bin/cli.js init test-project
```

### 5. Publicar a npm

```bash
# Verificar que todo está bien
npm pack --dry-run

# Publicar
npm publish
```

### 6. Probar la instalación global

```bash
# Instalar globalmente
npm install -g simple-bill-worker

# O usar directamente con npx
npx simple-bill-worker help
```

## Uso del paquete NPX

### Crear nuevo proyecto

```bash
npx simple-bill-worker init mi-sistema-facturacion
cd mi-sistema-facturacion
npm install
```

### Desarrollo

```bash
npm run dev
```

### Configurar Cloudflare

1. Crear cuenta en Cloudflare
2. Crear KV namespace 
3. Editar `wrangler.toml` con tus datos
4. `npx wrangler login`

### Desplegar

```bash
npm run deploy
```

## Estructura del proyecto generado

```
mi-sistema-facturacion/
├── src/
│   ├── index.js           # Worker principal
│   └── html-template.js   # UI de la aplicación
├── scripts/
│   └── build.js          # Script de construcción
├── package.json          # Dependencias
├── wrangler.toml         # Configuración Cloudflare
└── README.md             # Documentación
```

## Comandos disponibles

- `npx simple-bill-worker init <nombre>` - Crear nuevo proyecto
- `npx simple-bill-worker dev` - Ejecutar en desarrollo
- `npx simple-bill-worker deploy` - Desplegar a producción
- `npx simple-bill-worker help` - Mostrar ayuda

## Actualizar el paquete

```bash
# Cambiar versión en package.json
npm version patch  # o minor, major

# Publicar nueva versión
npm publish
```
