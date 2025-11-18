# 🌾 AgroCredit - Plataforma de Financiamiento Agrícola Inteligente

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

## 📖 Descripción

**AgroCredit** es una plataforma AgriTech-FinTech que revoluciona el financiamiento agrícola mediante el uso de datos satelitales para evaluar el riesgo crediticio. Seleccionada entre 5 opciones de negocio como la solución más viable para el mercado argentino y brasileño.

### 🎯 Problema que Resuelve

Los bancos tradicionales tienen **dificultad para evaluar el riesgo agrícola** debido a la falta de datos objetivos sobre la salud de los cultivos y la capacidad productiva real de las fincas. Esto resulta en:
- Acceso limitado al crédito para pequeños y medianos productores
- Tasas de interés altas e inequitativas
- Procesos de aprobación largos y burocráticos

### 💡 Solución

AgroCredit utiliza **datos satelitales (NDVI - Índice de Vegetación)** combinados con algoritmos de scoring de riesgo para:
- ✅ Evaluar objetivamente la salud de los cultivos
- ✅ Calcular tasas de interés personalizadas y justas
- ✅ Automatizar la aprobación de préstamos
- ✅ Reducir el riesgo para prestamistas
- ✅ Democratizar el acceso al crédito agrícola

### 💰 Modelo de Negocio

- **Intereses sobre préstamos**: Revenue sharing con prestamistas
- **SaaS**: Fee mensual por hectárea monitoreada
- **Mercado objetivo**: Argentina y Brasil (sectores agrícolas líderes en LATAM)

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

#### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de datos**: SQLite (migrable a PostgreSQL)
- **Autenticación**: JWT (JSON Web Tokens)
- **Seguridad**: bcrypt para passwords

#### Frontend
- **Framework**: React 18
- **Build tool**: Vite
- **Lenguaje**: TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

#### Análisis Satelital
- **Tecnología**: NDVI (Normalized Difference Vegetation Index)
- **Fuentes de datos** (preparado para integración):
  - NASA MODIS
  - Sentinel Hub (ESA)
  - Google Earth Engine
- **MVP**: Simulación basada en algoritmos con patrones realistas

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 20+ y npm
- Git

### 1️⃣ Clonar el Repositorio

```bash
git clone <repository-url>
cd AgriTech
```

### 2️⃣ Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario

# Inicializar base de datos
npm run init-db

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### 3️⃣ Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

---

## 📚 API Documentation

### Endpoints Principales

#### Autenticación

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Juan Pérez",
  "role": "farmer" // or "lender"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Fincas (Farms)

```http
POST /api/farms
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Campo Los Sauces",
  "location": "Pergamino, Buenos Aires",
  "latitude": -33.8897,
  "longitude": -60.5594,
  "total_hectares": 250,
  "crop_type": "soja"
}
```

```http
GET /api/farms
Authorization: Bearer <token>
```

```http
GET /api/farms/:id/satellite
Authorization: Bearer <token>
```

#### Préstamos (Loans)

```http
POST /api/loans
Authorization: Bearer <token>
Content-Type: application/json

{
  "farm_id": 1,
  "amount": 500000,
  "purpose": "Compra de insumos para siembra",
  "duration_months": 12
}
```

```http
GET /api/loans/pending
Authorization: Bearer <token>
```

```http
POST /api/loans/:id/approve
Authorization: Bearer <token>
```

---

## 🧮 Algoritmo de Scoring de Riesgo

El sistema calcula un **score de 0-100** basado en múltiples factores:

### Factores de Evaluación

1. **Datos Satelitales (40%)** - Análisis NDVI promedio de 6 meses
   - NDVI > 0.7 → 90-100 puntos
   - NDVI 0.5-0.7 → 70-90 puntos
   - NDVI 0.3-0.5 → 50-70 puntos
   - NDVI < 0.3 → 0-50 puntos

2. **Tipo de Cultivo (20%)** - Rentabilidad y estabilidad del mercado
   - Soja: 90 puntos
   - Maíz: 85 puntos
   - Arroz: 85 puntos
   - Trigo: 80 puntos
   - Girasol: 75 puntos

3. **Tamaño de la Finca (15%)** - Escala de producción
   - ≥500 ha: 95 puntos
   - ≥200 ha: 85 puntos
   - ≥100 ha: 75 puntos
   - ≥50 ha: 65 puntos

4. **Historial Crediticio (15%)** - Préstamos anteriores
   - Basado en tasa de completación de préstamos previos

5. **Tendencia NDVI (10%)** - Evolución de la salud del cultivo
   - Creciente: 90+ puntos
   - Estable: 70 puntos
   - Decreciente: <50 puntos

### Ratings y Tasas de Interés

| Rating | Score | Tasa Base Anual | Descripción |
|--------|-------|----------------|-------------|
| A | 85-100 | 12% | Excelente - Bajo riesgo |
| B | 70-84 | 15% | Bueno - Riesgo moderado-bajo |
| C | 55-69 | 20% | Aceptable - Riesgo moderado |
| D | 40-54 | 25% | Alto riesgo - Garantías adicionales |
| E | 0-39 | 30% | Muy alto riesgo - No recomendado |

---

## 🎨 Funcionalidades del MVP

### Para Productores (Farmers)

- ✅ Registro y autenticación
- ✅ Gestión de fincas (crear, ver, editar)
- ✅ Visualización de datos satelitales en tiempo real
- ✅ Gráficos de evolución NDVI
- ✅ Solicitud de préstamos con scoring automático
- ✅ Dashboard con métricas clave
- ✅ Seguimiento de solicitudes de préstamo

### Para Prestamistas (Lenders)

- ✅ Dashboard de solicitudes pendientes
- ✅ Análisis detallado de riesgo por solicitud
- ✅ Visualización de factores de scoring
- ✅ Aprobación/rechazo de préstamos
- ✅ Acceso a datos satelitales de las fincas
- ✅ Información completa del productor

### Características Técnicas

- 🔒 Autenticación JWT segura
- 📊 Visualización de datos con gráficos interactivos
- 📱 Diseño responsive (mobile-friendly)
- 🎯 Sistema de roles (farmer/lender)
- 🛡️ Validación de datos en frontend y backend
- 🗄️ Base de datos relacional con integridad referencial

---

## 📊 Modelo de Base de Datos

```sql
users
├── id (PK)
├── email (UNIQUE)
├── password (hashed)
├── name
├── role (farmer | lender | admin)
└── created_at

farms
├── id (PK)
├── user_id (FK → users)
├── name
├── location
├── latitude
├── longitude
├── total_hectares
├── crop_type
└── created_at

satellite_data
├── id (PK)
├── farm_id (FK → farms)
├── date
├── ndvi_value
├── health_status
├── cloud_coverage
└── created_at

loan_requests
├── id (PK)
├── farmer_id (FK → users)
├── farm_id (FK → farms)
├── amount
├── purpose
├── duration_months
├── interest_rate
├── risk_score
├── status (pending | approved | rejected | active | completed)
├── lender_id (FK → users)
├── approved_at
└── created_at
```

---

## 🔮 Roadmap - Próximas Features

### Fase 2 - Integración Real
- [ ] Integración con APIs satelitales reales (Sentinel Hub)
- [ ] Sistema de pagos con Mercado Pago / Stripe
- [ ] Notificaciones por email y SMS
- [ ] Exportación de reportes PDF

### Fase 3 - Escalabilidad
- [ ] Migración a PostgreSQL
- [ ] Sistema de garantías y colaterales
- [ ] Marketplace de prestamistas
- [ ] Machine Learning para predicción de cosechas

### Fase 4 - Expansión
- [ ] App móvil (React Native)
- [ ] Integración con blockchain para trazabilidad
- [ ] API pública para terceros
- [ ] Expansión a México y Colombia

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

---

## 👥 Autores

Desarrollado como MVP de AgriTech-FinTech

---

## 🙏 Agradecimientos

- NASA MODIS por datos satelitales públicos
- ESA Sentinel Hub
- Comunidad open source de Node.js y React

---

## 📞 Contacto

Para consultas sobre el proyecto o colaboraciones, por favor abre un issue en GitHub.

---

**⭐ Si te gusta este proyecto, dale una estrella en GitHub!**
