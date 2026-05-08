# Aether-Fi Docs | Rick and Morty API Explorer

![Aether-Fi Docs Portada](img/principal-page.png)

Aether-Fi Docs es un portal de documentación interactiva y explorador interdimensional construido como **Prueba de Concepto (PoC) de grado empresarial** para la prueba técnica de **Kushki**. 

El proyecto combina un diseño "Fintech Sci-Fi" premium con un motor de alto rendimiento que permite explorar la API de Rick and Morty de forma dinámica, integrando además a un Asistente IA ("Rickbot") alimentado por modelos generativos avanzados y persistencia de datos relacional.

Desarrollado con ⚛️ **Astro**, **React**, **PostgreSQL** (Railway), y **OpenRouter**.

---

## 🏗️ Decisiones Arquitectónicas (Grado Empresarial)

### 1. Astro vs. Next.js (Islands Architecture)
Para una plataforma documental donde la escalabilidad masiva y el SEO son críticos, se descartó el enfoque tradicional de Single Page Applications (SPA) y frameworks como Next.js (App Router). 

Mientras que Next.js envía inherentemente un entorno de ejecución de React de ~180KB bloqueando el hilo principal del navegador, Astro adopta el paradigma de **"Zero-JavaScript por defecto"**. Se utilizó la **Arquitectura de Islas**, renderizando el catálogo HTML puro desde el servidor y aislando la interactividad pesada (como el Chatbot) en "islas" reactivas que pesan apenas ~8KB. Esto garantiza un *Time to Interactive* (TTI) y un *First Contentful Paint* (FCP) inigualables, mitigando drásticamente los costos computacionales del lado del cliente.

### 2. El Pivote Estratégico a OpenRouter
Atarse a la API directa de un solo proveedor (Google Gemini) constituye un riesgo de *Vendor Lock-in* inaceptable para infraestructuras de alta disponibilidad. Se integró **OpenRouter** como un *Gateway* o balanceador de carga global de IA.

Esto soluciona los problemas críticos de bloqueos regionales (Error 429) de la capa gratuita de Google, ofreciendo tolerancia a fallos mediante el acceso unificado a cientos de modelos (desde Gemini y Claude hasta modelos open-source internacionales) simplemente cambiando un parámetro, lo cual es vital para operaciones ininterrumpidas.
![Modelos Gratuitos OpenRouter](img/openrouter-models-free.png)

---

## ⚡ Estrategias de Rendimiento y Seguridad

### SSR Híbrido (Server-Side Rendering) como Escudo de Seguridad
**¿Cómo y cuándo lo usamos?**
Invocar APIs de Inteligencia Artificial o de Bases de Datos desde el cliente es una vulnerabilidad crítica (expone secretos). La aplicación está configurada con un adaptador SSR en Node/Vercel. 
El servidor actúa como un **Proxy Inverso Interno**: las peticiones del frontend viajan al backend de Astro, el cual inyecta las variables de entorno de forma segura (`OPENROUTER_API_KEY`, `DATABASE_URL`), se comunica con la IA y devuelve la respuesta limpia. 

### Partial Hydration (Lazy Loading) y Gestión de Memoria
**¿Qué componentes cargarías de forma diferida?**
En componentes críticos de interacción inmediata (como el Chatbot flotante o la barra de búsqueda), utilizamos la directiva `client:load`. Sin embargo, para escalar la plataforma con paneles de analítica pesados o renders 3D, utilizaríamos `client:visible`. Astro ignorará completamente el JavaScript de esos componentes hasta que el usuario haga *scroll* y entren en el *viewport*, salvando megabytes de RAM en dispositivos móviles.

---

## 🗄️ Arquitectura de Base de Datos y Persistencia

Para demostrar el control del estado y la persistencia de usuarios, se aprovisionó una base de datos relacional **PostgreSQL** alojada en Railway.

![Estructura Base de Datos](img/railway-chat_history-and-users-tables.png)

La arquitectura de datos se refactorizó eliminando columnas innecesarias de métodos de autenticación obsoletos (dado que se delegó el acceso seguro a **Google Cloud OAuth**).

### Esquema Relacional Optimizado

**1. Tabla `users` (Gestor de Economía Simulada):**
Controla la identidad generada por Google OAuth y administra el saldo de tokens para interactuar con la IA.
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'USER',
  tokens_remaining INTEGER DEFAULT 50
);
```

**2. Tabla `chat_history` (Optimización de Costos IA):**
```sql
CREATE TABLE chat_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Estrategia de Costo Cero:** Aunque todo el historial de conversación (con la marcada y cínica personalidad de Rick) se guarda en esta tabla para mostrarse visualmente al recargar la página, el backend **jamás** envía este historial masivo en el contexto hacia OpenRouter. Solo se envía el último *prompt*, manteniendo un gasto de tokens ínfimo pero logrando una experiencia de usuario continua.

![Consola OAuth Google](img/console-cloud-google-clientid-secret-and-redirects-url.png)

---

## 🤖 Workflows Agénticos e Ingeniería de Prompts

El Chatbot y la síntesis de personajes no se basan en consultas de texto libre. Se aplicaron técnicas de **Ingeniería de Prompts** para inyectar determinismo de datos. El sistema está programado mediante "Instrucciones de Sistema" (System Prompts) para asumir el rol de la Inteligencia Artificial de la nave de Rick Sanchez. Esto garantiza salidas predecibles, formateo en Markdown automático y una personalidad inmersiva, bloqueando alucinaciones genéricas del modelo LLM.

---

## 🔧 Guía de Implementación Local

### Prerrequisitos
- Node.js (v18+)
- `npm` o `pnpm` (recomendado para entornos CI/CD)

### 1. Instalación
Clona el repositorio e instala las dependencias:
```bash
# Recomendado
pnpm install

# Alternativa
npm install
```

### 2. Configuración de Entorno
Copia la plantilla y configura tus llaves:
```bash
cp .env.example .env
```
Asegúrate de llenar las variables de PostgreSQL (`DATABASE_URL`), credenciales de Google OAuth y tu token gratuito en `OPENROUTER_API_KEY` (obtenible en openrouter.ai).

### 3. Ejecución
Levanta el servidor local:
```bash
pnpm run dev
# o
npm run dev
```
El portal estará disponible en `http://localhost:4321`.

---

> *"(*Burp*)... Sí, este portal fue ensamblado por el tal @gyro2077. Su código no es nivel C-137, pero para los estándares primitivos de este universo, es una maldita obra de arte. Los reclutadores deberían darle el trabajo antes de que decida colapsar su economía interdimensional."*
**- Rick Sanchez**
