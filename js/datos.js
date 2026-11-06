/*
 * Datos del restaurante. Para adaptar la web a otro negocio,
 * basta con editar este archivo: nombre, teléfono, horario y carta.
 */
const RESTAURANTE = {
  nombre: "Fogón del Algarrobo",
  // Número de WhatsApp en formato internacional (51 = Perú), sin "+" ni espacios.
  // En la demo los pedidos llegan al desarrollador; para un cliente, poner el número del negocio.
  whatsapp: "51986088743",
  direccion: "Av. José Balta 1250, Chiclayo",
  referencia: "A dos cuadras del Mercado Modelo",
  mapa: "https://www.openstreetmap.org/export/embed.html?bbox=-79.8475%2C-6.7735%2C-79.8335%2C-6.7655&layer=mapnik&marker=-6.7695%2C-79.8405",
  mapaEnlace: "https://www.openstreetmap.org/?mlat=-6.7695&mlon=-79.8405#map=17/-6.7695/-79.8405",
  delivery: 5.0, // costo de delivery en soles
  // Horario: 0 = domingo ... 6 = sábado. null = cerrado.
  horario: {
    0: { abre: "11:00", cierra: "17:00" },
    1: null,
    2: { abre: "11:30", cierra: "22:00" },
    3: { abre: "11:30", cierra: "22:00" },
    4: { abre: "11:30", cierra: "22:00" },
    5: { abre: "11:30", cierra: "23:00" },
    6: { abre: "11:00", cierra: "23:00" },
  },
};

// Menú del día según el día de la semana (incluye entrada, segundo y refresco).
const MENU_DEL_DIA = {
  0: { plato: "Arroz con pato a la chiclayana", entrada: "Causa ferreñafana", precio: 24 },
  1: { plato: "Espesado con carne de res", entrada: "Sopa de choclo", precio: 16, nota: "Lunes de espesado, como manda la tradición." },
  2: { plato: "Seco de cabrito con frejoles", entrada: "Ceviche de caballa", precio: 18 },
  3: { plato: "Arroz con pato a la chiclayana", entrada: "Papa a la huancaína", precio: 18 },
  4: { plato: "Pepián de pavo", entrada: "Tortitas de choclo", precio: 17 },
  5: { plato: "Sudado de mero", entrada: "Ceviche de caballa", precio: 20 },
  6: { plato: "Chinguirito con yuca y zarandaja", entrada: "Humita", precio: 19 },
};

const CARTA = [
  {
    id: "norteños",
    nombre: "Platos norteños",
    platos: [
      { id: "pato", nombre: "Arroz con pato a la chiclayana", desc: "Pato tierno, arroz verde de culantro y loche, con sarsa criolla.", precio: 38, estrella: true },
      { id: "cabrito", nombre: "Seco de cabrito", desc: "Cabrito macerado en chicha de jora, frejoles y arroz.", precio: 42, estrella: true },
      { id: "pepian", nombre: "Pepián de pavo", desc: "Guiso espeso de choclo rallado con pavo dorado.", precio: 32 },
      { id: "espesado", nombre: "Espesado", desc: "Guiso verde de choclo, loche y carne. Solo los lunes en el menú, todos los días a la carta.", precio: 28 },
      { id: "cuy", nombre: "Cuy frito", desc: "Cuy entero crocante con papas doradas y ají.", precio: 45 },
      { id: "tortilla", nombre: "Tortilla de raya", desc: "Raya seca deshilachada con huevo, cebolla y ají limo.", precio: 30 },
    ],
  },
  {
    id: "marinos",
    nombre: "Del mar",
    platos: [
      { id: "ceviche", nombre: "Ceviche de mero", desc: "Mero del día, limón de Olmos, ají limo, camote y zarandaja.", precio: 40, estrella: true },
      { id: "chinguirito", nombre: "Chinguirito", desc: "Ceviche de guitarra seca, el clásico de Lambayeque.", precio: 30 },
      { id: "sudado", nombre: "Sudado de mero", desc: "En caldo de tomate, cebolla y chicha, con yuca.", precio: 42 },
      { id: "chicharron", nombre: "Chicharrón de pota", desc: "Crocante, con sarsa criolla y salsa tártara.", precio: 30 },
    ],
  },
  {
    id: "entradas",
    nombre: "Entradas",
    platos: [
      { id: "causa", nombre: "Causa ferreñafana", desc: "Papa amarilla, yuca, camote, pescado salado y huevo.", precio: 20 },
      { id: "humitas", nombre: "Humitas (2 unid.)", desc: "De choclo, con queso fresco o dulces.", precio: 10 },
      { id: "huancaina", nombre: "Papa a la huancaína", desc: "Con huevo y aceituna de botija.", precio: 14 },
      { id: "tortitas", nombre: "Tortitas de choclo", desc: "Con sarsa de cebolla y rocoto.", precio: 12 },
    ],
  },
  {
    id: "bebidas",
    nombre: "Bebidas",
    platos: [
      { id: "chicha", nombre: "Chicha morada (jarra 1 L)", desc: "Hecha en casa con maíz morado y piña.", precio: 14 },
      { id: "jora", nombre: "Chicha de jora (vaso)", desc: "Fermentada, servida bien fría.", precio: 6 },
      { id: "maracuya", nombre: "Maracuyá (jarra 1 L)", desc: "Fruta natural.", precio: 14 },
      { id: "gaseosa", nombre: "Gaseosa 500 ml", desc: "Inca Kola o Coca-Cola.", precio: 5 },
    ],
  },
  {
    id: "postres",
    nombre: "Postres",
    platos: [
      { id: "kingkong", nombre: "King Kong de manjar (porción)", desc: "Galleta, manjarblanco y dulce de piña. De Lambayeque para el mundo.", precio: 9 },
      { id: "mazamorra", nombre: "Mazamorra morada", desc: "Con arroz con leche si la pides combinada.", precio: 7 },
      { id: "suspiro", nombre: "Suspiro a la limeña", desc: "Manjar de yemas y merengue al oporto.", precio: 10 },
    ],
  },
];
