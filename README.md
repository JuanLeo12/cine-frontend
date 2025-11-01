# 🎬 Cinestar - Frontend# Getting Started with Create React App



Frontend del sistema de gestión de cines desarrollado con React.This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).



## 📋 Requisitos## Available Scripts



- Node.js v16 o superiorIn the project directory, you can run:

- npm o yarn

- Backend API corriendo en `http://localhost:5000`### `npm start`



## 🚀 InstalaciónRuns the app in the development mode.\

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

```bash

# Instalar dependenciasThe page will reload when you make changes.\

npm installYou may also see any lint errors in the console.



# Ejecutar en modo desarrollo### `npm test`

npm start

```Launches the test runner in the interactive watch mode.\

See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

La aplicación estará disponible en `http://localhost:3000`

### `npm run build`

## 📁 Estructura del Proyecto

Builds the app for production to the `build` folder.\

```It correctly bundles React in production mode and optimizes the build for the best performance.

cine-frontend/

├── public/              # Archivos públicosThe build is minified and the filenames include the hashes.\

│   ├── images/         # Imágenes estáticasYour app is ready to be deployed!

│   └── index.html      # HTML principal

├── src/See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

│   ├── components/     # Componentes React

│   │   ├── comp/      # Componentes de tarjetas (MovieCard, CinemaCard, etc.)### `npm run eject`

│   │   └── general/   # Componentes generales (Navbar, Footer, etc.)

│   ├── pages/         # Páginas de la aplicación**Note: this is a one-way operation. Once you `eject`, you can't go back!**

│   │   ├── admin/    # Panel de administración

│   │   ├── main-pgs/ # Páginas principalesIf you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

│   │   ├── purchase/ # Flujo de compra

│   │   └── usr/      # Perfil de usuarioInstead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

│   ├── context/       # Context API (AuthContext)

│   ├── services/      # Servicios API (axios)You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

│   ├── data/          # Datos mock

│   ├── App.js         # Componente principal## Learn More

│   └── index.js       # Punto de entrada

└── package.jsonYou can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

```

To learn React, check out the [React documentation](https://reactjs.org/).

## 🎨 Páginas Principales

### Code Splitting

### Públicas (sin autenticación)

- **Home** (`/`) - Página de inicioThis section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

- **Movies** (`/movies`) - Catálogo de películas

- **Cinemas** (`/cinemas`) - Lista de cines### Analyzing the Bundle Size

- **CandyShop** (`/candyshop`) - Combos de dulcería

- **MovieDetails** (`/movies/:id`) - Detalles de películaThis section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)



### Usuarios Autenticados### Making a Progressive Web App

- **SeatSelection** (`/compra/seleccion-asientos/:id`) - Selección de asientos

- **TicketType** (`/compra/tipo-ticket`) - Tipo de ticketThis section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

- **Combos** (`/compra/combos`) - Selección de combos

- **Payment** (`/compra/pago`) - Método de pago### Advanced Configuration

- **Confirmation** (`/compra/confirmacion`) - Confirmación de compra

- **MisDatos** (`/perfil/datos`) - Datos personalesThis section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

- **MisCompras** (`/perfil/compras`) - Historial de compras

### Deployment

### Usuarios Corporativos

- **CorporateSales** (`/ventas-corporativas`) - Ventas corporativasThis section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)



### Administradores### `npm run build` fails to minify

- **AdminPanel** (`/admin`) - Panel principal

- **PeliculasAdmin** (`/admin/peliculas`) - Gestión de películasThis section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

- **SedesAdmin** (`/admin/sedes`) - Gestión de sedes
- **FuncionesAdmin** (`/admin/funciones`) - Gestión de funciones
- **CombosAdmin** (`/admin/combos`) - Gestión de combos
- **UsuariosAdmin** (`/admin/usuarios`) - Gestión de usuarios
- **ReportesAdmin** (`/admin/reportes`) - Reportes

## 🔐 Autenticación

El sistema utiliza JWT almacenado en `localStorage`:

```javascript
// Estructura del token
{
  id: number,
  email: string,
  rol: 'cliente' | 'corporativo' | 'admin',
  token_version: number
}
```

### Context de Autenticación

```javascript
import { useAuth } from './context/AuthContext';

function MiComponente() {
  const { user, login, logout } = useAuth();
  
  // user contiene los datos del usuario autenticado
  // login(token) guarda el token
  // logout() cierra sesión
}
```

## 🎨 Componentes Principales

### Navbar
- Menú de navegación
- Dropdown de usuario
- Login modal
- Cierre de sesión

### MovieCard
Muestra información de película:
- Imagen
- Título
- Género
- Clasificación
- Duración
- Botón "Ver detalles"

### CinemaCard
Muestra información de sede:
- Imagen
- Nombre
- Dirección
- Ciudad
- Teléfono
- Cantidad de salas

### ComboCard
Muestra combos de dulcería:
- Imagen
- Nombre
- Descripción
- Precio
- Botón de selección

## 🛒 Flujo de Compra

1. **Selección de película** - Ver cartelera y elegir película
2. **Selección de función** - Elegir fecha, hora y sede
3. **Selección de asientos** - Elegir asientos disponibles
4. **Tipo de ticket** - Seleccionar cantidad y tipo (General, Niño, etc.)
5. **Combos** - Agregar combos de dulcería (opcional)
6. **Pago** - Seleccionar método de pago y confirmar
7. **Confirmación** - Ver resumen de compra y código QR

## 🎨 Estilos

Los estilos están organizados por componente:
- Tema oscuro con color principal rojo (#e60000)
- CSS modules por componente
- Variables CSS para consistencia
- Diseño responsive

## 📡 Servicios API

Ubicados en `src/services/api.js`:

### Autenticación
```javascript
register(userData)
login(credentials)
getProfile()
updateProfile(data)
```

### Películas
```javascript
getPeliculas()
getPelicula(id)
createPelicula(data)
updatePelicula(id, data)
deletePelicula(id)
```

### Sedes
```javascript
getSedes()
getSede(id)
createSede(data)
updateSede(id, data)
deleteSede(id)
```

### Funciones
```javascript
getFunciones()
getFuncionesByPelicula(idPelicula)
createFuncion(data)
updateFuncion(id, data)
deleteFuncion(id)
```

### Compras
```javascript
createOrdenCompra(data)
getMisOrdenes()
procesarPago(data)
```

### Vales Corporativos
```javascript
validarValeCorporativo(codigoVale, montoTotal)
```

## 🔧 Configuración

### API Base URL

Edita `src/services/api.js`:

```javascript
const API_URL = 'http://localhost:5000/api';
```

### Variables de Entorno

Crea `.env` en la raíz:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎨 Personalización de Tema

Los colores principales están en los archivos CSS:

```css
/* Colores principales */
--primary-color: #e60000;
--background-dark: #0a0a0a;
--background-card: #1a1a1a;
--text-white: #ffffff;
--text-gray: #888888;
```

## 📝 Validaciones Frontend

### Formulario de Sede
- Nombre: mínimo 3 caracteres
- Dirección: mínimo 5 caracteres
- Ciudad: mínimo 2 caracteres
- Teléfono: exactamente 9 dígitos numéricos
- URL de imagen: formato URL válido

### Formulario de Usuario
- Email: formato válido
- Contraseña: 8-16 caracteres
- Nombre: mínimo 3 caracteres
- Teléfono: 9 dígitos numéricos

### Formulario de Película
- Título: obligatorio
- Duración: mínimo 1 minuto
- Género: selección obligatoria
- Clasificación: selección obligatoria

## 🐛 Solución de Problemas

### Error: "Network Error"
Verifica que el backend esté corriendo en `http://localhost:5000`

### Error: "No autorizado"
El token JWT puede haber expirado. Cierra sesión y vuelve a iniciar.

### Imágenes no se muestran
Verifica que las URLs de imágenes sean accesibles

### Estado no se actualiza
Verifica que uses el contexto de autenticación correctamente

## 🚀 Build para Producción

```bash
# Crear build optimizado
npm run build

# Los archivos estarán en la carpeta build/
```

## 📄 Licencia

Proyecto educativo - Cinestar © 2025
