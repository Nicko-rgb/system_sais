# Sistema SAIS

## Descripción General

**SISTEMA DE ATENCIÓN INTEGRAL DE SALUD - SAIS** es una plataforma integral para la gestión de información en centros de salud, orientada a la administración de pacientes, fichas familiares, citas médicas, turnos de personal, acreditación y mapeo de sectores. El sistema está compuesto por un frontend moderno desarrollado en React y un backend robusto en Node.js/Express, con integración a bases de datos MySQL.

El objetivo principal es digitalizar y optimizar los procesos administrativos y asistenciales, permitiendo un acceso ágil y seguro a la información relevante para el personal de salud y administrativos.

---

## Funcionalidades Principales

### 1. **Gestión de Pacientes**
- Registro, edición y búsqueda avanzada de pacientes.
- Asociación de pacientes a fichas familiares.
- Visualización de datos clínicos, demográficos y responsables.

### 2. **Fichas Familiares**
- Creación y administración de fichas familiares.
- Asignación de jefe de familia y miembros.
- Consulta rápida de la composición familiar y sus datos.

### 3. **Citas Médicas**
- Otorgamiento y gestión de citas para distintas especialidades.
- Visualización de horarios disponibles y bloqueo de horas.
- Registro de motivos de consulta, profesional responsable y seguimiento.

### 4. **Turnos de Personal**
- Visualización y edición de turnos mensuales del personal.
- Filtros por condición, profesión y estado.
- Exportación de reportes y personalización de colores para turnos.

### 5. **Acreditación**
- Módulo para la gestión de acreditaciones de pacientes y familias.

### 6. **Mapa de Sectores**
- Visualización geográfica de sectores y familias en el área de influencia.
- Herramientas para la gestión territorial y asignación de visitas.

### 7. **Gestión de Personal**
- Registro y administración de datos del personal de salud.
- Edición de información y perfiles.

### 8. **Panel de Administración**
- Acceso exclusivo para usuarios administradores.
- Configuración avanzada de parámetros del sistema.

---

## Tecnologías Utilizadas

- **Frontend:** React, Vite, Chakra UI, Material UI, Axios, Lottie, Recharts, React Router, entre otros.
- **Backend:** Node.js, Express, MySQL, JWT, dotenv, multer, moment, PM2 para gestión de procesos.
- **Otros:** Exportación a PDF/Excel, notificaciones, animaciones y gráficos interactivos.

---

## Estructura del Proyecto

- `app_sais/`: Frontend React.
  - `src/pages/`: Vistas principales (Dashboard, FichaFamiliar, Cita1, Turnos, Sectores, etc).
  - `src/components/`: Componentes reutilizables para cada módulo.
  - `src/context/`: Contextos globales (autenticación, configuración).
  - `src/utils/`: Utilidades y helpers.
- `server/`: Backend Node.js/Express.
  - `controllers/`: Lógica de negocio para cada módulo (pacientes, citas, fichas, etc).
  - `routes/`: Rutas de la API REST.
  - `config/`: Configuración de base de datos y scripts SQL.

---

## Instalación y Puesta en Marcha

### Backend

1. Instala las dependencias:
   ```bash
   cd server
   npm install
   ```
2. Configura la base de datos en `server/config/db.js`.
3. Inicia el servidor (recomendado con PM2):
   ```bash
   pm2 start server.js --name sais-server
   ```

### Frontend

1. Instala las dependencias:
   ```bash
   cd app_sais
   npm install
   ```
2. Inicia la aplicación:
   ```bash
   npm run dev
   ```

---

## Público Objetivo

- Personal administrativo y asistencial de centros de salud.
- Áreas de admisión, estadística, coordinación y gestión territorial.

---

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras. 