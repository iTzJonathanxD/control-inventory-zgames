# ZGames - Ecosistema de Aplicaciones

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.4.17-red.svg)](https://nestjs.com/)
[![Angular](https://img.shields.io/badge/Angular-18.x-red.svg)](https://angular.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com/)

## Descripción

Ecosistema completo de aplicaciones para ZGames que incluye:

- **Sistema de Gestión de Inventarios** (Backend NestJS + Frontend Angular)
- **API de WhatsApp Evolution** para comunicaciones automatizadas

## Estructura del Proyecto

```
zgames/
├── inventory-zgames/           # Sistema de Gestión de Inventarios
│   ├── back-inventory-nestjs/  # Backend NestJS
│   └── front-inventory-angular/# Frontend Angular
├── evolution-api-main/         # API WhatsApp Evolution
└── README.md                   # Este archivo
```

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **MySQL** >= 8.0
- **Git**

### Verificar instalaciones:

```bash
node --version
npm --version
mysql --version
git --version
```

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/ZgamesPasantias/control-inventory.git zgames
cd zgames
```

### 2. Configurar Base de Datos MySQL

1. Crear la base de datos:

```sql
CREATE DATABASE zgames_inventario;
CREATE USER 'zgames_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON zgames_inventario.* TO 'zgames_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Backend - Sistema de Inventarios (NestJS)

```bash
# Navegar al directorio del backend
cd inventory-zgames/back-inventory-nestjs

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

Editar el archivo `.env` con tus configuraciones:

```bash
# Entorno
NODE_ENV=development

# Servidor
PORT=3000
API_PREFIX=api

# Base de Datos
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=zgames_user
DATABASE_PASSWORD=tu_password_seguro
DATABASE_NAME=zgames_inventario
DATABASE_SYNCHRONIZE=true

# JWT
JWT_SECRET=tu_clave_secreta_jwt_muy_segura
JWT_EXPIRATION_TIME=1d

# Cloudinary (opcional - para imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 4. Frontend - Sistema de Inventarios (Angular)

```bash
# Navegar al directorio del frontend (desde la raíz)
cd inventory-zgames/front-inventory-angular

# Instalar dependencias
npm install

# Configurar el archivo de entorno (opcional)
# Editar src/environments/environment.ts según sea necesario
```

### 5. Evolution API - WhatsApp (Opcional)

```bash
# Navegar al directorio de Evolution API (desde la raíz)
cd evolution-api-main

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

Editar el archivo `.env` de Evolution API según la documentación oficial.

## Ejecución del Proyecto

### Opción A: Ejecutar Todo de Forma Manual

#### 1. Ejecutar Backend (Terminal 1)

```bash
cd inventory-zgames/back-inventory-nestjs
npm run start:dev
```

El backend estará disponible en: `http://localhost:3000`
Documentación Swagger: `http://localhost:3000/api/docs`

#### 2. Ejecutar Frontend (Terminal 2)

```bash
cd inventory-zgames/front-inventory-angular
npm start
```

El frontend estará disponible en: `http://localhost:4200`

#### 3. Ejecutar Evolution API (Terminal 3) - Opcional

```bash
cd evolution-api-main
npm run start:dev
```

La Evolution API estará disponible según su configuración.

## URLs de Acceso

Una vez ejecutado el proyecto:

- **Frontend (Angular)**: http://localhost:4200
- **Backend (NestJS)**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **Evolution API**: Según configuración (típicamente http://localhost:8080)

## Estructura de Comandos

### Backend (NestJS)

```bash
npm run start:dev    # Desarrollo con hot-reload
npm run start:prod   # Producción
npm run build        # Construir proyecto
npm run test         # Ejecutar pruebas
npm run lint         # Linting
```

### Frontend (Angular)

```bash
npm start            # Desarrollo (ng serve)
npm run build        # Construir para producción
npm test             # Ejecutar pruebas unitarias
npm run e2e          # Pruebas end-to-end
npm run lint         # Linting
```

### Evolution API

```bash
npm run start:dev    # Desarrollo
npm run start:prod   # Producción
npm run build        # Construir proyecto
```

## Solución de Problemas Comunes

### 1. Error de Conexión a Base de Datos

- Verificar que MySQL esté ejecutándose
- Confirmar credenciales en el archivo `.env`
- Verificar que la base de datos existe

### 2. Error de Puerto Ocupado

```bash
# Verificar qué proceso usa el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :4200

# Terminar proceso específico (Windows)
taskkill /PID <PID_NUMBER> /F
```

### 3. Error de Dependencias

```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### 4. Problemas de CORS

- Verificar configuración de CORS en el backend
- Confirmar que las URLs en el frontend apunten al backend correcto

## Variables de Entorno Importantes

### Backend

- `DATABASE_HOST`: Host de la base de datos
- `DATABASE_PORT`: Puerto de MySQL (3306)
- `DATABASE_USER`: Usuario de la base de datos
- `DATABASE_PASSWORD`: Contraseña de la base de datos
- `JWT_SECRET`: Clave secreta para JWT
- `PORT`: Puerto del servidor backend (3000)

### Frontend

- `API_URL`: URL del backend (en environment.ts)
- Configuraciones específicas en `src/environments/`

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## Soporte

Para reportar bugs o solicitar nuevas características, por favor crear un issue en el repositorio.

## Licencia

Este proyecto está bajo la licencia UNLICENSED.

---

**Desarrollado para ZGames** 
