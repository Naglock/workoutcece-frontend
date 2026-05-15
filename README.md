# 🏐 WorkoutCeCe - Frontend (Coach)

Aplicación web de gestión de entrenamiento y rendimiento deportivo de alto nivel. Diseñada para conectar a entrenadores (Coaches) con sus atletas, permitiendo una planificación centralizada, seguimiento del 1RM y evaluación de métricas de salto.

## ✨ Características Principales

* **Panel Administrativo del Coach:** Interfaz centralizada para la gestión del equipo.
* **Creador de Plantillas (Workout Builder):** Herramienta dinámica para construir rutinas de entrenamiento divididas por bloques, controlando % de intensidad, RM base, RPE y tiempos de descanso.
* **Asignación Inteligente:** Sistema para asignar plantillas de entrenamiento a atletas específicos con fechas de ejecución.
* **Gestión de Perfiles Deportivos:** Rastreo detallado de métricas clave (Abalakov, CMJ, SJ, RSI) y marcas de fuerza (RM en Squat, Bench Press, Deadlift).
* **Seguridad por Roles:** Vistas y permisos diferenciados mediante JWT para Entrenadores.
* **Sistema de Estilos Globales:** UI limpia, moderna y escalable mediante un sistema de paletas y estilos centralizados sin dependencias externas pesadas.

## 🛠️ Tecnologías Utilizadas
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Axios](https://img.shields.io/badge/axios-%235A29E4.svg?style=for-the-badge&logo=axios&logoColor=white)
* **React (JS/JSX):** Librería principal para la construcción de interfaces de usuario.
* **Axios:** Cliente HTTP para la comunicación fluida con el backend RESTful.
* **CSS-in-JS (Custom):** Arquitectura de estilos globales y modulares gestionada mediante objetos JavaScript (globalStyles.js).

## 📁 Estructura del Proyecto

El proyecto sigue una arquitectura modular y escalable:

    src/
    ├── components/       # Componentes reutilizables (Ej: PlanificadorRutina)
    ├── pages/            # Vistas principales de la aplicación (Ej: RutinasPage)
    ├── services/         # Lógica de conexión a la API (api.js, interceptores)
    ├── styles/           # Sistema de diseño centralizado (globalStyles.js)
    └── ...

## 🚀 Instalación y Ejecución

Para correr este proyecto en tu entorno local, sigue estos pasos:

1. Clona el repositorio:
    git clone https://github.com/Naglock/workoutcece-frontend.git

2. Instala las dependencias. Navega a la carpeta del proyecto y ejecuta:
    npm install

3. Configura las variables de entorno. Crea un archivo .env en la raíz del proyecto (si aplica) o asegúrate de que la URL base en src/services/api.js apunte a tu servidor backend local.

4. Inicia el servidor de desarrollo:
    npm run dev

## 🚧 Próximos Pasos (Roadmap)

* Creacion del frontend para el Alumno (movil).

## 🔗 Contacto

**Iván Andrés Huentemilla Moreno**

[![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ivan-huentemilla)
[![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Naglock)

---
*Desarrollado para potenciar el rendimiento en la cancha.*
