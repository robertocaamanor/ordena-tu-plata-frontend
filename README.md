# Ordena tu Plata - Frontend

Una aplicación web de gestión financiera personal construida con [Next.js](https://nextjs.org) y TypeScript.

## Características

- 🔐 Sistema de autenticación completo (login/registro)
- 💰 Gestión de gastos e ingresos
- 📊 Panel de control con dashboard
- 💳 Seguimiento de pagos
- 📋 Control de deudas
- 👤 Perfil de usuario
- 🛡️ Rutas protegidas con autenticación

## Estructura del Proyecto

```
contabilizador-frontend/
├── app/                    # App Router de Next.js 13+
│   ├── components/         # Componentes reutilizables
│   │   ├── Navigation.tsx  # Componente de navegación
│   │   └── ProtectedRoute.tsx # HOC para rutas protegidas
│   ├── contexts/          # Contextos de React
│   │   └── AuthContext.tsx # Contexto de autenticación
│   ├── services/          # Servicios y API calls
│   │   └── api.ts         # Configuración de API
│   ├── dashboard/         # Página del dashboard
│   ├── debts/            # Gestión de deudas
│   ├── expenses/         # Gestión de gastos
│   ├── payments/         # Gestión de pagos
│   ├── profile/          # Perfil de usuario
│   ├── login/            # Página de inicio de sesión
│   ├── register/         # Página de registro
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Página de inicio
│   └── globals.css       # Estilos globales
├── public/               # Archivos estáticos
└── configuración...      # Archivos de configuración
```

## Tecnologías Utilizadas

- **Framework**: Next.js 13+ con App Router
- **Lenguaje**: TypeScript
- **Estilos**: CSS Modules / Tailwind CSS (según configuración)
- **Autenticación**: Context API de React
- **Gestión de Estado**: React Context + Hooks
- **Routing**: Next.js App Router con rutas protegidas

## Funcionalidades Principales

### Autenticación
- Registro de nuevos usuarios
- Inicio de sesión seguro
- Contexto de autenticación global
- Rutas protegidas para usuarios autenticados

### Gestión Financiera
- **Dashboard**: Vista general de la situación financiera
- **Gastos**: Registro y seguimiento de gastos
- **Pagos**: Control de pagos realizados
- **Deudas**: Gestión de deudas pendientes
- **Perfil**: Configuración de cuenta de usuario

## Instalación y Configuración

### Prerrequisitos

- Node.js 18.0 o superior
- npm, yarn, pnpm o bun
- Un backend API para la gestión de datos (configurar en `app/services/api.ts`)

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/robertocaamanor/ordena-tu-plata-frontend.git
   cd contabilizador-frontend
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configura las variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   # URL del backend API
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   
   # Configuración de autenticación (opcional)
   NEXTAUTH_SECRET=tu-clave-secreta-aqui
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Ejecuta el servidor de desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   ```

5. **Abre la aplicación**
   
   Visita [http://localhost:3000](http://localhost:3000) en tu navegador.

### Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run start    # Inicia el servidor de producción
npm run lint     # Ejecuta el linter
npm run type-check # Verifica los tipos de TypeScript
```

## Despliegue

### Despliegue en Vercel (Recomendado)

1. **Conecta tu repositorio**
   - Ve a [Vercel](https://vercel.com/new)
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio `ordena-tu-plata-frontend`

2. **Configura las variables de entorno**
   ```env
   NEXT_PUBLIC_API_URL=https://tu-backend-api.com/api
   NEXTAUTH_SECRET=clave-secreta-produccion
   NEXTAUTH_URL=https://tu-dominio.vercel.app
   ```

3. **Despliega automáticamente**
   - Vercel detectará automáticamente que es un proyecto Next.js
   - Cada push a la rama `main` desplegará automáticamente

### Despliegue en Netlify

1. **Conecta tu repositorio**
   - Ve a [Netlify](https://app.netlify.com/start)
   - Conecta tu repositorio de GitHub

2. **Configura los ajustes de build**
   ```
   Build command: npm run build
   Publish directory: out
   ```

3. **Configura las variables de entorno** en el panel de Netlify

### Despliegue en Railway

1. **Conecta tu repositorio**
   - Ve a [Railway](https://railway.app)
   - Conecta tu repositorio de GitHub

2. **Configura las variables de entorno**
3. **Railway detectará automáticamente la configuración de Next.js**

### Despliegue Manual

Para despliegue en tu propio servidor:

```bash
# Construye la aplicación
npm run build

# Inicia el servidor de producción
npm start
```

## Configuración del Backend

Esta aplicación frontend requiere un backend API. Asegúrate de configurar:

1. **Endpoints requeridos** en tu backend:
   ```
   POST /api/auth/login
   POST /api/auth/register
   GET  /api/auth/profile
   GET  /api/dashboard
   CRUD /api/expenses
   CRUD /api/payments
   CRUD /api/debts
   ```

2. **CORS configurado** para permitir peticiones desde tu dominio frontend

3. **Autenticación JWT** o el sistema de autenticación que uses

4. **URL del backend** configurada correctamente en las variables de entorno
