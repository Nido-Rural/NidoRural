/**
 * ============================================================================
 * PROYECTO: NIDO RURAL - E-COMMERCE ORGÁNICO
 * ARCHIVO: js/main.js
 * ============================================================================
 * 
 * GUÍA DIDÁCTICA PARA ALUMNOS / PRESENTACIÓN:
 * Este archivo implementa toda la lógica compartida entre las páginas del sitio:
 * 1. Prevención de Errores Multiógina (Páginas index.html y productos.html):
 *    - Validación defensiva de elementos DOM con condicionales 'if (elemento)'.
 *    - Si un elemento no existe en la página actual (ej. el mapa o el catálogo
 *      en la portada index.html), el código no intenta manipularlo, evitando
 *      errores de 'null' en la consola del navegador.
 * 2. Catálogo Agropecuario: Productos ganaderos y agrícolas con precios en Guaraníes.
 * 3. Persistencia en localStorage: Mantiene los productos agregados al recargar.
 * 4. Zonas de Delivery de Cordillera: Caacupé, Tobatí, Atyrá y Eusebio Ayala.
 * 5. MAPA INTERACTIVO CON LEAFLET.JS:
 *    - Inicialización segura solo en páginas que contengan #mapa-delivery.
 *    - Centrado en Caacupé (-25.3856, -57.1403) con pin rojo arrastrable.
 *    - Fix con map.invalidateSize() tras 300ms al abrir el modal.
 * 6. Checkout Automatizado con WhatsApp API (+595 991 211207).
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. BASE DE DATOS SIMULADA (CATÁLOGO GANADERO Y AGRÍCOLA)
     --------------------------------------------------------------------------
     Precios enteros en Guaraníes (Gs.) listos para ser editados.
     ========================================================================== */
  const productos = [
    {
      id: 1,
      nombre: 'Huevos Caseros (6 unidades)',
      precio: 9000, // Gs. 9.000
      categoria: 'Producción Ganadera',
      etiqueta: '6 Unidades',
      descripcion: 'Media docena de huevos frescos de campo, recolectados diariamente de gallinas criadas en libertad y con alimentación natural.',
      imagen: 'img/huevo6unidades.jpeg'
    },
    {
      id: 2,
      nombre: 'Huevos Caseros (12 unidades)',
      precio: 18000, // Gs. 18.000
      categoria: 'Producción Ganadera',
      etiqueta: '12 Unidades',
      descripcion: 'Docena de huevos frescos de campo de gallinas libres de jaula, con yema dorada y máxima frescura garantizada.',
      imagen: 'img/huevo12unidades.jpeg'
    },
    {
      id: 3,
      nombre: 'Huevos Caseros (Plancha de 30 unidades)',
      precio: 45000, // Gs. 45.000
      categoria: 'Producción Ganadera',
      etiqueta: 'Plancha 30 Unid.',
      descripcion: 'Plancha completa de 30 huevos caseros de campo seleccionados, ideales para el consumo familiar y preparaciones culinarias.',
      imagen: 'img/huevo30unidades.jpeg'
    },
    {
      id: 4,
      nombre: 'Queso Artesanal (1 Kg)',
      precio: 40000, // Gs. 40.000
      categoria: 'Lácteos Artesanales',
      etiqueta: 'Pieza de 1 Kg',
      descripcion: 'Queso criollo de campo elaborado artesanalmente con leche pura de vaca, consistencia firme y sabor tradicional.',
      imagen: 'img/queso.jpeg'
    },
    {
      id: 5,
      nombre: 'Leche Fresca (1,5 Litros)',
      precio: 19500, // Gs. 19.500
      categoria: 'Lácteos Artesanales',
      etiqueta: 'Botella 1,5 L',
      descripcion: 'Botella de 1,5 litros de leche fresca pasteurizada, sin conservantes ni aditivos químicos, directo de tambo rural.',
      imagen: 'img/leche.jpeg'
    },
    {
      id: 6,
      nombre: 'Canasta de Verduras',
      precio: 45500, // Gs. 45.500
      categoria: 'Huerta Agroecológica',
      etiqueta: 'Surtido Completo',
      descripcion: 'Verduras variadas: 1 mazo de lechuga, 1 mazo de perejil, 5 cebollas, 6 tomates, 5 locotes, 3 mazos de mandioca, 5 zanahorias, 1 zapallo, 5 papas, 4 remolachas.',
      imagen: 'img/canasta.jpeg'
    },
    {
      id: 7,
      nombre: 'Harina de Maíz (1 Kg)',
      precio: 13800, // Gs. 13.800
      categoria: 'Almacén Rural',
      etiqueta: 'Bolsa de 1 Kg',
      descripcion: 'Harina de maíz seleccionada de molienda tradicional, ideal para la elaboración de auténtica sopa paraguaya, chipa guasu y platos típicos.',
      imagen: 'img/harinamaiz.jpeg'
    },
    {
      id: 8,
      nombre: 'Almidón de Mandioca (1 Kg)',
      precio: 13800, // Gs. 13.800
      categoria: 'Almacén Rural',
      etiqueta: 'Bolsa de 1 Kg',
      descripcion: 'Almidón de mandioca refinado y de textura suave, ingrediente fundamental para preparar la tradicional chipa paraguaya y mbeju casero.',
      imagen: 'img/almidon.jpeg'
    },
    {
      id: 9,
      nombre: 'Harina de Trigo (1 Kg)',
      precio: 4700, // Gs. 4.700
      categoria: 'Almacén Rural',
      etiqueta: 'Paquete de 1 Kg',
      descripcion: 'Harina de trigo de máxima pureza y calidad para masas, panes caseros, tortas y todo tipo de preparaciones de panadería artesanal.',
      imagen: 'img/harina.jpeg'
    }
  ];

  /* ==========================================================================
     2. GESTIÓN DEL ESTADO Y LOCALSTORAGE
     --------------------------------------------------------------------------
     Persistencia en el navegador para que no se pierdan los productos agregados.
     ========================================================================== */
  const CLAVE_LOCALSTORAGE = 'nido_rural_carrito';

  function obtenerCarritoDeLocalStorage() {
    const datos = localStorage.getItem(CLAVE_LOCALSTORAGE);
    return datos ? JSON.parse(datos) : [];
  }

  function guardarCarritoEnLocalStorage() {
    localStorage.setItem(CLAVE_LOCALSTORAGE, JSON.stringify(carrito));
  }

  let carrito = obtenerCarritoDeLocalStorage();

  /* ==========================================================================
     3. FORMATEO DE MONEDA LOCAL (GUARANÍES - PARAGUAY)
     --------------------------------------------------------------------------
     Formatea números al estándar oficial de Paraguay: Gs. XX.XXX.
     ========================================================================== */
  function formatearGuaranies(valor) {
    const formateado = Number(valor).toLocaleString('es-PY', {
      maximumFractionDigits: 0
    });
    return `Gs. ${formateado}`;
  }

  /* ==========================================================================
     4. REFERENCIAS A ELEMENTOS DEL DOM (SELECTORES CON VALIDACIÓN DEFENSIVA)
     --------------------------------------------------------------------------
     Cada selector se obtiene de forma segura. En index.html algunos elementos
     no existen (ej. productos-contenedor o modal-carrito), por lo que debemos
     validar su existencia antes de utilizarlos.
     ========================================================================== */
  // Contenedores del catálogo (solo existen en productos.html)
  const seccionProductos = document.getElementById('productos-contenedor');
  const contenedorGrid = document.querySelector('#productos-contenedor .grid');

  // Header y Botones Flotantes (Badges de conteo)
  const btnAbrirCarritoHeader = document.getElementById('btn-carrito');
  const contadorCarritoHeader = document.getElementById('contador-carrito');
  const btnCarritoFlotante = document.getElementById('btn-carrito-flotante');
  const contadorCarritoFlotante = document.getElementById('contador-carrito-flotante');

  // Modal del Carrito
  const modalCarrito = document.getElementById('modal-carrito');
  const btnCerrarCarrito = document.getElementById('cerrar-carrito');
  const listaCarrito = document.getElementById('carrito-items');

  // Sección de Método de Entrega y Delivery
  const radiosMetodoEntrega = document.querySelectorAll('input[name="metodo-entrega"]');
  const seccionDelivery = document.getElementById('seccion-delivery');
  const selectZonaDelivery = document.getElementById('select-zona');
  const inputDireccionDelivery = document.getElementById('input-direccion');
  const filaCostoDelivery = document.getElementById('fila-costo-delivery');

  // Desglose de Totales y Botón de Checkout
  const subtotalCarritoTexto = document.getElementById('carrito-subtotal');
  const costoDeliveryTexto = document.getElementById('carrito-costo-delivery');
  const totalCarritoTexto = document.getElementById('carrito-total');
  const btnConfirmarPedido = document.getElementById('btn-confirmar-pedido');

  /* ==========================================================================
     5. VARIABLES Y CONFIGURACIÓN DEL MAPA INTERACTIVO (LEAFLET.JS)
     --------------------------------------------------------------------------
     Coordenadas iniciales: Caacupé, Departamento de Cordillera
     Latitud: -25.3856 | Longitud: -57.1403
     ========================================================================== */
  const COORDENADAS_DEFAULT = {
    lat: -25.3856,
    lng: -57.1403
  };

  // Coordenadas de las ciudades del Dpto. de Cordillera
  const COORDENADAS_CORDILLERA = {
    'Caacupé': { lat: -25.3856, lng: -57.1403 },
    'Tobatí': { lat: -25.2608, lng: -57.0672 },
    'Atyrá': { lat: -25.2794, lng: -57.1683 },
    'Eusebio Ayala': { lat: -25.3972, lng: -56.9606 }
  };

  let coordenadasDelivery = { ...COORDENADAS_DEFAULT };
  let mapaLeaflet = null;
  let marcadorDelivery = null;

  function crearIconoMarcadorRojo() {
    return L.divIcon({
      className: 'custom-marcador-rojo',
      html: `
        <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: grab;">
          <svg width="34" height="42" viewBox="0 0 24 30" fill="none" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 18 12 18s12-9 12-18c0-6.63-5.37-12-12-12z" fill="#DC2626"/>
            <circle cx="12" cy="11" r="4.5" fill="#FFFFFF"/>
          </svg>
        </div>
      `,
      iconSize: [0, 0]
    });
  }

  /**
   * Inicializa el mapa interactivo SOLO si el contenedor #mapa-delivery existe en la página
   */
  function inicializarMapaDelivery() {
    const contenedorMapa = document.getElementById('mapa-delivery');
    if (!contenedorMapa) return; // Validación defensiva

    if (mapaLeaflet !== null) return;

    if (typeof L === 'undefined') {
      console.warn('Leaflet aún no ha terminado de cargar.');
      return;
    }

    // 1. Instanciamos el mapa centrado en Caacupé
    mapaLeaflet = L.map('mapa-delivery', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([coordenadasDelivery.lat, coordenadasDelivery.lng], 14);

    // 2. Capa base OpenStreetMap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapaLeaflet);

    // 3. Marcador rojo arrastrable
    marcadorDelivery = L.marker([coordenadasDelivery.lat, coordenadasDelivery.lng], {
      draggable: true,
      icon: crearIconoMarcadorRojo()
    }).addTo(mapaLeaflet);

    // 4. Capturar coordenadas al soltar el pin
    marcadorDelivery.on('dragend', () => {
      const posicion = marcadorDelivery.getLatLng();
      coordenadasDelivery.lat = posicion.lat;
      coordenadasDelivery.lng = posicion.lng;
    });

    // 5. Clic directo en el mapa para mover el pin
    mapaLeaflet.on('click', (evento) => {
      marcadorDelivery.setLatLng(evento.latlng);
      coordenadasDelivery.lat = evento.latlng.lat;
      coordenadasDelivery.lng = evento.latlng.lng;
    });
  }

  /**
   * Refresca las dimensiones del mapa con un timeout de 300ms
   */
  function refrescarTamanioMapa() {
    const contenedorMapa = document.getElementById('mapa-delivery');
    if (!contenedorMapa) return;

    if (!mapaLeaflet) {
      inicializarMapaDelivery();
    }
    setTimeout(() => {
      if (mapaLeaflet) {
        mapaLeaflet.invalidateSize();
      }
    }, 300);
  }

  /* ==========================================================================
     6. RENDERIZADO DEL CATÁLOGO DE PRODUCTOS (SOLO SI EXISTE EL CONTENEDOR)
     ========================================================================== */
  function renderizarProductos() {
    // Si no estamos en la página del catálogo, no ejecutamos
    // Forzar 2 columnas en móvil y 3 columnas en escritorio (cuadrícula 3x3)
    contenedorGrid.className = 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3';
    contenedorGrid.innerHTML = '';

    productos.forEach(producto => {
      const tarjeta = document.createElement('article');
      tarjeta.className = 'bg-white rounded-xl md:rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group';

      tarjeta.innerHTML = `
        <div class="relative h-40 sm:h-52 md:h-64 w-full overflow-hidden bg-gray-50 flex items-center justify-center p-2 md:p-3">
          <img 
            src="${producto.imagen}" 
            alt="${producto.nombre}" 
            loading="lazy"
            class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            onerror="this.onerror=null; this.src='img/favicon.svg';"
          >
          <span class="absolute top-2 left-2 md:top-3 md:left-3 bg-amarillo-sol text-verde-oscuro text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-sm z-10">
            ${producto.etiqueta}
          </span>
        </div>

        <div class="p-3 md:p-6 flex-grow flex flex-col justify-between">
          <div>
            <span class="text-[10px] md:text-xs uppercase tracking-wider font-semibold text-verde-claro">${producto.categoria}</span>
            <h3 class="font-display font-bold text-sm md:text-base text-stone-900 mt-0.5 md:mt-1 leading-snug">${producto.nombre}</h3>
            <p class="hidden md:block text-sm text-stone-600 mt-2 leading-relaxed">
              ${producto.descripcion}
            </p>
          </div>

          <div class="mt-3 md:mt-6 pt-2.5 md:pt-4 border-t border-stone-100 flex items-center justify-between gap-1">
            <div>
              <span class="text-[10px] md:text-xs text-stone-500 block leading-tight">Precio por unidad</span>
              <span class="text-sm sm:text-base md:text-xl font-bold text-verde-oscuro leading-tight">${formatearGuaranies(producto.precio)}</span>
            </div>
            
            <button 
              type="button"
              class="btn-agregar-carrito inline-flex items-center gap-1 bg-verde-oscuro hover:bg-verde-claro text-white text-xs md:text-sm font-semibold px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl shadow-sm hover:shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-verde-claro active:scale-95 flex-shrink-0"
              data-id="${producto.id}"
            >
              <svg class="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Agregar</span>
            </button>
          </div>
        </div>
      `;

      contenedorGrid.appendChild(tarjeta);
    });
  }

  /* ==========================================================================
     7. LÓGICA DE NEGOCIO DEL CARRITO
     ========================================================================== */
  function agregarAlCarrito(idProducto) {
    const productoOriginal = productos.find(p => p.id === idProducto);
    if (!productoOriginal) return;

    const itemExistente = carrito.find(item => item.id === idProducto);

    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      carrito.push({
        id: productoOriginal.id,
        nombre: productoOriginal.nombre,
        precio: productoOriginal.precio,
        imagen: productoOriginal.imagen,
        cantidad: 1
      });
    }

    guardarCarritoEnLocalStorage();
    actualizarInterfazCarrito();

    animarElemento(btnAbrirCarritoHeader);
    animarElemento(btnCarritoFlotante);
  }

  function modificarCantidad(idProducto, delta) {
    const item = carrito.find(p => p.id === idProducto);
    if (!item) return;

    item.cantidad += delta;

    if (item.cantidad <= 0) {
      eliminarDelCarrito(idProducto);
      return;
    }

    guardarCarritoEnLocalStorage();
    actualizarInterfazCarrito();
  }

  function eliminarDelCarrito(idProducto) {
    carrito = carrito.filter(item => item.id !== idProducto);
    guardarCarritoEnLocalStorage();
    actualizarInterfazCarrito();
  }

  function vaciarCarrito() {
    carrito = [];
    guardarCarritoEnLocalStorage();
    actualizarInterfazCarrito();
  }

  function calcularSubtotalProductos() {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  function calcularTotalUnidades() {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  }

  function animarElemento(elem) {
    if (!elem) return;
    elem.classList.add('scale-110');
    setTimeout(() => elem.classList.remove('scale-110'), 200);
  }

  /* ==========================================================================
     8. SISTEMA DE MÉTODO DE ENTREGA Y CÁLCULO DE TOTALES (CORDILLERA)
     ========================================================================== */
  function obtenerMetodoEntregaSeleccionado() {
    const radio = document.querySelector('input[name="metodo-entrega"]:checked');
    return radio ? radio.value : 'retiro';
  }

  function obtenerCostoDelivery() {
    const metodo = obtenerMetodoEntregaSeleccionado();
    if (metodo === 'delivery' && selectZonaDelivery) {
      return parseInt(selectZonaDelivery.value, 10) || 0;
    }
    return 0;
  }

  function actualizarTotales() {
    const subtotal = calcularSubtotalProductos();
    const costoDelivery = obtenerCostoDelivery();
    const metodo = obtenerMetodoEntregaSeleccionado();
    const totalFinal = subtotal + costoDelivery;

    if (subtotalCarritoTexto) {
      subtotalCarritoTexto.textContent = formatearGuaranies(subtotal);
    }

    if (filaCostoDelivery && costoDeliveryTexto) {
      if (metodo === 'delivery') {
        filaCostoDelivery.classList.remove('hidden');
        costoDeliveryTexto.textContent = formatearGuaranies(costoDelivery);
      } else {
        filaCostoDelivery.classList.add('hidden');
        costoDeliveryTexto.textContent = formatearGuaranies(0);
      }
    }

    if (totalCarritoTexto) {
      totalCarritoTexto.textContent = formatearGuaranies(totalFinal);
    }
  }

  function sincronizarVistaMetodoEntrega() {
    if (!seccionDelivery) return; // Validación defensiva

    const metodo = obtenerMetodoEntregaSeleccionado();
    if (metodo === 'delivery') {
      seccionDelivery.classList.remove('hidden');
      refrescarTamanioMapa();
    } else {
      seccionDelivery.classList.add('hidden');
    }
    actualizarTotales();
  }

  /* ==========================================================================
     9. ACTUALIZACIÓN INTEGRAL DE LA INTERFAZ DEL CARRITO
     ========================================================================== */
  function actualizarInterfazCarrito() {
    const totalUnidades = calcularTotalUnidades();

    // Sincronizar contadores si están presentes en la página
    if (contadorCarritoHeader) contadorCarritoHeader.textContent = totalUnidades;
    if (contadorCarritoFlotante) contadorCarritoFlotante.textContent = totalUnidades;

    // Si la lista del modal no existe en esta página (ej. en index.html), terminamos
    if (!listaCarrito) return;

    if (carrito.length === 0) {
      listaCarrito.innerHTML = `
        <div id="carrito-vacio" class="flex flex-col items-center justify-center text-center py-8 text-stone-500">
          <svg class="w-16 h-16 text-stone-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="font-medium text-stone-700">Tu carrito aún está vacío</p>
          <p class="text-xs text-stone-500 mt-1 max-w-xs">Agrega productos frescos de nuestro campo para comenzar tu pedido.</p>
        </div>
      `;
      actualizarTotales();
      return;
    }

    listaCarrito.innerHTML = '';
    carrito.forEach(item => {
      const subtotalItem = item.precio * item.cantidad;
      const fila = document.createElement('div');
      fila.className = 'py-4 flex items-center gap-4';

      fila.innerHTML = `
        <img 
          src="${item.imagen}" 
          alt="${item.nombre}" 
          class="w-16 h-16 object-cover rounded-xl border border-stone-200 flex-shrink-0"
          onerror="this.onerror=null; this.src='img/favicon.svg';"
        >

        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-stone-900 text-sm truncate">${item.nombre}</h4>
          <p class="text-xs text-stone-500 mt-0.5">Unitario: ${formatearGuaranies(item.precio)}</p>
          
          <div class="flex items-center gap-2 mt-2">
            <button 
              type="button" 
              class="btn-restar-cantidad w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold transition focus:outline-none"
              data-id="${item.id}"
              aria-label="Restar una unidad"
            >-</button>

            <span class="text-xs font-semibold text-stone-800 min-w-[1.25rem] text-center">
              ${item.cantidad}
            </span>

            <button 
              type="button" 
              class="btn-sumar-cantidad w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold transition focus:outline-none"
              data-id="${item.id}"
              aria-label="Sumar una unidad"
            >+</button>
          </div>
        </div>

        <div class="flex flex-col items-end justify-between self-stretch">
          <button 
            type="button" 
            class="btn-eliminar-item text-stone-400 hover:text-red-500 p-1 transition focus:outline-none"
            data-id="${item.id}"
            title="Eliminar producto"
          >
            <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <span class="text-sm font-bold text-verde-oscuro">
            ${formatearGuaranies(subtotalItem)}
          </span>
        </div>
      `;

      listaCarrito.appendChild(fila);
    });

    actualizarTotales();
  }

  /* ==========================================================================
     10. CONTROL DEL MODAL (ABRIR / CERRAR) CON FIX DE LEAFLET
     --------------------------------------------------------------------------
     Al ejecutar abrirCarrito(), agregamos un setTimeout de 300ms que invoca
     map.invalidateSize() para que Leaflet recalcule sus dimensiones exactas.
     ========================================================================== */
  function abrirCarrito() {
    if (modalCarrito) {
      modalCarrito.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');

      // FIX CRUCIAL: Esperamos 300ms a que el modal termine de renderizarse
      setTimeout(() => {
        if (!mapaLeaflet) {
          inicializarMapaDelivery();
        }
        if (mapaLeaflet) {
          mapaLeaflet.invalidateSize();
        }
      }, 300);
    }
  }

  function cerrarCarrito() {
    if (modalCarrito) {
      modalCarrito.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  /* ==========================================================================
     11. INTEGRACIÓN CON WHATSAPP (CHECKOUT CON ENLACE DE GOOGLE MAPS)
     --------------------------------------------------------------------------
     Formato del enlace de ubicación:
     https://maps.google.com/?q=latitud,longitud
     ========================================================================== */
  function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío. Agrega productos de nuestro catálogo antes de confirmar tu pedido.');
      return;
    }

    const metodo = obtenerMetodoEntregaSeleccionado();
    let zonaNombre = '';
    let costoDelivery = 0;
    let direccionTexto = '';
    let enlaceGoogleMaps = '';

    if (metodo === 'delivery') {
      direccionTexto = inputDireccionDelivery ? inputDireccionDelivery.value.trim() : '';

      if (!direccionTexto) {
        alert('Por favor, ingresa tu dirección exacta para realizar el envío por delivery.');
        if (inputDireccionDelivery) inputDireccionDelivery.focus();
        return;
      }

      if (selectZonaDelivery) {
        const optionSeleccionada = selectZonaDelivery.options[selectZonaDelivery.selectedIndex];
        zonaNombre = optionSeleccionada.dataset.nombre || optionSeleccionada.text.split('(')[0].trim();
        costoDelivery = parseInt(selectZonaDelivery.value, 10) || 0;
      }

      const latFormateada = coordenadasDelivery.lat.toFixed(6);
      const lngFormateada = coordenadasDelivery.lng.toFixed(6);
      enlaceGoogleMaps = `https://maps.google.com/?q=${latFormateada},${lngFormateada}`;
    }

    let mensaje = '¡Hola Nido Rural! Quiero realizar el siguiente pedido:\n\n';

    carrito.forEach((item, indice) => {
      const subtotalItem = item.precio * item.cantidad;
      mensaje += `${indice + 1}. *${item.nombre}*\n`;
      mensaje += `   • Cantidad: ${item.cantidad}\n`;
      mensaje += `   • Costo individual: ${formatearGuaranies(item.precio)}\n`;
      mensaje += `   • Subtotal: ${formatearGuaranies(subtotalItem)}\n\n`;
    });

    const subtotalProductos = calcularSubtotalProductos();
    const totalFinal = subtotalProductos + costoDelivery;

    mensaje += '------------------------------------\n';
    mensaje += `Subtotal Productos: ${formatearGuaranies(subtotalProductos)}\n`;

    if (metodo === 'delivery') {
      mensaje += 'Método de entrega: Delivery 🛵\n';
      mensaje += `Zona: ${zonaNombre}\n`;
      mensaje += `Dirección: ${direccionTexto}\n`;
      mensaje += `Ubicación en mapa: ${enlaceGoogleMaps}\n`;
      mensaje += `Costo del Delivery: ${formatearGuaranies(costoDelivery)}\n`;
    } else {
      mensaje += 'Método de entrega: Retiro en la tienda 🏪\n';
    }

    mensaje += '------------------------------------\n';
    mensaje += `*Total a pagar: ${formatearGuaranies(totalFinal)}*\n`;
    mensaje += '------------------------------------\n\n';
    mensaje += '¡Quedo a la espera de su confirmación! Muchas gracias.';

    const mensajeCodificado = encodeURIComponent(mensaje);
    const numeroWhatsApp = '595992496455';
    const urlWhatsApp = `https://wa.me/595992496455?text=${mensajeCodificado}`;

    window.open(urlWhatsApp, '_blank');

    vaciarCarrito();
    if (inputDireccionDelivery) inputDireccionDelivery.value = '';
    const radioRetiro = document.getElementById('entrega-retiro');
    if (radioRetiro) {
      radioRetiro.checked = true;
      sincronizarVistaMetodoEntrega();
    }
    cerrarCarrito();
  }

  /* ==========================================================================
     12. ASIGNACIÓN DE EVENT LISTENERS (PROTEGIDOS CON CONDICIONALES)
     --------------------------------------------------------------------------
     Solo se asignan listeners a los elementos que existan en la página actual.
     ========================================================================== */

  // A) Abrir carrito
  if (btnAbrirCarritoHeader) btnAbrirCarritoHeader.addEventListener('click', abrirCarrito);
  if (btnCarritoFlotante) btnCarritoFlotante.addEventListener('click', abrirCarrito);

  // B) Cerrar carrito
  if (btnCerrarCarrito) btnCerrarCarrito.addEventListener('click', cerrarCarrito);
  
  if (modalCarrito) {
    modalCarrito.addEventListener('click', (e) => {
      if (e.target === modalCarrito) {
        cerrarCarrito();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalCarrito && !modalCarrito.classList.contains('hidden')) {
      cerrarCarrito();
    }
  });

  // C) Delegación de eventos en el catálogo para "Agregar al carrito"
  if (contenedorGrid) {
    contenedorGrid.addEventListener('click', (e) => {
      const boton = e.target.closest('.btn-agregar-carrito');
      if (boton) {
        const id = parseInt(boton.dataset.id, 10);
        agregarAlCarrito(id);
      }
    });
  }

  // D) Delegación de eventos dentro del modal (+, -, eliminar)
  if (listaCarrito) {
    listaCarrito.addEventListener('click', (e) => {
      const botonSumar = e.target.closest('.btn-sumar-cantidad');
      if (botonSumar) {
        modificarCantidad(parseInt(botonSumar.dataset.id, 10), 1);
        return;
      }

      const botonRestar = e.target.closest('.btn-restar-cantidad');
      if (botonRestar) {
        modificarCantidad(parseInt(botonRestar.dataset.id, 10), -1);
        return;
      }

      const botonEliminar = e.target.closest('.btn-eliminar-item');
      if (botonEliminar) {
        eliminarDelCarrito(parseInt(botonEliminar.dataset.id, 10));
        return;
      }
    });
  }

  // E) Evento para cambio de Método de Entrega (Retiro / Delivery)
  if (radiosMetodoEntrega.length > 0) {
    radiosMetodoEntrega.forEach(radio => {
      radio.addEventListener('change', sincronizarVistaMetodoEntrega);
    });
  }

  // F) Evento para cambio de Zona de Delivery en el <select>
  if (selectZonaDelivery) {
    selectZonaDelivery.addEventListener('change', () => {
      const optionSeleccionada = selectZonaDelivery.options[selectZonaDelivery.selectedIndex];
      const nombreCiudad = optionSeleccionada.dataset.nombre || optionSeleccionada.text.split('(')[0].trim();

      if (COORDENADAS_CORDILLERA[nombreCiudad] && mapaLeaflet && marcadorDelivery) {
        const nuevaCoord = COORDENADAS_CORDILLERA[nombreCiudad];
        coordenadasDelivery.lat = nuevaCoord.lat;
        coordenadasDelivery.lng = nuevaCoord.lng;
        mapaLeaflet.setView([nuevaCoord.lat, nuevaCoord.lng], 14);
        marcadorDelivery.setLatLng([nuevaCoord.lat, nuevaCoord.lng]);
      }
      actualizarTotales();
    });
  }

  // G) Evento para Confirmar Pedido vía WhatsApp
  if (btnConfirmarPedido) {
    btnConfirmarPedido.addEventListener('click', enviarPedidoWhatsApp);
  }

  /* ==========================================================================
     13. INICIALIZACIÓN CONDICIONAL DE LA APLICACIÓN
     --------------------------------------------------------------------------
     Se ejecuta únicamente lo que corresponda a la página activa.
     ========================================================================== */
  // Si existe el catálogo (en productos.html), renderizamos los productos
  if (contenedorGrid) {
    renderizarProductos();
  }

  // Si existe el formulario de entrega, sincronizamos la vista inicial
  if (seccionDelivery) {
    sincronizarVistaMetodoEntrega();
  }

  // Siempre actualizamos contadores del carrito (si los badges existen en la página)
  actualizarInterfazCarrito();

  console.log('🌱 Nido Rural: Script main.js cargado correctamente.');
});
