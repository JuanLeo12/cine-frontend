# 🎬 CineStar - Frontend# 🎬 Cinestar - Frontend# Getting Started with Create React App



Aplicación web del sistema de gestión de cines desarrollada con React.js.



---Frontend del sistema de gestión de cines desarrollado con React.This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).



## 📋 Requisitos



- Node.js v16 o superior## 📋 Requisitos## Available Scripts

- npm o yarn

- Backend API corriendo (ver `../cine-backend`)



---- Node.js v16 o superiorIn the project directory, you can run:



## 🚀 Instalación Local- npm o yarn



```bash- Backend API corriendo en `http://localhost:5000`### `npm start`

# 1. Clonar el repositorio

git clone <tu-repo>

cd cine-frontend

## 🚀 InstalaciónRuns the app in the development mode.\

# 2. Instalar dependencias

npm installOpen [http://localhost:3000](http://localhost:3000) to view it in your browser.



# 3. Configurar variables de entorno```bash

cp .env.example .env

# Editar .env con la URL de tu backend# Instalar dependenciasThe page will reload when you make changes.\



# 4. Iniciar aplicaciónnpm installYou may also see any lint errors in the console.

npm start

```



La aplicación estará disponible en `http://localhost:3000`# Ejecutar en modo desarrollo### `npm test`



---npm start



## ⚙️ Variables de Entorno```Launches the test runner in the interactive watch mode.\



Crea un archivo `.env` basado en `.env.example`:See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.



```envLa aplicación estará disponible en `http://localhost:3000`

REACT_APP_API_URL=http://localhost:4000

```### `npm run build`



---## 📁 Estructura del Proyecto



## 📁 Estructura del ProyectoBuilds the app for production to the `build` folder.\



``````It correctly bundles React in production mode and optimizes the build for the best performance.

cine-frontend/

├── public/cine-frontend/

│   ├── images/          # Imágenes estáticas

│   └── index.html       # HTML principal├── public/              # Archivos públicosThe build is minified and the filenames include the hashes.\

├── src/

│   ├── components/      # Componentes reutilizables│   ├── images/         # Imágenes estáticasYour app is ready to be deployed!

│   │   ├── comp/       # Cards (MovieCard, ComboCard, etc.)

│   │   └── general/    # Navbar, Footer, Modals│   └── index.html      # HTML principal

│   ├── pages/          # Páginas completas

│   │   ├── admin/     # Panel de administración├── src/See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

│   │   ├── main-pgs/  # Páginas públicas

│   │   ├── purchase/  # Flujo de compra│   ├── components/     # Componentes React

│   │   └── usr/       # Perfil de usuario

│   ├── context/        # React Context (Auth, Purchase)│   │   ├── comp/      # Componentes de tarjetas (MovieCard, CinemaCard, etc.)### `npm run eject`

│   ├── services/       # API calls (axios)

│   ├── hooks/          # Custom hooks│   │   └── general/   # Componentes generales (Navbar, Footer, etc.)

│   ├── utils/          # Utilidades

│   ├── App.js          # Componente raíz│   ├── pages/         # Páginas de la aplicación**Note: this is a one-way operation. Once you `eject`, you can't go back!**

│   └── index.js        # Punto de entrada

└── package.json│   │   ├── admin/    # Panel de administración

```

│   │   ├── main-pgs/ # Páginas principalesIf you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

---

│   │   ├── purchase/ # Flujo de compra

## 🎨 Páginas y Rutas

│   │   └── usr/      # Perfil de usuarioInstead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

### 🌐 Públicas (sin autenticación)

│   ├── context/       # Context API (AuthContext)

| Ruta | Componente | Descripción |

|------|-----------|-------------|│   ├── services/      # Servicios API (axios)You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

| `/` | Home | Página principal con carousel |

| `/movies` | Movies | Catálogo de películas |│   ├── data/          # Datos mock

| `/movies/:id` | MovieDetails | Detalles de película |

| `/cinemas` | Cinemas | Lista de sedes |│   ├── App.js         # Componente principal## Learn More

| `/candyshop` | CandyShop | Combos de dulcería |

│   └── index.js       # Punto de entrada

### 🔒 Usuarios Autenticados

└── package.jsonYou can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

| Ruta | Componente | Descripción |

|------|-----------|-------------|```

| `/compra/seleccion-asientos/:id` | SeatSelection | Seleccionar asientos |

| `/compra/tipo-ticket` | TicketType | Cantidad y tipo |To learn React, check out the [React documentation](https://reactjs.org/).

| `/compra/combos` | Combos | Agregar combos |

| `/compra/pago` | Payment | Método de pago |## 🎨 Páginas Principales

| `/compra/confirmacion` | Confirmation | Confirmación con QR |

| `/perfil/datos` | MisDatos | Datos personales |### Code Splitting

| `/perfil/compras` | MisCompras | Historial |

### Públicas (sin autenticación)

### 🏢 Usuarios Corporativos

- **Home** (`/`) - Página de inicioThis section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

| Ruta | Componente | Descripción |

|------|-----------|-------------|- **Movies** (`/movies`) - Catálogo de películas

| `/corporate` | CorporateSales | Funciones privadas y alquiler |

| `/corporate/payment` | PaymentCorporativo | Pago corporativo |- **Cinemas** (`/cinemas`) - Lista de cines### Analyzing the Bundle Size



### 👨‍💼 Administradores- **CandyShop** (`/candyshop`) - Combos de dulcería



| Ruta | Componente | Descripción |- **MovieDetails** (`/movies/:id`) - Detalles de películaThis section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

|------|-----------|-------------|

| `/admin` | AdminPanel | Dashboard principal |

| `/admin/peliculas` | PeliculasAdmin | CRUD películas |

| `/admin/sedes` | SedesAdmin | CRUD sedes |### Usuarios Autenticados### Making a Progressive Web App

| `/admin/funciones` | FuncionesAdmin | CRUD funciones |

| `/admin/combos` | CombosAdmin | CRUD combos |- **SeatSelection** (`/compra/seleccion-asientos/:id`) - Selección de asientos

| `/admin/usuarios` | UsuariosAdmin | Gestión usuarios |

| `/admin/ordenes` | OrdenesAdmin | Ver órdenes |- **TicketType** (`/compra/tipo-ticket`) - Tipo de ticketThis section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

| `/admin/reportes` | ReportesAdmin | Estadísticas |

- **Combos** (`/compra/combos`) - Selección de combos

---

- **Payment** (`/compra/pago`) - Método de pago### Advanced Configuration

## 🔐 Sistema de Autenticación

- **Confirmation** (`/compra/confirmacion`) - Confirmación de compra

### Context API

- **MisDatos** (`/perfil/datos`) - Datos personalesThis section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

```javascript

import { useAuth } from './context/AuthContext';- **MisCompras** (`/perfil/compras`) - Historial de compras



function MiComponente() {### Deployment

  const { user, login, logout, isAuthenticated } = useAuth();

  ### Usuarios Corporativos

  // user: { id, nombre, email, rol, ... }

  // login(token): guarda token y decodifica usuario- **CorporateSales** (`/ventas-corporativas`) - Ventas corporativasThis section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

  // logout(): limpia sesión

  // isAuthenticated: boolean

}

```### Administradores### `npm run build` fails to minify



### Roles- **AdminPanel** (`/admin`) - Panel principal



- **`cliente`**: Compra de tickets y combos- **PeliculasAdmin** (`/admin/peliculas`) - Gestión de películasThis section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

- **`corporativo`**: Funciones privadas y alquiler de salas

- **`admin`**: Acceso completo al sistema- **SedesAdmin** (`/admin/sedes`) - Gestión de sedes

- **FuncionesAdmin** (`/admin/funciones`) - Gestión de funciones

---- **CombosAdmin** (`/admin/combos`) - Gestión de combos

- **UsuariosAdmin** (`/admin/usuarios`) - Gestión de usuarios

## 🛒 Flujo de Compra- **ReportesAdmin** (`/admin/reportes`) - Reportes



### Context de Compra## 🔐 Autenticación



```javascriptEl sistema utiliza JWT almacenado en `localStorage`:

import { usePurchase } from './context/PurchaseContext';

```javascript

function MiComponente() {// Estructura del token

  const {{

    selectedSeats,      // Asientos seleccionados  id: number,

    selectedCombos,     // Combos seleccionados  email: string,

    paymentMethod,      // Método de pago  rol: 'cliente' | 'corporativo' | 'admin',

    totalAmount,        // Monto total  token_version: number

    // ... funciones de gestión}

  } = usePurchase();```

}

```### Context de Autenticación



### Flujo Completo```javascript

import { useAuth } from './context/AuthContext';

1. **Home/Movies** → Ver películas

2. **MovieDetails** → Ver funciones disponiblesfunction MiComponente() {

3. **SeatSelection** → Seleccionar asientos (inicia timer 10min)  const { user, login, logout } = useAuth();

4. **TicketType** → Elegir tipos de ticket  

5. **Combos** → Agregar combos (opcional)  // user contiene los datos del usuario autenticado

6. **Payment** → Pagar (Tarjeta/Yape/Efectivo)  // login(token) guarda el token

7. **Confirmation** → Ver boleta con QR  // logout() cierra sesión

}

---```



## 🎨 Componentes Principales## 🎨 Componentes Principales



### MovieCard### Navbar

```jsx- Menú de navegación

<MovieCard - Dropdown de usuario

  pelicula={pelicula}- Login modal

  onClick={() => navigate(`/movies/${pelicula.id}`)}- Cierre de sesión

/>

```### MovieCard

Muestra: póster, título, género, duración, clasificaciónMuestra información de película:

- Imagen

### CinemaCard- Título

```jsx- Género

<CinemaCard - Clasificación

  sede={sede}- Duración

/>- Botón "Ver detalles"

```

Muestra: imagen, nombre, dirección, ciudad, salas### CinemaCard

Muestra información de sede:

### ComboCard- Imagen

```jsx- Nombre

<ComboCard - Dirección

  combo={combo}- Ciudad

  onSelect={handleSelectCombo}- Teléfono

/>- Cantidad de salas

```

Muestra: imagen, nombre, descripción, precio### ComboCard

Muestra combos de dulcería:

### NavigationGuard- Imagen

Protege rutas que requieren autenticación:- Nombre

```jsx- Descripción

<Route path="/compra/*" element={- Precio

  <NavigationGuard>- Botón de selección

    <CompraRoutes />

  </NavigationGuard>## 🛒 Flujo de Compra

} />

```1. **Selección de película** - Ver cartelera y elegir película

2. **Selección de función** - Elegir fecha, hora y sede

---3. **Selección de asientos** - Elegir asientos disponibles

4. **Tipo de ticket** - Seleccionar cantidad y tipo (General, Niño, etc.)

## 📡 API Services5. **Combos** - Agregar combos de dulcería (opcional)

6. **Pago** - Seleccionar método de pago y confirmar

Ubicados en `src/services/api.js`:7. **Confirmación** - Ver resumen de compra y código QR



### Ejemplo de uso## 🎨 Estilos



```javascriptLos estilos están organizados por componente:

import api from './services/api';- Tema oscuro con color principal rojo (#e60000)

- CSS modules por componente

// GET request- Variables CSS para consistencia

const peliculas = await api.getPeliculas();- Diseño responsive



// POST request con autenticación## 📡 Servicios API

const orden = await api.createOrdenCompra(datosOrden);

Ubicados en `src/services/api.js`:

// PUT request

await api.updateProfile(nuevosDatos);### Autenticación

``````javascript

register(userData)

### Métodos disponibleslogin(credentials)

getProfile()

#### AutenticaciónupdateProfile(data)

- `register(userData)````

- `login({ email, password })`

- `getProfile()`### Películas

- `updateProfile(data)````javascript

getPeliculas()

#### PelículasgetPelicula(id)

- `getPeliculas()`createPelicula(data)

- `getPelicula(id)`updatePelicula(id, data)

- `createPelicula(data)` *(admin)*deletePelicula(id)

- `updatePelicula(id, data)` *(admin)*```



#### Sedes### Sedes

- `getSedes()````javascript

- `getSede(id)`getSedes()

getSede(id)

#### FuncionescreateSede(data)

- `getFunciones()`updateSede(id, data)

- `getFuncionesForMovie(idPelicula)`deleteSede(id)

- `getAsientosDisponibles(idFuncion)````



#### Compras### Funciones

- `createOrdenCompra(data)````javascript

- `getMisOrdenes()`getFunciones()

- `procesarPago(data)`getFuncionesByPelicula(idPelicula)

createFuncion(data)

---updateFuncion(id, data)

deleteFuncion(id)

## 🎨 Estilos y Diseño```



### Tema### Compras

```javascript

- **Colores principales:**createOrdenCompra(data)

  - Primario: `#dc1e28` (rojo CineStar)getMisOrdenes()

  - Fondo: `#0a0a0a` (negro profundo)procesarPago(data)

  - Cards: `#1a1a1a` (gris oscuro)```

  - Texto: `#ffffff` / `#cccccc`

### Vales Corporativos

- **Tipografía:**```javascript

  - Principal: `'Segoe UI', Tahoma, sans-serif`validarValeCorporativo(codigoVale, montoTotal)

  - Monospace para códigos```



### CSS Modules## 🔧 Configuración



Cada componente tiene su CSS:### API Base URL

```

MovieCard.jsxEdita `src/services/api.js`:

MovieCard.css  (o en carpeta css/)

``````javascript

const API_URL = 'http://localhost:5000/api';

---```



## ⏱️ Sistema de Timer### Variables de Entorno



El sistema incluye un timer de 10 minutos para reservar asientos:Crea `.env` en la raíz:



```javascript```env

import { usePurchase } from './context/PurchaseContext';REACT_APP_API_URL=http://localhost:5000/api

```

function Component() {

  const { ## 🎨 Personalización de Tema

    timerActive,      // Boolean: timer activo

    timeLeft,         // Segundos restantesLos colores principales están en los archivos CSS:

    startTimer,       // Iniciar timer

    stopTimer         // Detener timer```css

  } = usePurchase();/* Colores principales */

  --primary-color: #e60000;

  // El timer se inicia automáticamente en SeatSelection--background-dark: #0a0a0a;

  // Se detiene al completar el pago o expirar--background-card: #1a1a1a;

}--text-white: #ffffff;

```--text-gray: #888888;

```

---

## 📝 Validaciones Frontend

## 🔒 Validaciones Frontend

### Formulario de Sede

### Registro de Usuario- Nombre: mínimo 3 caracteres

- Email: formato válido- Dirección: mínimo 5 caracteres

- Contraseña: 8-16 caracteres, 1 mayúscula, 1 número- Ciudad: mínimo 2 caracteres

- Teléfono: 9 dígitos numéricos- Teléfono: exactamente 9 dígitos numéricos

- Fecha nacimiento: mayor de 13 años- URL de imagen: formato URL válido



### Pago con Tarjeta### Formulario de Usuario

- Número: 16 dígitos- Email: formato válido

- CVV: 3 dígitos- Contraseña: 8-16 caracteres

- Expiración: formato MM/AA, no expirada- Nombre: mínimo 3 caracteres

- Titular: solo letras y espacios- Teléfono: 9 dígitos numéricos



### Compra de Tickets### Formulario de Película

- Mínimo 1 asiento seleccionado- Título: obligatorio

- Mínimo 1 tipo de ticket- Duración: mínimo 1 minuto

- Total asientos = total tickets- Género: selección obligatoria

- Clasificación: selección obligatoria

---

## 🐛 Solución de Problemas

## 🚀 Build para Producción

### Error: "Network Error"

```bashVerifica que el backend esté corriendo en `http://localhost:5000`

# Crear build optimizado

npm run build### Error: "No autorizado"

El token JWT puede haber expirado. Cierra sesión y vuelve a iniciar.

# Los archivos estarán en build/

# Listos para desplegar en Vercel/Netlify### Imágenes no se muestran

```Verifica que las URLs de imágenes sean accesibles



---### Estado no se actualiza

Verifica que uses el contexto de autenticación correctamente

## ☁️ Despliegue a la Nube

## 🚀 Build para Producción

### Vercel (Recomendado)

```bash

1. Crea cuenta en [vercel.com](https://vercel.com)# Crear build optimizado

2. Conecta tu repositorio GitHubnpm run build

3. Configura:

   - **Framework:** Create React App# Los archivos estarán en la carpeta build/

   - **Build Command:** `npm run build````

   - **Output Directory:** `build`

4. Agrega variable de entorno:## 📄 Licencia

   ```

   REACT_APP_API_URL=https://tu-backend.railway.appProyecto educativo - Cinestar © 2025

   ```
5. Despliega

Ver guía completa en [`../DEPLOY.md`](../DEPLOY.md)

---

## 🐛 Solución de Problemas

### Error: "Network Error"
✅ Verifica que el backend esté corriendo  
✅ Revisa `REACT_APP_API_URL` en `.env`  
✅ Verifica configuración de CORS en el backend

### Error: "No autorizado"
✅ Token JWT expirado → Cierra sesión e inicia de nuevo  
✅ Verifica que el header `Authorization` se envíe correctamente

### Imágenes no cargan
✅ Verifica URLs en la base de datos  
✅ Asegúrate que las imágenes públicas estén en `/public/images/`

### Timer no funciona
✅ Verifica que `PurchaseContext` envuelva la aplicación  
✅ Revisa que `startTimer()` se llame en SeatSelection

### Asientos no se reservan
✅ Verifica conexión con el backend  
✅ Revisa estado de asientos en BD  
✅ Comprueba que la función esté activa

---

## 📚 Tecnologías Utilizadas

- **React 18** - Biblioteca UI
- **React Router v6** - Enrutamiento
- **Axios** - Peticiones HTTP
- **Context API** - Estado global
- **CSS3** - Estilos
- **QRCode.react** - Generación de QR
- **React QR Code** - Visualización de QR
- **jwt-decode** - Decodificación de JWT

---

## 📄 Licencia

MIT License - CineStar © 2025

---

## 📞 Soporte

Ver guía de despliegue: [`../DEPLOY.md`](../DEPLOY.md)  
Backend README: [`../cine-backend/README.md`](../cine-backend/README.md)
