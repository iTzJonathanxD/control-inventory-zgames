# ZGames Inventory Management System - Backend

[![NestJS](https://img.shields.io/badge/NestJS-10.4.17-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-green.svg)](https://jwt.io/)

## Descripción

Sistema backend para la gestión de inventarios de ZGames, construido con el framework NestJS. Implementa una arquitectura modular basada en Domain-Driven Design (DDD) con patrones Repository y Service Layer, siguiendo las mejores prácticas del desarrollo backend moderno.

## Arquitectura: Modular por Capas

El proyecto sigue una **Arquitectura Modular por Capas** que combina:

- **Domain-Driven Design (DDD)** - Diseño orientado al dominio
- **Repository Pattern** - Abstracción del acceso a datos
- **Service Layer Pattern** - Capa de lógica de negocio
- **Dependency Injection** - Inyección de dependencias
- **Response Standardization** - Estandarización de respuestas

### Patrones de Diseño Implementados

1. **Repository Pattern**: Abstrae el acceso a datos
2. **Service Layer**: Centraliza la lógica de negocio
3. **Decorator Pattern**: Para autenticación y autorización
4. **Factory Pattern**: Para respuestas estandarizadas
5. **Module Pattern**: Organización modular de NestJS

## Estructura del Proyecto

```
back-inventory-nestjs/
├── .env                           # Variables de entorno
├── .env.example                   # Plantilla de variables de entorno
├── src/
│   ├── config/                    # Archivos de configuración
│   │   ├── configuration.ts          # Configuración principal
│   │   └── validation.schema.ts      # Validación de entorno
│   │
│   ├── common/                    # Servicios y utilidades compartidas
│   │   ├── constants/             # Constantes de mensajes
│   │   ├── decorators/            # Decoradores personalizados
│   │   ├── filters/               # Filtros de excepciones
│   │   ├── guards/                # Guards de autenticación
│   │   ├── interceptors/          # Interceptores
│   │   ├── interfaces/            # Interfaces globales
│   │   ├── pipes/                 # Pipes de validación
│   │   └── services/              # Servicios comunes
│   │       ├── common-services.module.ts
│   │       ├── crud.service.ts       # Servicio CRUD genérico
│   │       └── response.service.ts   # Estandarización de respuestas
│   │
│   ├── core/                      # Entidades base y logger
│   │   ├── base-entity.ts            # Entidad base con timestamps
│   │   └── logger/                # Sistema de logging
│   │
│   ├── database/                  # Configuración de base de datos
│   │   └── database.module.ts        # Configuración TypeORM
│   │
│   ├── modules/                   # Módulos del dominio
│   │   ├── auth/                  # Autenticación
│   │   ├── users/                 # Gestión de usuarios
│   │   ├── roles/                 # Roles del sistema
│   │   ├── permissions/           # Permisos
│   │   ├── role-permissions/      # Relaciones rol-permiso
│   │   ├── company/               # Empresas
│   │   ├── category/              # Categorías de productos
│   │   ├── products/              # Productos
│   │   ├── inventory-movements/   # Movimientos de inventario
│   │   └── modules/               # Módulos del sistema
│   │
│   ├── main.ts                    # Punto de entrada de la aplicación
│   └── app.module.ts              # Módulo principal de la aplicación
│
├── test/                          # Pruebas E2E
├── uploads/                       # Archivos subidos
└── package.json                   # Dependencias y scripts
```

## Patrón Modular

Cada módulo sigue una estructura consistente:

```
nombre-modulo/
├── nombre-modulo.module.ts        # Configuración del módulo
├── nombre-modulo.controller.ts    # Controlador REST
├── nombre-modulo.service.ts       # Lógica de negocio
├── nombre-modulo.repository.ts    # Acceso a datos
├── dto/                           # Objetos de Transferencia de Datos
│   ├── create-module.dto.ts
│   └── update-module.dto.ts
└── entities/                      # Entidades de base de datos
    └── nombre-modulo.entity.ts
```

## Tecnologías Principales

### Framework Backend

- **NestJS 10.4.17** - Framework principal
- **TypeScript 5.x** - Lenguaje de programación
- **Node.js** - Entorno de ejecución

### Base de Datos

- **MySQL 8.0+** - Base de datos principal
- **TypeORM 0.3.24** - ORM (Object-Relational Mapping)

### Autenticación y Seguridad

- **JWT (JSON Web Tokens)** - Autenticación
- **bcrypt 6.0.0** - Hashing de contraseñas
- **Passport.js** - Estrategias de autenticación

### Validación y Transformación

- **class-validator 0.14.2** - Validación de DTOs
- **class-transformer 0.5.1** - Transformación de objetos
- **Joi** - Validación de variables de entorno

### Documentación API

- **Swagger/OpenAPI** - Documentación automática de la API
- **swagger-ui-express** - Interfaz web para Swagger

## Características Principales

### Sistema de Autenticación

- Login basado en JWT
- Protección de rutas
- Decorador @Public() para rutas públicas
- JwtAuthGuard para protección de endpoints
- Sistema de bloqueo por intentos fallidos

### Gestión de Usuarios

- Operaciones CRUD completas de usuarios
- Sistema de roles y permisos
- Bloqueo de cuentas por intentos fallidos
- Filtros avanzados y paginación
- Gestión de perfiles de usuario

### Gestión de Empresas

- Operaciones CRUD de empresas
- Relaciones con usuarios
- Estado activo/inactivo
- Filtrado por múltiples criterios

### Gestión de Productos

- CRUD completo de productos
- Categorización de productos
- Control de stock (mínimo y actual)
- Precios y códigos únicos
- Filtrado por múltiples criterios
- Gestión de imágenes de productos

### Movimientos de Inventario

- Registro de entradas, salidas y ajustes
- Trazabilidad completa de movimientos
- Estadísticas de movimientos
- Filtros por fecha y tipo
- Relaciones con productos y usuarios

### Sistema de Roles y Permisos

- Roles dinámicos
- Permisos granulares por módulo
- Asignación flexible de permisos
- Control de acceso basado en roles (RBAC)

## Servicios Comunes

### ResponseService

Estandariza todas las respuestas de la API:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: {
    text: string;
    type: 'success' | 'error' | 'warning' | 'info';
  };
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### CrudService

Servicio genérico que proporciona operaciones CRUD básicas para todas las entidades:

```typescript
// Ejemplos de uso
const users = await crudService.findAll(User, filters, pagination);
const user = await crudService.findById(User, id);
const newUser = await crudService.create(User, createUserDto);
```

## Sistema de Seguridad

### Guards Implementados

- **JwtAuthGuard**: Validación de tokens JWT
- **RolesGuard**: Control de acceso basado en roles

### Decoradores Personalizados

- **@Public()**: Marca rutas como públicas
- **@GetUser()**: Obtiene el usuario autenticado
- **@Roles()**: Define roles requeridos para acceder a un endpoint

### Middlewares de Seguridad

- **LoggingMiddleware**: Registra todas las peticiones
- **CorsMiddleware**: Maneja las políticas CORS
- **HelmetMiddleware**: Agrega headers de seguridad

## Base de Datos

### Entidades Principales

1. **Users** - Usuarios del sistema
2. **Roles** - Roles de usuario
3. **Permissions** - Permisos del sistema
4. **RolePermissions** - Relación N:M rol-permiso
5. **Companies** - Empresas
6. **Categories** - Categorías de productos
7. **Products** - Productos del inventario
8. **InventoryMovements** - Movimientos de stock
9. **Modules** - Módulos del sistema

### Relaciones

- **Users** → **Roles** (N:1)
- **Users** → **Companies** (N:1)
- **Products** → **Categories** (N:1)
- **InventoryMovements** → **Products** (N:1)
- **InventoryMovements** → **Users** (N:1)
- **Roles** ↔ **Permissions** (N:M)

## Configuración

### Variables de Entorno (.env)

```bash
# Entorno
NODE_ENV=development

# Servidor
PORT=3000
API_PREFIX=api

# Base de Datos
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=tu_contraseña
DATABASE_NAME=zgames_inventario
DATABASE_SYNCHRONIZE=false

# JWT
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRATION_TIME=1d

# Cloudinary (para imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Configuración de la aplicación
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_FORMATS=jpg,jpeg,png,webp
```

## Instalación y Uso

### 1. Clonar el repositorio

```bash
git clone https://github.com/ZgamesPasantias/control-inventory.git
cd inventory-zgames/back-inventory-nestjs
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus configuraciones específicas
```

### 4. Configurar base de datos

- Crear base de datos MySQL
- Actualizar credenciales en .env
- Ejecutar migraciones si están disponibles

### 5. Ejecutar en desarrollo

```bash
# Desarrollo con hot-reload
npm run start:dev

# Desarrollo con debug
npm run start:debug

# Producción
npm run start:prod
```

La API estará disponible en `http://localhost:3000/api`

### 6. Documentación Swagger

Una vez ejecutándose, puedes acceder a la documentación interactiva en:

```
http://localhost:3000/api/docs
```

## Comandos Disponibles

```bash
# Desarrollo
npm run start:dev          # Inicia en modo desarrollo con watch
npm run start:debug        # Inicia en modo debug

# Construcción
npm run build              # Construye el proyecto

# Producción
npm run start:prod         # Inicia en modo producción

# Pruebas
npm run test               # Ejecuta pruebas unitarias
npm run test:watch         # Ejecuta pruebas en modo watch
npm run test:cov           # Ejecuta pruebas con cobertura
npm run test:e2e           # Ejecuta pruebas end-to-end

# Linting y formato
npm run lint               # Ejecuta ESLint
npm run format             # Formatea el código con Prettier
```

## Endpoints de la API

### Autenticación

**Base URL:** `/api/auth`

- `POST /login` - Inicio de sesión de usuario
- `GET /get-me-user` - Obtener perfil del usuario actual
- `GET /user-permissions` - Obtener permisos del usuario
- `GET /user-modules-permissions` - Obtener permisos de módulos del usuario
- `GET /user-role-permission` - Obtener permisos de rol del usuario

### Usuarios

**Base URL:** `/api/user`

- `POST /create` - Crear usuario
- `GET /get-all` - Listar todos los usuarios (con paginación y filtros)
- `GET /:id` - Obtener usuario por ID
- `PATCH /update-user/:id` - Actualizar usuario
- `PATCH /update-profile` - Actualizar perfil del usuario actual
- `PUT /change-password` - Cambiar contraseña
- `PUT /toggle-status/:id` - Alternar estado del usuario
- `PUT /toggle-lock/:id` - Alternar bloqueo del usuario

### Productos

**Base URL:** `/api/products`

- `POST /create` - Crear producto
- `GET /get-all` - Listar todos los productos (con paginación y filtros)
- `GET /low-stock` - Obtener productos con stock bajo
- `GET /:id` - Obtener producto por ID
- `PATCH /update/:id` - Actualizar producto
- `PATCH /toggle-status/:id` - Alternar estado del producto
- `DELETE /:id` - Eliminar producto
- `POST /:id/stock-movement` - Crear movimiento de stock para producto

### Movimientos de Inventario

**Base URL:** `/api/inventory-movements`

- `POST /create` - Crear movimiento de inventario
- `GET /get-all` - Listar todos los movimientos (con paginación y filtros)
- `GET /stats` - Obtener estadísticas de movimientos
- `GET /product/:productId` - Obtener movimientos por producto
- `GET /:id` - Obtener movimiento por ID
- `PUT /update/:id` - Actualizar movimiento

### Categorías

**Base URL:** `/api/categories`

- `POST /create` - Crear categoría
- `GET /get-all` - Listar todas las categorías (con paginación y filtros)
- `GET /:id` - Obtener categoría por ID
- `PATCH /update/:id` - Actualizar categoría
- `PATCH /toggle-status/:id` - Alternar estado de la categoría
- `DELETE /delete/:id` - Eliminar categoría

### Empresas

**Base URL:** `/api/company`

- `POST /create` - Crear empresa
- `GET /get-all` - Listar todas las empresas (con paginación y filtros)
- `GET /:id` - Obtener empresa por ID
- `PATCH /update/:id` - Actualizar empresa
- `PATCH /toggle-status/:id` - Alternar estado de la empresa
- `DELETE /:id` - Eliminar empresa

### Roles y Permisos

**Base URL:** `/api/role` y `/api/permission`

#### Roles

- `POST /role/create` - Crear rol
- `GET /role/get-all` - Listar todos los roles
- `GET /role/:id` - Obtener rol por ID
- `PATCH /role/update/:id` - Actualizar rol
- `PATCH /role/toggle-status/:id` - Alternar estado del rol

#### Permisos

- `POST /permission/create` - Crear permiso
- `GET /permission/get-all` - Listar todos los permisos
- `GET /permission/:id` - Obtener permiso por ID
- `GET /permission/:roleId/modules/:moduleId/permissions` - Obtener permisos por rol y módulo
- `PATCH /permission/update/:id` - Actualizar permiso

## Beneficios de la Arquitectura

### Mantenibilidad

- Código modular y organizado
- Separación clara de responsabilidades
- Patrones consistentes en todos los módulos
- Fácil identificación y corrección de errores

### Escalabilidad

- Estructura preparada para el crecimiento
- Servicios reutilizables
- Módulos independientes
- Fácil adición de nuevas funcionalidades

### Testabilidad

- Inyección de dependencias
- Fácil implementación de mocks
- Pruebas aisladas por módulo
- Cobertura de código completa

### Seguridad

- Autenticación robusta con JWT
- Control granular de permisos
- Validación exhaustiva de datos
- Headers de seguridad implementados
- Protección contra ataques comunes (CORS, XSS, etc.)

### Rendimiento

- Paginación implementada
- Filtros optimizados
- Consultas eficientes con TypeORM
- Cache implementado donde es necesario
- Optimización de consultas N+1

## Flujo de Desarrollo

### Estructura de una Petición Típica

1. **Cliente** realiza petición HTTP → **Controller**
2. **Controller** valida datos (DTOs) → **Service**
3. **Service** ejecuta lógica de negocio → **Repository**
4. **Repository** interactúa con la base de datos
5. **Response** estandarizada se devuelve al cliente

### Convenciones de Código

- **Naming**: camelCase para variables, PascalCase para clases
- **DTOs**: Validación completa con class-validator
- **Responses**: Estandarizadas con ResponseService
- **Errors**: Manejados con filtros globales
- **Logging**: Implementado en todas las operaciones críticas

## Recursos Adicionales

### Documentación

- [NestJS Docs](https://docs.nestjs.com/)
- [TypeORM Docs](https://typeorm.io/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

### Herramientas Recomendadas

- **Postman/Insomnia**: Para testing de APIs
- **MySQL Workbench**: Para gestión de base de datos
- **VS Code**: Con extensiones de NestJS y TypeScript

## Equipo de Desarrollo

**Desarrollado para ZGames** siguiendo las mejores prácticas del desarrollo backend moderno.

### Contribuciones

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una branch para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Reporte de Bugs

Si encuentras algún problema, por favor crea un issue con:

- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es aplicable

---

## Licencia

Este proyecto está bajo la licencia UNLICENSED - ver el archivo [LICENSE](LICENSE) para más detalles.

---

**¿Necesitas ayuda?** Consulta la documentación de cada módulo o revisa los comentarios en el código fuente.
