// src/data/mockData.js

export const peliculas = [
    {
        id: "1",
        titulo: "Godzilla y Kong: El nuevo imperio",
        genero: "Acción, Aventura, Fantasía",
        duracion: "1h 55min",
        sinopsis: "Godzilla y Kong se enfrentan a una colosal amenaza...",
        imagen: "/images/godzilla-kong.jpg",
        horarios: [
            "15:30",
            "18:00",
            "20:45"
        ],
        sedes: [
            "CineStar Plaza Norte",
            "CineStar San Borja"
        ],
        formato: "2D/3D/4DX",
        idioma: "Español Subtitulado",
        clasificacion: "PG-13",
        disponible: true // Para distinguir entre cartelera y próximos estrenos
    },
    {
        id: "2",
        titulo: "Intensamente 2",
        genero: "Animación, Aventura, Comedia",
        duracion: "1h 36min",
        sinopsis: "Riley, la protagonista, se enfrenta a nuevas emociones...",
        imagen: "/images/intensamente2.jpg",
        horarios: [
            "14:00",
            "16:30",
            "19:00"
        ],
        sedes: [
            "CineStar Plaza Norte",
            "CineStar San Borja",
            "CineStar Miraflores"
        ],
        formato: "2D",
        idioma: "Español Latino",
        clasificacion: "G",
        disponible: true
    },
    {
        id: "3",
        titulo: "Civil War",
        genero: "Acción, Drama",
        duracion: "1h 49min",
        sinopsis: "Un grupo de periodistas viaja a través de Estados Unidos durante una rápida escalada de la segunda Guerra Civil Americana...",
        imagen: "/images/civil-war.jpg",
        horarios: [
            "17:00",
            "19:30",
            "22:00"
        ],
        sedes: [
            "CineStar Plaza Norte",
            "CineStar San Borja"
        ],
        formato: "2D",
        idioma: "Español Subtitulado",
        clasificacion: "R",
        disponible: true
    },
    {
        id: "4",
        titulo: "Furiosa: Mad Max",
        genero: "Acción, Aventura",
        duracion: "2h 18min",
        sinopsis: "Pre-cuela de Mad Max: Furiosa, la historia de la joven guerrera.",
        imagen: "/images/furiosa.jpg",
        horarios: [
            "16:00",
            "19:15",
            "22:30"
        ],
        sedes: [
            "CineStar Miraflores",
            "CineStar San Borja"
        ],
        formato: "IMAX",
        idioma: "Inglés Subtitulado",
        clasificacion: "R",
        disponible: false // Próximo estreno
    },
    {
        id: "5",
        titulo: "Moana 2",
        genero: "Animación, Aventura, Comedia",
        duracion: "1h 44min",
        sinopsis: "Moana regresa para emprender un nuevo viaje con sus aliados.",
        imagen: "/images/moana2.jpg",
        horarios: [
            "13:00",
            "15:30",
            "18:00"
        ],
        sedes: [
            "CineStar Plaza Norte",
            "CineStar Miraflores"
        ],
        formato: "2D",
        idioma: "Español Latino",
        clasificacion: "G",
        disponible: false // Próximo estreno
    },
    {
        id: "6",
        titulo: "Deadpool & Wolverine",
        genero: "Acción, Comedia, Superhéroes",
        duracion: "1h 55min",
        sinopsis: "Wade Wilson y Logan se unen para salvar el multiverso.",
        imagen: "/images/deadpool-wolverine.jpg",
        horarios: [
            "16:00",
            "19:00",
            "22:00"
        ],
        sedes: [
            "CineStar Plaza Norte",
            "CineStar Miraflores"
        ],
        formato: "2D/3D",
        idioma: "Inglés Subtitulado",
        clasificacion: "R",
        disponible: true
    },
    {
        id: "7",
        titulo: "Inside Out 2",
        genero: "Animación, Aventura, Comedia",
        duracion: "1h 45min",
        sinopsis: "Riley enfrenta nuevas emociones en su adolescencia.",
        imagen: "/images/inside-out2.jpg",
        horarios: [
            "14:30",
            "17:00",
            "19:30"
        ],
        sedes: [
            "CineStar San Borja",
            "CineStar Miraflores"
        ],
        formato: "2D",
        idioma: "Español Latino",
        clasificacion: "G",
        disponible: true
    },
    {
        id: "8",
        titulo: "The Fall Guy",
        genero: "Acción, Comedia, Drama",
        duracion: "1h 50min",
        sinopsis: "Un doble de acción descubre que su exnovia lo ha reclutado para una misión peligrosa.",
        imagen: "/images/fall-guy.jpg",
        horarios: [
            "15:00",
            "18:00",
            "21:00"
        ],
        sedes: [
            "CineStar Plaza Norte",
            "CineStar San Borja"
        ],
        formato: "2D",
        idioma: "Inglés Subtitulado",
        clasificacion: "PG-13",
        disponible: true
    },
    {
        id: "9",
        titulo: "Alien: Romulus",
        genero: "Ciencia Ficción, Terror, Acción",
        duracion: "1h 58min",
        sinopsis: "Una tripulación de jóvenes descubre una estación espacial abandonada con terribles secretos.",
        imagen: "/images/alien-romulus.jpg",
        horarios: [
            "17:30",
            "20:30",
            "23:30"
        ],
        sedes: [
            "CineStar Plaza Norte",
            "CineStar Miraflores"
        ],
        formato: "IMAX",
        idioma: "Inglés Subtitulado",
        clasificacion: "R",
        disponible: false
    },
    {
        id: "10",
        titulo: "Joker: Folie à Deux",
        genero: "Drama, Musical, Crimen",
        duracion: "2h 10min",
        sinopsis: "Arthur Fleck se encuentra en prisión y comienza una relación con Harley Quinn.",
        imagen: "/images/joker-folie.jpg",
        horarios: [
            "16:30",
            "19:30",
            "22:30"
        ],
        sedes: [
            "CineStar San Borja",
            "CineStar Miraflores"
        ],
        formato: "2D",
        idioma: "Inglés Subtitulado",
        clasificacion: "R",
        disponible: false
    }
];

export const proximosEstrenos = peliculas.filter(p => !p.disponible);

export const peliculasEnCartelera = peliculas.filter(p => p.disponible);

export const sedes = [
    {
        id: "101",
        nombre: "CineStar Plaza Norte",
        direccion: "Av. Alfredo Mendiola 1400, Independencia",
        ciudad: "Lima",
        imagen: "/images/sede-plazanorte.jpg",
        horarios: {
            "1": ["14:00", "17:00", "20:00"], // ID de película
            "2": ["15:30", "18:30", "21:30"],
            "3": ["16:00", "19:00", "22:00"]
        }
    },
    {
        id: "102",
        nombre: "CineStar San Borja",
        direccion: "Av. Javier Prado Este 2125, San Borja",
        ciudad: "Lima",
        imagen: "/images/sede-sanborja.jpg",
        horarios: {
            "1": ["15:30", "18:00", "20:45"],
            "2": ["14:00", "16:30", "19:00"],
            "3": ["17:00", "19:30", "22:00"],
            "4": ["16:00", "19:15", "22:30"]
        }
    },
    {
        id: "103",
        nombre: "CineStar Miraflores",
        direccion: "Calle Alcanfores 463, Miraflores",
        ciudad: "Lima",
        imagen: "/images/sede-miraflores.jpg",
        horarios: {
            "2": ["14:00", "16:30", "19:00"],
            "4": ["16:00", "19:15", "22:30"],
            "5": ["13:00", "15:30", "18:00"]
        }
    }
];

export const formatos = [
    { id: "2d", nombre: "2D" },
    { id: "3d", nombre: "3D" },
    { id: "4dx", nombre: "4DX" },
    { id: "imax", nombre: "IMAX" }
];

export const clasificaciones = [
    { id: "g", nombre: "G (Todo público)" },
    { id: "pg", nombre: "PG (Guía parental sugerida)" },
    { id: "pg13", nombre: "PG-13 (Mayores de 13)" },
    { id: "r", nombre: "R (Restringido)" }
];

export const combos = [
    {
        id: "201",
        nombre: "Combo Personal",
        descripcion: "1 cancha mediana + 1 gaseosa mediana",
        precio: 25.50,
        imagen: "/images/combo-personal.jpg",
        categoria: "Combos"
    },
    {
        id: "202",
        nombre: "Combo Dúo",
        descripcion: "1 cancha grande + 2 gaseosas grandes",
        precio: 45.00,
        imagen: "/images/combo-duo.jpg",
        categoria: "Combos"
    },
    {
        id: "203",
        nombre: "Combo Familiar",
        descripcion: "2 canchas grandes + 4 gaseosas grandes + 2 hot dogs",
        precio: 85.00,
        imagen: "/images/combo-familiar.jpg",
        categoria: "Combos"
    },
    {
        id: "204",
        nombre: "Canchita Clásica",
        descripcion: "Palomitas medianas",
        precio: 18.00,
        imagen: "/images/canchita-clasica.jpg",
        categoria: "Canchita"
    },
    {
        id: "205",
        nombre: "Coca Cola Grande",
        descripcion: "Bebida gaseosa",
        precio: 12.00,
        imagen: "/images/cocacola.jpg",
        categoria: "Bebidas"
    },
    {
        id: "206",
        nombre: "Chocman",
        descripcion: "Dulce en barra",
        precio: 8.00,
        imagen: "/images/chocman.jpg",
        categoria: "Golosinas"
    }
];

export const categoriasDulceria = [
    { id: "combos", nombre: "Combos" },
    { id: "canchita", nombre: "Canchita" },
    { id: "bebidas", nombre: "Bebidas" },
    { id: "golosinas", nombre: "Golosinas" },
    { id: "promocional", nombre: "Promocional" },
    { id: "otros", nombre: "Otros" }
];

export const ventasCorporativas = [
    {
        id: "301",
        titulo: "Eventos Corporativos",
        descripcion: "Organiza tu evento dentro del cine con proyecciones privadas.",
        imagen: "/images/eventos-corporativos.jpg",
        formulario: true
    },
    {
        id: "302",
        titulo: "Funciones Especiales",
        descripcion: "Sesiones exclusivas para empleados o clientes.",
        imagen: "/images/funciones-especiales.jpg",
        formulario: true
    },
    {
        id: "303",
        titulo: "At Work",
        descripcion: "Cine en tu oficina o espacio de trabajo.",
        imagen: "/images/at-work.jpg",
        formulario: true
    },
    {
        id: "304",
        titulo: "Publicidad",
        descripcion: "Anuncia tu marca en nuestras salas de cine.",
        imagen: "/images/publicidad.jpg",
        formulario: true
    },
    {
        id: "305",
        titulo: "Funciones Privadas",
        descripcion: "Alquila una sala completa para tu evento.",
        imagen: "/images/funciones-privadas.jpg",
        formulario: true
    },
    {
        id: "306",
        titulo: "Entradas y Combos Corporativos",
        descripcion: "Descuentos y promociones para empresas.",
        imagen: "/images/entradas-combos-corporativos.jpg",
        formulario: true
    }
];

export const usuarios = [
    {
        id: "301",
        nombre: "Juan Pérez",
        email: "juan.perez@example.com",
        telefono: "+51 999 888 777",
        password: "password123"
    },
    {
        id: "302",
        nombre: "María Gonzales",
        email: "maria.gonzales@example.com",
        telefono: "+51 987 654 321",
        password: "pswd123"
    },
    {
        id: "303",
        nombre: "Usuario de Prueba",
        email: "test@cinestar.com",
        telefono: "+51 900 123 456",
        password: "12345"
    }
];

// Datos para la simulación de asientos
export const asientosSala = (sedeId, peliculaId, funcion) => {
    // Esta función simula la disponibilidad de asientos para una sala, película y función específica
    const totalAsientos = 60;
    const ocupados = [1, 2, 3, 10, 11, 12, 20, 21, 22, 30, 31, 32, 40, 41, 42, 50, 51, 52];
    return Array.from({ length: totalAsientos }, (_, i) => ({
        id: i + 1,
        disponible: !ocupados.includes(i + 1),
        tipo: "general", // o "niño", "adulto_mayor", "conadis"
        precio: 10.00 // Precio base
    }));
};

// Tipos de entrada
export const tiposEntrada = [
    { id: "general", nombre: "General", precio: 10.00 },
    { id: "niño", nombre: "Niño (3-11 años)", precio: 7.00 },
    { id: "adulto_mayor", nombre: "Adulto Mayor (60+)", precio: 8.00 },
    { id: "conadis", nombre: "Conadis", precio: 6.00 }
];

// Métodos de pago
export const metodosPago = [
    { id: "tarjeta", nombre: "Tarjeta de Crédito/Débito" },
    { id: "yape", nombre: "Yape" }
];

// historial de compras
export const compras = [
    {
        id: "c001",
        usuarioId: "301",
        pelicula: "Godzilla y Kong: El nuevo imperio",
        sede: "CineStar Plaza Norte",
        horario: "15:30",
        fecha: "2024-11-01",
        asientos: ["A1", "A2"],
        tipoEntradas: [
            { asiento: "A1", tipo: "General", precio: 10.00 },
            { asiento: "A2", tipo: "Niño", precio: 7.00 }
        ],
        combos: [
            { nombre: "Combo Personal", cantidad: 1, precio: 25.50 }
        ],
        total: 42.50,
        metodoPago: "Tarjeta"
    },
    {
        id: "c002",
        usuarioId: "301",
        pelicula: "Intensamente 2",
        sede: "CineStar San Borja",
        horario: "16:30",
        fecha: "2024-11-05",
        asientos: ["B5", "B6", "B7"],
        tipoEntradas: [
            { asiento: "B5", tipo: "General", precio: 10.00 },
            { asiento: "B6", tipo: "Niño", precio: 7.00 },
            { asiento: "B7", tipo: "Adulto Mayor", precio: 8.00 }
        ],
        combos: [
            { nombre: "Combo Familiar", cantidad: 1, precio: 85.00 }
        ],
        total: 108.00,
        metodoPago: "Yape"
    },
    {
        id: "c003",
        usuarioId: "302",
        pelicula: "Civil War",
        sede: "CineStar Plaza Norte",
        horario: "19:30",
        fecha: "2024-11-10",
        asientos: ["C10"],
        tipoEntradas: [
            { asiento: "C10", tipo: "General", precio: 10.00 }
        ],
        combos: [],
        total: 10.00,
        metodoPago: "Tarjeta"
    }
];

