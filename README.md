# 🏐 WorkoutCeCe - Web & PWA (Portal Entrenador y Atleta)

Frontend oficial de WorkoutCeCe, una solución integral para la gestión de entrenamiento de alto rendimiento. Desarrollada originalmente como un portal administrativo, la plataforma ha evolucionado a una **Aplicación Web Progresiva (PWA) orientada a dispositivos móviles**, unificando las vistas de gestión del cuerpo técnico con la interfaz diaria de ejecución para los deportistas.

---

## ✨ Características Principales

### 📋 Perfil Coach (Desktop First)
* **Panel Administrativo:** Interfaz centralizada para la gestión de escuadras y atletas.
* **Creador de Plantillas (Workout Builder):** Herramienta dinámica para construir rutinas estructuradas por bloques. Control preciso de % de intensidad, RM base, RPE y descansos.
* **Asignación Inteligente:** Motor de programación para agendar sesiones a los atletas con seguimiento en tiempo real de su estado (Pendiente/Completado).
* **Análisis de Biomecánica y Fuerza:** Tracking histórico de saltos (Abalakov, CMJ, SJ) y 1RM (Squat, Bench Press, Deadlift).

### 📱 Perfil Atleta (Mobile First - PWA)
* **Experiencia Nativa (PWA):** Instalable en dispositivos iOS y Android directamente desde el navegador web. Soporte para funcionamiento fluido en redes inestables.
* **Dashboard Diario:** Interfaz inmersiva centrada en el cronograma semanal del atleta.
* **Feedback de Ejecución:** Registro en vivo de RPE post-entrenamiento, tiempos de ejecución y validación de bloques completados.

---

## 🛠️ Stack Tecnológico
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-729B1B?style=for-the-badge&logo=vitest&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing%20Library-E33332?style=for-the-badge&logo=testing-library&logoColor=white)
![Axios](https://img.shields.io/badge/axios-%235A29E4.svg?style=for-the-badge&logo=axios&logoColor=white)

* **Core:** React 19 (JS/JSX), Vite.
* **PWA:** Vite PWA Plugin (Service Workers, Manifest).
* **Enrutamiento:** React Router Dom (con protección de rutas basada en roles JWT).
* **Estilos:** Arquitectura CSS-in-JS y hojas de estilo modulares.
* **Testing:** Vitest (sustituyendo entornos legacy como Karma/Jasmine) y React Testing Library.

---

## 🧪 Aseguramiento de Calidad y Testing (QA)

El proyecto cuenta con una robusta suite de pruebas unitarias y de integración que garantizan la estabilidad del software ante nuevos despliegues:

* **Manejo de Rutas y Seguridad:** Tests de integración sobre componentes de orden superior (`ProtectedRoute.jsx`) falsificando estados de navegación y decodificación de tokens para validar barreras de RBAC.
* **Componentes Asíncronos:** Uso de *Fake Timers* y esperas asíncronas (`waitFor`) para validar el comportamiento del `Dashboard` y la vista del `Atleta` bajo latencia de red simulada.
* **Accesibilidad (A11y):** Verificación estricta de asociación de etiquetas semánticas (`htmlFor` / `id`) en formularios complejos como el *Planificador de Rutinas*, asegurando compatibilidad con lectores de pantalla.
* **Mocking de Entorno:** Aislamiento total de la API utilizando `vi.mock()` sobre Axios para testear la UI sin dependencia del backend.

---

## 📁 Estructura del Proyecto

Arquitectura modular diseñada para escalar de forma eficiente:

```text
src/
├── assets/         # Multimedia y Manifest de la PWA
├── components/     # UI Reutilizable (Coach y Atleta)
├── pages/          # Vistas enrutables (Dashboard, Planificador, AtletaInicio)
├── services/       # Cliente HTTP (api.js, interceptores JWT)
├── styles/         # Sistema de diseño centralizado
└── App.jsx         # Configuración de Router y Providers
```
## 🚀 Instalación y Ejecución

Para correr este proyecto en tu entorno local, sigue estos pasos:

1. Clona el repositorio:
    git clone https://github.com/Naglock/workoutcece-frontend.git

2. Instala las dependencias. Navega a la carpeta del proyecto y ejecuta:
    npm install

3. Configura las variables de entorno. Crea un archivo .env en la raíz del proyecto (si aplica) o asegúrate de que la URL base en src/services/api.js apunte a tu servidor backend local.

4. Inicia el servidor de desarrollo:
    npm run dev

## 🔗 Contacto

**Iván Andrés Huentemilla Moreno**

[![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ivan-huentemilla)
[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Naglock)

---
*Desarrollado para potenciar el rendimiento en la cancha.*
