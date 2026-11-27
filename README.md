# Sistema de Inscripciones y Reinscripciones

Aplicación web modular para la gestión de inscripciones, reinscripciones, solicitudes, pagos, carga académica, reportes y notificaciones, diseñada para ejecutarse de forma consistente en contenedores y desplegarse en la nube con Kubernetes en Microsoft Azure.

## Tecnologías del Proyecto

| Capa | Tecnología | Detalles |
| :--- | :--- | :--- |
| **Backend** | Spring Boot 4.2.0 (Java 21 + Maven) | API REST modular, Spring Security (JWT + CAPTCHA + `@EnableMethodSecurity`), Spring Data JPA y Actuator |
| **Base de Datos** | PostgreSQL 17 | Almacenamiento relacional, constraints, triggers y datos de prueba |
| **Frontend** | React + Vite (JavaScript) + React Router | Interfaz modular con rutas desacopladas por módulo |
| **Contenedores** | Docker & Docker Compose | Empaquetado y entorno local idéntico para los 8 equipos |
| **Orquestación y Nube** | Kubernetes (`k8s`) + Microsoft Azure | Despliegue final en máquina virtual con contenedores orquestados |

---

## Equipos, Ramas y Módulos Asignados

Para evitar conflictos entre los 8 equipos trabajando al mismo tiempo, **cada equipo trabaja exclusivamente en su rama y dentro de sus carpetas asignadas**:

| Equipo | Rama de Git | Carpetas Asignadas | Responsabilidad |
| :---: | :--- | :--- | :--- |
| **1** | `equipo-1-infra-auth` | `backend/.../common/`, `backend/.../auth/`, `frontend/src/api/`, `frontend/src/shared/`, `frontend/src/modules/auth/`, `k8s/`, archivos raíz | Infraestructura (Docker, k8s, Azure), config, CORS, manejo de errores, DTOs base, login, CAPTCHA, JWT, roles, `SecurityConfig`, cliente HTTP base y layout/rutas protegidas |
| **2** | `equipo-2-alumnos` | `backend/.../alumnos/`, `frontend/src/modules/portal-alumno/` | Portal del alumno: perfil, kárdex, consulta de cita, oferta y armar horario |
| **3** | `equipo-3-reinscripcion` | `backend/.../reinscripcion/`, `frontend/src/modules/reinscripcion/` | Reinscripción: ventana de 20 min, agregar/quitar materias y validaciones |
| **4** | `equipo-4-solicitudes` | `backend/.../solicitudes/`, `frontend/src/modules/solicitudes/`, `frontend/src/modules/coordinacion/` | Solicitudes y coordinación: orden de pago, referencias, factura, casos críticos y atención de casos críticos por el coordinador |
| **5** | `equipo-5-pagos` | `backend/.../pagos/`, `frontend/src/modules/pagos/` | Pagos: adeudos, conciliación, recibo y estados de pago |
| **6** | `equipo-6-academico-bd` | `db/init/`, `db/seed/`, `db/docs/`, `backend/.../academico/` | Base de datos y módulo académico: esquema SQL, entidades compartidas, datos de prueba, diccionario de datos, carreras, materias, grupos, horarios y citas |
| **7** | `equipo-7-reportes` | `backend/.../reportes/`, `frontend/src/modules/reportes/` | Reportes: consultas de reportes, tablero y exportación |
| **8** | `equipo-8-notificaciones` | `backend/.../notificaciones/`, `frontend/src/modules/notificaciones/` | Notificaciones: correos, comprobante PDF, avisos y descarga de comprobantes |

---

## Estructura del Repositorio

```text
sistema-inscripciones/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml / mvnw / mvnw.cmd
│   └── src/main/
│       ├── java/com/nube/inscripciones/
│       │   ├── common/          # Equipo 1 (config, manejo de errores, DTOs base)
│       │   ├── auth/            # Equipo 1 (SecurityConfig ya activo, login, CAPTCHA, JWT)
│       │   ├── alumnos/         # Equipo 2
│       │   ├── reinscripcion/   # Equipo 3
│       │   ├── solicitudes/     # Equipo 4
│       │   ├── pagos/           # Equipo 5
│       │   ├── academico/       # Equipo 6 (incluye entity/ con entidades compartidas)
│       │   ├── reportes/        # Equipo 7
│       │   └── notificaciones/  # Equipo 8
│       │       # Sugerencia dentro de cada módulo:
│       │       # controller/  service/  repository/  entity/  dto/
│       └── resources/
│           └── application.properties
├── db/
│   ├── init/                    # Equipo 6: scripts SQL numerados (01_catalogos.sql, 02_usuarios_roles.sql...)
│   ├── seed/                    # Equipo 6: datos de prueba para desarrollo/demo
│   └── docs/                    # Equipo 6: diagrama ER y diccionario de datos
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf               # Sirve React y redirige /api/ → backend:8080
│   ├── package.json / vite.config.js
│   └── src/
│       ├── App.jsx              # Ya conectado a los routes.jsx de todos los módulos
│       ├── api/client.js        # Equipo 1 (apiFetch con token y VITE_API_URL ya listo)
│       ├── shared/              # Equipo 1 (layout, componentes comunes, rutas protegidas)
│       └── modules/
│           ├── auth/            # Equipo 1 (incluye routes.jsx)
│           ├── portal-alumno/   # Equipo 2 (incluye routes.jsx)
│           ├── reinscripcion/   # Equipo 3 (incluye routes.jsx)
│           ├── solicitudes/     # Equipo 4 (incluye routes.jsx)
│           ├── coordinacion/    # Equipo 4 (incluye routes.jsx)
│           ├── pagos/           # Equipo 5 (incluye routes.jsx)
│           ├── reportes/        # Equipo 7 (incluye routes.jsx)
│           └── notificaciones/  # Equipo 8 (incluye routes.jsx)
│               # Sugerencia dentro de cada módulo:
│               # routes.jsx  pages/  components/  services/
├── k8s/                         # Equipo 1 (manifiestos YAML de Kubernetes)
├── docs/
│   └── api/                     # Contratos de endpoints acordados entre equipos
├── docker-compose.yml           # Equipo 1
├── .env.example                 # Equipo 1
├── .gitignore
└── README.md
```

---

## 1. Requisitos Previos (Instalar una sola vez)

### Obligatorios para todos los equipos
1. **Git**
2. **Visual Studio Code (VS Code)**
3. **Docker Desktop** (Windows/Mac) o **Docker Engine + Compose** (Linux). *Asegúrate de abrir Docker Desktop antes de correr cualquier comando de Docker.*
4. **JDK 21** (para correr Spring Boot localmente; no necesitas instalar Maven aparte porque el proyecto incluye el wrapper `mvnw`).
5. **Node.js (versión LTS)** (para correr React/Vite localmente).
6. **DBeaver, pgAdmin o la extensión de PostgreSQL en VS Code** (para consultar la base de datos).

### Extensiones recomendadas en VS Code
- **Todos:** `Container Tools` (Microsoft, antes *Docker*) — permite ver contenedores encendidos y leer logs con un clic.
- **Backend:** `Extension Pack for Java`, `Spring Boot Extension Pack` y `Thunder Client` (para probar endpoints sin salir de VS Code).
- **Base de Datos:** `PostgreSQL`.
- **Frontend:** `ESLint` y `ES7+ React/Redux/React-Native snippets`.

---

## 2. Configuración Inicial (Solo la primera vez)

1. **Clona el repositorio** (si aún no lo tienes):
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd sistema-inscripciones
   ```
2. **Crea tu archivo `.env` local** copiando la plantilla `.env.example`:
   - **Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```
   - **Mac / Linux / Git Bash:**
```bash
cp .env.example .env
```
   > **IMPORTANTE:** Nunca subas el archivo `.env` a GitHub (ya está bloqueado en `.gitignore`). Este repositorio es público; las contraseñas reales solo se usarán al desplegar en Azure.
3. **Cámbiate a la rama de tu equipo** (ver tabla de equipos arriba):
   ```bash
   git checkout <rama-de-tu-equipo>
   ```
4. **Verifica que todo arranca correctamente** (opcional para validar tu entorno el primer día, se corre desde la raíz):
   ```bash
   docker compose up --build -d
   docker compose ps
   ```
   Deberías ver los 3 contenedores (`inscripciones_db`, `inscripciones_backend`, `inscripciones_frontend`) con estado `Up`.
   - Frontend: `http://localhost:5173` *(redirige a `/login` y las rutas base de cada módulo ya están activas)*
   - Backend (health check): `http://localhost:8080/actuator/health` *(debe responder `{"status":"UP"}`)*
   - Para apagarlos: `docker compose down`

---

## 3. Variables de Entorno (`.env`)

Las variables del archivo `.env` permiten que el código funcione en cualquier laptop y después en Azure **sin tener que editar el código fuente**.

| Variable | Valor local por defecto | Para qué sirve |
| :--- | :--- | :--- |
| `POSTGRES_DB` | `inscripciones_db` | Nombre de la base de datos en PostgreSQL |
| `POSTGRES_USER` | `admin` | Usuario administrador de PostgreSQL |
| `POSTGRES_PASSWORD` | `password_local_123` | Contraseña local de PostgreSQL |
| `POSTGRES_PORT` | `5432` | Puerto expuesto en tu PC *(cámbialo a `5433` en tu `.env` si ya tienes otro Postgres instalado)* |
| `BACKEND_PORT` | `8080` | Puerto donde escucha la API de Spring Boot |
| `JWT_SECRET` | *(cadena de +32 caracteres)* | Llave secreta para firmar tokens de sesión en Spring Security |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Dirección del frontend autorizada a hacer peticiones al backend |
| `VITE_API_URL` | `http://localhost:8080/api` | URL base de la API que consume React |

> **Nota para Equipo 1 (`VITE_API_URL` en producción):** En Vite, el valor de `VITE_API_URL` queda incrustado dentro de los archivos estáticos al construir la imagen (`docker build`). Si se compila con el valor local, en Azure apuntaría a `localhost`. Para el despliegue en producción se debe compilar la imagen usando **`VITE_API_URL=/api`** como ruta relativa; `frontend/nginx.conf` (y el **Ingress** de Kubernetes) ya redirige `/api/` hacia el servicio del backend.

---

## 4. Guía de Trabajo Local (Por Capa)

Para trabajar rápido y con depuración en vivo, **solo corre en Docker los servicios que NO estás editando** y ejecuta tu parte de forma nativa en tu computadora.

### A. Base de Datos — PostgreSQL (Coordina Equipo 6)
1. Levanta únicamente el contenedor de PostgreSQL:
   ```bash
   docker compose up -d db
   ```
2. Conéctate desde DBeaver, pgAdmin o VS Code:
   - **Host:** `localhost` | **Puerto:** `5432` (o el que pusiste en `POSTGRES_PORT`)
   - **Base de datos:** `inscripciones_db`
   - **Usuario:** `admin` | **Contraseña:** `password_local_123`
3. **Esquema y datos de prueba (`db/init/` y `db/seed/`):**
   - La base de datos arranca vacía a propósito. El **Equipo 6** guarda los scripts numerados en orden de ejecución dentro de `db/init/` (ej. `01_catalogos.sql`, `02_usuarios_roles.sql`, `03_academico.sql`, `04_finanzas.sql`, `05_reinscripcion.sql`, `06_notificaciones_bitacora.sql`, `07_triggers_constraints.sql`) y los datos de prueba en `db/seed/`.
   - **Regla crítica de Docker:** PostgreSQL solo ejecuta los archivos de `db/init/` cuando el volumen está completamente vacío. Cada vez que se actualice un `.sql` y quieras aplicarlo desde cero, ejecuta:
```bash
docker compose down -v
docker compose up -d db
```
     *(La bandera `-v` borra los datos viejos para que Postgres vuelva a correr los scripts).*
4. **Entregable clave del Equipo 6:** Publicar el diagrama ER y el diccionario de datos en `db/docs/` con los nombres exactos de tablas, columnas y roles para que los demás equipos programen sus módulos sin errores.

> **Notas importantes sobre `db/init/` (Reglas para el Equipo 6):**
> - **Aviso al grupo:** Siempre que modifiquen un script en `db/init/`, deben avisar en el grupo, ya que todos los equipos tendrán que correr `docker compose down -v` y perderán sus datos locales.
> - **Congelamiento antes de producción:** En la VM de Azure, aplicar cambios en `db/init/` implica borrar el volumen de PostgreSQL; por lo tanto, **el esquema de base de datos debe quedar congelado antes del despliegue final**.

---

### B. Backend — Spring Boot (Cada equipo en su módulo dentro de `backend/`)
El proyecto ya está configurado con **Spring Boot 4.2.0, Java 21, Maven** y **`SecurityConfig.java` activo** (`@EnableMethodSecurity`, CORS configurado desde `.env` y `/actuator/health` público).

1. Levanta solo la base de datos en Docker:
   ```bash
   docker compose up -d db
   ```
2. Ejecuta Spring Boot desde VS Code o desde la terminal dentro de `backend/`:
   - **Windows (PowerShell):**
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
   - **Mac / Linux:**
```bash
cd backend
./mvnw spring-boot:run
```
3. **Reglas obligatorias:**
   - **Prefijo `/api` en todos los controllers:** Todos los endpoints deben empezar con `/api/` (ej. `@RequestMapping("/api/alumnos")`, `@RequestMapping("/api/pagos")`) para que funcione el proxy de Nginx/Ingress en producción.
   - **Permisos por módulo (`@PreAuthorize`):** `@EnableMethodSecurity` ya está activo en `SecurityConfig.java`. Mientras el Equipo 1 termina el filtro JWT, `SecurityConfig` permite probar endpoints sin bloqueo; en cuanto JWT esté en `main`, cada equipo protege sus endpoints directamente en sus controllers con `@PreAuthorize("hasRole('COORDINADOR')")` (o el rol correspondiente), sin tener que editar `SecurityFilterChain`.
   - **Nunca escriban contraseñas ni `localhost` fijos en Java.** Usen las variables configuradas en `application.properties`.
   - **Mantengan `spring.jpa.hibernate.ddl-auto=none`** (o `validate`) para respetar el esquema SQL del Equipo 6.
   - **Prueben que compila en Docker antes de subir a `main`:**
```bash
docker compose up --build -d db backend
docker compose logs -f backend
```

> **Nota sobre entidades compartidas (`@Entity`):** Tablas como `alumnos`, `grupos` o `periodos` serán usadas por 4 o 5 módulos distintos. Para evitar que varios equipos creen su propia clase `@Entity Alumno` y provoquen colisiones en JPA/Hibernate, **las entidades de tablas compartidas viven exclusivamente en `backend/src/main/java/com/nube/inscripciones/academico/entity/` (Equipo 6)**, y los demás módulos las importan sin duplicarlas.

---

### C. Frontend — React + Vite (Cada equipo en su módulo dentro de `frontend/src/modules/`)
`react-router-dom`, `App.jsx`, el cliente HTTP `src/api/client.js` y el archivo `routes.jsx` de cada módulo **ya están creados y conectados**.

1. Cuando necesites probar contra el backend real, levanta BD y Backend en Docker (o corre Spring en otra terminal):
   ```bash
   docker compose up --build -d db backend
   ```
2. Corre Vite en modo desarrollo:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Abre `http://localhost:5173`.
4. **Reglas obligatorias:**
   - **Agrega tus pantallas solo en el `routes.jsx` de tu módulo:** Edita únicamente `frontend/src/modules/<tu-modulo>/routes.jsx` para registrar tus páginas; no es necesario tocar `App.jsx`.
   - **Usa el cliente compartido `apiFetch` (`frontend/src/api/client.js`):** Adjunta automáticamente el token JWT y la URL base (`VITE_API_URL`). Como la URL base ya incluye `/api`, pasa solo la ruta relativa del recurso:
```javascript
import { apiFetch } from "../../../api/client";

// Llama a http://localhost:8080/api/alumnos en local y a /api/alumnos en Azure
const data = await apiFetch("/alumnos");
```
     Nunca escribas `http://localhost:8080` fijo dentro de tus componentes.
   - **No borres `frontend/Dockerfile` ni `frontend/nginx.conf`.**
   - **Verifica que `npm run build` pase sin errores** antes de mezclar a `main`.

---

### D. Archivos Compartidos (Regla para evitar conflictos entre los 8 equipos)
Gracias a los `routes.jsx` por módulo y a `@PreAuthorize` en los controllers, los equipos pueden agregar pantallas y reglas de acceso sin depender del Equipo 1. Únicamente los siguientes archivos base quedan bajo control del **Equipo 1** (si necesitas agregar una librería en `pom.xml` o `package.json`, una nueva variable en `.env.example`, o un ajuste global de infraestructura, avisa al Equipo 1 en el grupo):
- `backend/pom.xml` y `backend/src/main/resources/application.properties`
- `frontend/package.json` y `frontend/src/App.jsx`
- `docker-compose.yml`, `.env.example`, `backend/Dockerfile`, `frontend/Dockerfile` y `frontend/nginx.conf`

---

## 5. Flujo de Trabajo en Git y GitHub

Para mantener el trabajo ágil durante la semana **no hay bloqueos de ramas**, pero seguimos tres reglas estrictas:
1. Cada equipo trabaja únicamente en su rama asignada (`equipo-1-infra-auth` ... `equipo-8-notificaciones`).
2. Nadie modifica archivos dentro de las carpetas de otro equipo.
3. Solo se integra código a `main` cuando ya fue probado localmente y compila sin errores.

### Subir cambios (en la rama de tu equipo)
```bash
# 1. Asegúrate de estar en tu rama y traer los últimos cambios de tu equipo
git checkout <rama-de-tu-equipo>
git pull origin <rama-de-tu-equipo>

# 2. Guarda tus archivos y súbelos
git add .
git commit -m "equipo-X: descripción clara del cambio"
git push origin <rama-de-tu-equipo>
```

### Descargar avances de otros equipos (cuando alguien actualiza `main`)
```bash
git checkout <rama-de-tu-equipo>
git pull origin main
```

### Integrar un avance terminado a `main`
Cuando un equipo termine una parte funcional y probada, avisa en el grupo y ejecuta:
```bash
git checkout main
git pull origin main
git merge <rama-de-tu-equipo>
git push origin main
git checkout <rama-de-tu-equipo>
```

---

## 6. Acordeón de Comandos de Docker

| Qué quieres hacer | Comando |
| :--- | :--- |
| Levantar solo la base de datos | `docker compose up -d db` |
| Levantar BD y Backend (para pruebas de Frontend) | `docker compose up --build -d db backend` |
| Levantar y reconstruir **todo** el sistema | `docker compose up --build -d` |
| Ver qué contenedores están corriendo | `docker compose ps` |
| Ver los errores/logs del backend en vivo | `docker compose logs -f backend` |
| Ver los logs de PostgreSQL | `docker compose logs -f db` |
| Apagar los contenedores (guardando datos de BD) | `docker compose down` |
| Apagar todo y **borrar la BD para recargar `db/init/`** | `docker compose down -v` |

---

## 7. Problemas Comunes y Cómo Resolverlos

- **`Bind for 0.0.0.0:5432 failed: port is already allocated`**
  - *Causa:* Ya tienes un PostgreSQL local instalado ocupando el puerto `5432`.
  - *Solución:* Abre tu archivo `.env` (no `.env.example`) y cambia `POSTGRES_PORT=5432` por `POSTGRES_PORT=5433`. Luego corre `docker compose up -d db`.
- **Edité un archivo en `db/init/` pero mis tablas nuevas no aparecen**
  - *Causa:* Docker conservó el volumen viejo de PostgreSQL.
  - *Solución:* Ejecuta `docker compose down -v` y vuelve a correr `docker compose up -d db`.
- **El navegador bloquea las peticiones de React al Backend (Error de CORS)**
  - *Causa:* La URL del frontend no coincide con `CORS_ALLOWED_ORIGINS` en `.env`.
  - *Solución:* Verifica que `.env` tenga `CORS_ALLOWED_ORIGINS=http://localhost:5173` y reinicia el backend.
- **Spring Boot se cierra al iniciar con un error sobre `JWT_SECRET`**
  - *Causa:* La llave secreta en `.env` es muy corta o no existe el archivo `.env`.
  - *Solución:* Verifica que creaste `.env` desde `.env.example` y que `JWT_SECRET` tenga al menos 32 caracteres.
- **`Cannot connect to the Docker daemon`**
  - *Causa:* Docker Desktop está cerrado.
  - *Solución:* Abre la aplicación Docker Desktop, espera a que diga *Engine running* y vuelve a correr el comando.
- **Al hacer cambios en `backend/` o `frontend/` no se reflejan dentro de Docker**
  - *Causa:* `docker compose up` reutiliza la imagen anterior si no le pides reconstruir.
  - *Solución:* Agrega `--build`: `docker compose up --build -d`.