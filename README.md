# Sistema de Inscripciones y Reinscripciones

Aplicación web para la gestión de inscripciones, reinscripciones, usuarios, roles y permisos, diseñada para ejecutarse de forma consistente en contenedores y desplegarse en la nube con Kubernetes en Microsoft Azure.

## Tecnologías del Proyecto

| Capa | Tecnología | Detalles |
| :--- | :--- | :--- |
| **Backend** | Spring Boot 4.2.0 (Java 21 + Maven) | API REST, lógica de negocio, Spring Security (JWT), Spring Data JPA y Actuator |
| **Base de Datos** | PostgreSQL 17 | Almacenamiento relacional de usuarios, roles, permisos e inscripciones |
| **Frontend** | React + Vite (JavaScript) | Interfaz ligera para flujos de registro, inicio de sesión y validación de permisos |
| **Contenedores** | Docker & Docker Compose | Empaquetado y entorno local idéntico para todos los equipos |
| **Orquestación y Nube** | Kubernetes (`k8s`) + Microsoft Azure | Despliegue final en máquina virtual con contenedores orquestados |

---

## Estructura del Repositorio

Cada equipo trabaja **exclusivamente dentro de su carpeta** para evitar conflictos de código:

```text
sistema-inscripciones/
├── backend/              # [Equipo Backend] Proyecto Spring Boot + Dockerfile
├── db/
│   └── init/             # [Equipo BD] Scripts SQL iniciales (01_schema.sql, 02_seed.sql, etc.)
├── frontend/             # [Equipo Frontend] Proyecto React (Vite) + nginx.conf + Dockerfile
├── k8s/                  # [Equipo Infra] Manifiestos YAML de Kubernetes
├── docker-compose.yml    # [Equipo Infra] Orquestación local de BD, Backend y Frontend
├── .env.example          # [Equipo Infra] Plantilla de variables de entorno (valores locales)
├── .gitignore            # Archivos bloqueados para no subirse a GitHub (incluye .env)
└── README.md             # Esta guía
```

---

## 1. Requisitos Previos (Instalar una sola vez)

### Obligatorios para todos los equipos
1. **Git**
2. **Visual Studio Code (VS Code)**
3. **Docker Desktop** (en Windows/Mac) o **Docker Engine + Compose** (en Linux). *Asegúrate de abrir Docker Desktop antes de correr cualquier comando de Docker.*

### Herramientas adicionales según tu equipo
* **Equipo de Base de Datos:** DBeaver, pgAdmin o la extensión de PostgreSQL en VS Code.
* **Equipo de Backend:** JDK 21 instalado en tu computadora (no necesitas instalar Maven aparte; el proyecto ya incluye el wrapper `mvnw`).
* **Equipo de Frontend:** Node.js (versión LTS).

### Extensiones recomendadas en VS Code
* **Todos:** `Container Tools` (Microsoft, antes llamada *Docker*) — permite ver contenedores encendidos y leer logs con un clic.
* **Backend:** `Extension Pack for Java`, `Spring Boot Extension Pack` y `Thunder Client` (para probar endpoints sin salir de VS Code).
* **Base de Datos:** `PostgreSQL` (para consultar tablas y correr queries directo en VS Code).
* **Frontend:** `ESLint` y `ES7+ React/Redux/React-Native snippets`.

---

## 2. Configuración Inicial (Solo la primera vez)

1. **Crea tu archivo `.env` local** copiando la plantilla `.env.example`:
   * **Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```
   * **Mac / Linux / Git Bash:**
```bash
cp .env.example .env
```
   > **IMPORTANTE:** Nunca subas el archivo `.env` a GitHub (ya está bloqueado en `.gitignore`). Este repositorio es público; las contraseñas reales solo se usarán al desplegar en Azure.
2. **Cámbiate a la rama de tu equipo** (`db`, `backend`, `frontend` o `infra`):
   ```bash
   git checkout <rama-de-tu-equipo>
   ```
3. **Verifica que todo arranca correctamente** (opcional para validar tu entorno el primer día, se corre desde la raiz):
   ```bash
   docker compose up --build -d
   docker compose ps
   ```
   Deberías ver los 3 contenedores (`inscripciones_db`, `inscripciones_backend`, `inscripciones_frontend`) con estado `Up`.
   * Frontend: `http://localhost:5173`
   * Backend: `http://localhost:8080`
   * Para apagarlos: `docker compose down`

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
| `VITE_API_URL` | `http://localhost:8080` | URL base del backend que consume React |

---

## 4. Guía de Trabajo por Equipo

Para trabajar rápido y con depuración en vivo, **solo corre en Docker los servicios que NO estás programando** y ejecuta tu parte de forma nativa en tu computadora.

### A. Equipos de Base de Datos (Carpeta: `db/init/` | Rama: `db`)

**Cómo trabajar localmente:**
1. Levanta únicamente el contenedor de PostgreSQL:
   ```bash
   docker compose up -d db
   ```
2. Conéctate desde DBeaver, pgAdmin o VS Code con estos datos:
   * **Host:** `localhost`
   * **Puerto:** `5432` (o el que pusiste en `POSTGRES_PORT`)
   * **Base de datos:** `inscripciones_db`
   * **Usuario:** `admin`
   * **Contraseña:** `password_local_123`

**Cómo guardar el esquema y datos de prueba:**
* La base de datos arranca **vacía** a propósito. Guarden sus scripts dentro de `db/init/` numerados en orden de ejecución:
  * `db/init/01_schema.sql` → Tablas (`usuarios`, `roles`, `permisos`, `rol_permisos`, `inscripciones`, etc.).
  * `db/init/02_seed.sql` → Roles iniciales, permisos base y usuarios de prueba (opcional).
* **Regla crítica de Docker:** PostgreSQL solo ejecuta los archivos de `db/init/` cuando el volumen está completamente vacío. Cada vez que modifiquen un `.sql` y quieran probarlo desde cero, ejecuten:
  ```bash
  docker compose down -v
  docker compose up -d db
  ```
  *(La bandera `-v` borra los datos viejos para que Postgres vuelva a correr sus scripts).*

**Qué necesita el resto del equipo de ustedes:**
* Compartan lo antes posible con el **Equipo de Backend** los nombres exactos de tablas, columnas, llaves foráneas y nombres de roles/permisos (ej. `ESTUDIANTE`, `SERVICIOS_ESCOLARES`, `ADMIN`).

---

### B. Equipos de Backend — Spring Boot (Carpeta: `backend/` | Rama: `backend`)

El proyecto ya está inicializado en `backend/` con **Spring Boot 4.2.0, Java 21, Maven** y las dependencias: `Spring Web`, `Spring Security`, `Spring Data JPA`, `PostgreSQL Driver` y `Spring Boot Actuator`.

**Cómo trabajar localmente:**
1. Levanta solo la base de datos en Docker:
   ```bash
   docker compose up -d db
   ```
2. Ejecuta Spring Boot desde VS Code (botón **Run** en la clase principal) o desde la terminal dentro de `backend/`:
   * **Windows (PowerShell):**
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
   * **Mac / Linux:**
```bash
cd backend
./mvnw spring-boot:run
```
   *(El archivo `application.properties` ya apunta por defecto a `localhost:5432` con las credenciales locales, así que se conectará automáticamente a tu contenedor de Postgres).*

**Reglas obligatorias (para que no falle en Docker ni en Azure):**
1. **Nunca escriban contraseñas ni `localhost` fijos en el código Java.** Usen siempre las variables configuradas en `application.properties` (`${SPRING_DATASOURCE_URL}`, `${JWT_SECRET}`, `${CORS_ALLOWED_ORIGINS}`).
2. **Mantengan `spring.jpa.hibernate.ddl-auto=none`** (o `validate`) en `application.properties` para respetar el esquema del equipo de BD.
3. **Permitan el endpoint de salud en Spring Security:** En su `SecurityFilterChain`, agreguen `.requestMatchers("/actuator/health").permitAll()` para que Kubernetes pueda comprobar que el backend sigue vivo.
4. **Configuren CORS:** Permitan peticiones desde `CORS_ALLOWED_ORIGINS` (en local `http://localhost:5173`) con los métodos `GET, POST, PUT, DELETE, OPTIONS` y los headers `Authorization, Content-Type`.
5. **No borren ni rompan `backend/Dockerfile`.** Si agregan nuevas variables de entorno, avisen al equipo de Infraestructura para agregarlas a `.env.example` y `docker-compose.yml`.

**Cómo probar que su código sí compila en Docker antes de subir a `main`:**
```bash
docker compose up --build -d db backend
docker compose logs -f backend
```

**Qué necesita el resto del equipo de ustedes:**
* Compartan con **Frontend** las rutas exactas de la API (ej. `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/inscripciones`), el formato JSON de entrada/salida y qué header esperan para el token (ej. `Authorization: Bearer <token>`).

---

### C. Equipos de Frontend — React + Vite (Carpeta: `frontend/` | Rama: `frontend`)

El proyecto ya está inicializado en `frontend/` con **React + Vite (JavaScript)** y ESLint.

**Cómo trabajar localmente (con recarga rápida):**
1. Cuando el backend ya tenga endpoints listos en `main`, levanta BD y Backend en Docker:
   ```bash
   docker compose up --build -d db backend
   ```
   *(Mientras el backend todavía está en desarrollo, pueden trabajar sin Docker usando datos simulados y luego conectar las peticiones reales).*
2. Corre el servidor de desarrollo de Vite en tu computadora:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Abre la URL que muestre Vite (normalmente `http://localhost:5173`).

**Reglas obligatorias (para que no falle en Docker ni en Azure):**
1. **Usen la variable de entorno para todas las llamadas HTTP:**
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
   // Ejemplo: fetch(`${API_URL}/api/auth/login`, ...)
   ```
   Nunca escriban `http://localhost:8080` fijo dentro de cada archivo.
2. **No borren `frontend/Dockerfile` ni `frontend/nginx.conf`.** El archivo `nginx.conf` es necesario para que recargar rutas de React en producción no arroje errores `404`.
3. **Verifiquen que `npm run build` pase sin errores** antes de mezclar a `main` (Docker ejecuta `npm run build` para generar el contenedor).

---

### D. Equipo de Infraestructura y PM (Carpeta: `k8s/` y archivos raíz | Rama: `infra`)

**Responsabilidades durante la semana:**
1. Mantener funcionando `docker-compose.yml`, `.env.example`, `backend/Dockerfile` y `frontend/Dockerfile`.
2. Escribir y probar localmente los manifiestos de Kubernetes en `k8s/` (Deployments, Services, PersistentVolumeClaim para PostgreSQL, ConfigMap, Secrets e Ingress) usando Docker Desktop Kubernetes, Minikube o k3d **antes** de encender la VM de Azure.
3. Coordinar la integración en `main` probando que `docker compose up --build` levante todo el sistema completo sin errores.
4. Crear la VM en Microsoft Azure (Ubuntu), abrir los puertos necesarios en el Network Security Group (NSG), instalar `k3s`, configurar las contraseñas reales de producción **únicamente dentro de la VM** (nunca en GitHub) y desplegar la aplicación.

---

## 5. Flujo de Trabajo en Git y GitHub

Para mantener el trabajo ágil durante la semana, **no hay bloqueos de ramas**, pero seguimos tres reglas estrictas:
1. Cada equipo trabaja en su rama asignada (`db`, `backend`, `frontend`, `infra`).
2. Nadie modifica archivos dentro de la carpeta de otro equipo.
3. Solo se integra código a `main` cuando ya fue probado localmente y funciona.

### Subir cambios (en la rama de tu equipo)
```bash
# 1. Asegúrate de estar en tu rama y traer los últimos cambios de tus compañeros
git checkout <rama-de-tu-equipo>
git pull origin <rama-de-tu-equipo>

# 2. Guarda tus archivos y súbelos
git add .
git commit -m "Descripción clara del cambio"
git push origin <rama-de-tu-equipo>
```

### Descargar avances de otros equipos (cuando alguien actualiza `main`)
Si el equipo de BD o Backend avisa que ya integró algo nuevo en `main`, tráelo a tu rama así:
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
| Apagar los contenedores (guardando datos de la BD) | `docker compose down` |
| Apagar todo y **borrar la BD para recargar `db/init/`** | `docker compose down -v` |

---

## 7. Problemas Comunes y Cómo Resolverlos

* **Error al levantar `db`: `Bind for 0.0.0.0:5432 failed: port is already allocated`**
  * *Causa:* Ya tienes un PostgreSQL local instalado ocupando el puerto `5432`.
  * *Solución:* Abre tu archivo `.env` (no `.env.example`) y cambia `POSTGRES_PORT=5432` por `POSTGRES_PORT=5433`. Luego corre `docker compose up -d db`.
* **Edité un archivo en `db/init/` pero mis tablas nuevas no aparecen**
  * *Causa:* Docker conservó el volumen viejo de PostgreSQL.
  * *Solución:* Ejecuta `docker compose down -v` y vuelve a correr `docker compose up -d db`.
* **El navegador bloquea las peticiones de React al Backend (Error de CORS)**
  * *Causa:* Spring Security está rechazando peticiones desde `http://localhost:5173`.
  * *Solución:* El equipo de Backend debe habilitar CORS en su `SecurityFilterChain` permitiendo `http://localhost:5173` y el método `OPTIONS`.
* **Spring Boot se cierra al iniciar con un error sobre `JWT_SECRET` o longitud de llave**
  * *Causa:* La llave secreta en `.env` es muy corta o no existe el archivo `.env`.
  * *Solución:* Verifica que creaste `.env` desde `.env.example` y que `JWT_SECRET` tenga al menos 32 caracteres.
* **Error `Cannot connect to the Docker daemon`**
  * *Causa:* Docker Desktop está cerrado.
  * *Solución:* Abre la aplicación Docker Desktop, espera a que diga *Engine running* y vuelve a correr el comando.
* **Al hacer cambios en `backend/` o `frontend/` no se reflejan dentro de Docker**
  * *Causa:* `docker compose up` reutiliza la imagen anterior si no le pides reconstruir.
  * *Solución:* Agrega `--build`: `docker compose up --build -d`.