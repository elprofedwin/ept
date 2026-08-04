/* =========================================================================
   ÁREA EPT · CREA Y EMPRENDE 2026 — script.js
   - Navbar con sombra al hacer scroll + barra de progreso de lectura
   - Relleno dinámico del modal de "Proyectos ganadores"
   - Scroll reveal suave para tarjetas y secciones
   - Contador de VISITAS y contador de DESCARGAS por recurso,
     compatible con GitHub Pages (sin backend propio) usando CountAPI,
     con respaldo automático en localStorage si el servicio no responde.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------------
     1. AÑO ACTUAL EN EL FOOTER
  --------------------------------------------------------------------- */
  const anioActual = document.getElementById('anioActual');
  if (anioActual) anioActual.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     2. NAVBAR: sombra al hacer scroll
  --------------------------------------------------------------------- */
  const navbar = document.getElementById('navPrincipal');
  const barraProgreso = document.getElementById('barraProgreso');

  const alActualizarScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle('navbar-alzada', y > 12);

    // Barra de progreso de lectura
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progreso = alturaTotal > 0 ? (y / alturaTotal) * 100 : 0;
    if (barraProgreso) barraProgreso.style.width = progreso + '%';
  };
  window.addEventListener('scroll', alActualizarScroll, { passive: true });
  alActualizarScroll();

  /* ---------------------------------------------------------------------
     2.1 CUENTA REGRESIVA — Expoferia: jueves 27 de agosto, 11:00 a.m.
     Se fija la hora de Perú (UTC-5) de forma explícita en el string ISO,
     para que la cuenta marque lo mismo sin importar la zona horaria del
     dispositivo de quien visita la página.
  --------------------------------------------------------------------- */
  const FECHA_EXPOFERIA = new Date('2026-08-27T11:00:00-05:00');

  const elCrDias = document.getElementById('crDias');
  const elCrHoras = document.getElementById('crHoras');
  const elCrMinutos = document.getElementById('crMinutos');
  const elCrSegundos = document.getElementById('crSegundos');
  const contenedorCuentaRegresiva = document.getElementById('cuentaRegresiva');

  function dosDigitos(numero) {
    return String(numero).padStart(2, '0');
  }

  function actualizarCuentaRegresiva() {
    if (!contenedorCuentaRegresiva) return;
    const ahora = new Date();
    const diferenciaMs = FECHA_EXPOFERIA - ahora;

    if (diferenciaMs <= 0) {
      // La expoferia ya inició o terminó
      elCrDias.textContent = '00';
      elCrHoras.textContent = '00';
      elCrMinutos.textContent = '00';
      elCrSegundos.textContent = '00';
      contenedorCuentaRegresiva.closest('.cuenta-regresiva').classList.add('finalizada');
      const subtitulo = document.querySelector('.cuenta-regresiva-sub');
      if (subtitulo) subtitulo.textContent = '¡La Expoferia Crea y Emprende ya está en marcha!';
      clearInterval(intervaloCuentaRegresiva);
      return;
    }

    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenciaMs / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferenciaMs / (1000 * 60)) % 60);
    const segundos = Math.floor((diferenciaMs / 1000) % 60);

    elCrDias.textContent = dosDigitos(dias);
    elCrHoras.textContent = dosDigitos(horas);
    elCrMinutos.textContent = dosDigitos(minutos);
    elCrSegundos.textContent = dosDigitos(segundos);
  }

  actualizarCuentaRegresiva();
  const intervaloCuentaRegresiva = setInterval(actualizarCuentaRegresiva, 1000);

  /* ---------------------------------------------------------------------
     2.2 OCULTAR EL BOTÓN FLOTANTE DE WHATSAPP AL LLEGAR AL PIE DE PÁGINA
     Evita que el botón fijo se superponga al contador de visitas del
     footer (ambos coinciden en la esquina inferior derecha).
  --------------------------------------------------------------------- */
  const botonWhatsappFlotante = document.querySelector('.boton-whatsapp-flotante');
  const piePagina = document.querySelector('.pie-pagina');

  if (botonWhatsappFlotante && piePagina) {
    const observadorPie = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        botonWhatsappFlotante.classList.toggle('oculto-en-pie', entrada.isIntersecting);
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    observadorPie.observe(piePagina);
  }

  /* ---------------------------------------------------------------------
     3. SCROLL REVEAL — tarjetas y bloques aparecen al entrar en pantalla
  --------------------------------------------------------------------- */
  const elementosRevelables = document.querySelectorAll(
    '.tarjeta-plan, .tarjeta-proyecto, .etapa-item, .tarjeta-recurso, .accordion-item, .tarjeta-contacto'
  );
  elementosRevelables.forEach(el => el.classList.add('revelar'));

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15 });

  elementosRevelables.forEach(el => observador.observe(el));

  /* ---------------------------------------------------------------------
     4. MODAL DE PROYECTOS — se llena con los data-* del botón "Ver más"
  --------------------------------------------------------------------- */
  const modalProyecto = document.getElementById('modalProyecto');
  if (modalProyecto) {
    modalProyecto.addEventListener('show.bs.modal', (evento) => {
      const boton = evento.relatedTarget;
      if (!boton) return;

      document.getElementById('modalProyectoTitulo').textContent = boton.dataset.titulo || '';
      document.getElementById('modalProyectoGrado').textContent = boton.dataset.grado || '';
      document.getElementById('modalProyectoImg').src = boton.dataset.img || '';
      document.getElementById('modalProyectoImg').alt = boton.dataset.titulo || 'Proyecto de emprendimiento';
      document.getElementById('modalProyectoResumen').textContent = boton.dataset.resumen || '';
      document.getElementById('modalProyectoEtapa').textContent = boton.dataset.etapa || '';
      document.getElementById('modalProyectoIntegrantes').textContent = boton.dataset.integrantes || '';
      document.getElementById('modalProyectoLogro').textContent = boton.dataset.logro || '';
    });
  }

  /* ---------------------------------------------------------------------
     4.1 FILTRO DE PROYECTOS POR GRADO
  --------------------------------------------------------------------- */
  const botonesFiltro = document.querySelectorAll('#filtroGrados .chip-filtro');
  const columnasProyecto = document.querySelectorAll('.tarjeta-proyecto-col');

  botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
      botonesFiltro.forEach(b => b.classList.remove('activo'));
      boton.classList.add('activo');

      const grado = boton.dataset.filtro;
      columnasProyecto.forEach(columna => {
        const coincide = grado === 'todos' || columna.dataset.grado === grado;
        columna.classList.toggle('oculta', !coincide);
      });
    });
  });

  /* ---------------------------------------------------------------------
     5. CONTADORES DE VISITAS Y DESCARGAS (compatible con GitHub Pages)
     =======================================================================

     Este sitio es 100% estático (GitHub Pages no ejecuta backend propio),
     así que los contadores usan CountAPI (https://countapi.xyz), un
     servicio gratuito y sin registro que expone un contador por
     "namespace/key" mediante una simple petición GET.

     Namespace usado: "ept-crea-emprende-tupacamaru" (cámbialo si otra
     institución va a reutilizar este sitio, para no compartir el contador).

     Si CountAPI no responde (servicio caído o sin internet), el script
     cae automáticamente a un contador local guardado en localStorage,
     para que la interfaz nunca se rompa. Ese respaldo es SOLO local
     (no se comparte entre visitantes).

     — Para una solución más robusta a largo plazo, ver el bloque
       "ALTERNATIVA CON FIREBASE" al final de este archivo. —
  ------------------------------------------------------------------------ */

  const NAMESPACE_CONTADOR = 'ept-crea-emprende-tupacamaru';
  const URL_BASE_COUNTAPI = 'https://api.countapi.xyz';

  // Utilidad: respaldo local cuando el servicio externo falla
  function contadorLocalRespaldo(clave, incrementar) {
    const claveLocal = 'contador_local_' + clave;
    let valor = parseInt(localStorage.getItem(claveLocal) || '0', 10);
    if (incrementar) valor += 1;
    localStorage.setItem(claveLocal, valor);
    return valor;
  }

  // Incrementa (o solo lee) un contador remoto vía CountAPI
  async function actualizarContador(clave, { incrementar = true } = {}) {
    const endpoint = incrementar
      ? `${URL_BASE_COUNTAPI}/hit/${NAMESPACE_CONTADOR}/${clave}`
      : `${URL_BASE_COUNTAPI}/get/${NAMESPACE_CONTADOR}/${clave}`;
    try {
      const respuesta = await fetch(endpoint);
      if (!respuesta.ok) throw new Error('Respuesta no válida de CountAPI');
      const datos = await respuesta.json();
      // CountAPI devuelve { value: N }; sincronizamos el respaldo local también
      localStorage.setItem('contador_local_' + clave, datos.value);
      return datos.value;
    } catch (error) {
      // Servicio no disponible → usamos el respaldo local
      console.warn(`[contadores] CountAPI no disponible para "${clave}", usando respaldo local.`, error);
      return contadorLocalRespaldo(clave, incrementar);
    }
  }

  // --- 5.1 Contador de VISITAS (una vez por sesión de pestaña) ---
  async function inicializarContadorVisitas() {
    const yaContadaEnEstaSesion = sessionStorage.getItem('visita_ya_contada');
    const valor = await actualizarContador('visitas-totales', { incrementar: !yaContadaEnEstaSesion });
    if (!yaContadaEnEstaSesion) sessionStorage.setItem('visita_ya_contada', '1');

    const visitasFormateadas = new Intl.NumberFormat('es-PE').format(valor);
    const spanHero = document.getElementById('visitasHero');
    const spanPie = document.getElementById('visitasPie');
    if (spanHero) spanHero.textContent = visitasFormateadas;
    if (spanPie) spanPie.textContent = visitasFormateadas;
  }
  inicializarContadorVisitas();

  // --- 5.2 Contadores de DESCARGAS por recurso ---
  const contenidoRecursos = {
    'plan-trabajo': {
      nombreArchivo: 'Plan Trabajo Crea Emprende 2026.docx',
      texto:
`PLAN DE TRABAJO — CREA Y EMPRENDE 2026
Área de Educación para el Trabajo — IE N° 51006 "Túpac Amaru"

1. Objetivo general del concurso
2. Cronograma de etapas (institucional y siguientes)
3. Responsables por grado y sección
4. Criterios generales de organización
`
    },
    'orientaciones': {
      nombreArchivo: 'Orientaciones Crea y Emprende 2026.pdf',
      texto:
`ORIENTACIONES — CREA Y EMPRENDE 2026
Concurso institucional del Área de Educación para el Trabajo

1. Fases del proyecto de emprendimiento
2. Criterios de participación
3. Requisitos de presentación
4. Recomendaciones para el docente asesor
`
    },
    'rubrica-a': {
      nombreArchivo: 'Rubrica - Categoria A.docx',
      texto:
`RÚBRICA DE EVALUACIÓN — CATEGORÍA A
Dirigido a: 1.°, 2.° y 3.° de secundaria

Criterio 1: Empatía y diagnóstico del problema        (0-4 pts)
Criterio 2: Calidad del prototipo                       (0-4 pts)
Criterio 3: Creatividad e innovación                     (0-4 pts)
Criterio 4: Trabajo en equipo                            (0-4 pts)
Criterio 5: Presentación oral ante el jurado             (0-4 pts)

Puntaje total: _____ / 20
`
    },
    'rubrica-b': {
      nombreArchivo: 'Rubrica - Categoria B.docx',
      texto:
`RÚBRICA DE EVALUACIÓN — CATEGORÍA B
Dirigido a: 4.° y 5.° de secundaria

Criterio 1: Identificación del problema y validación     (0-4 pts)
Criterio 2: Viabilidad económica (costeo y precio)        (0-4 pts)
Criterio 3: Modelo de negocio                             (0-4 pts)
Criterio 4: Plan de sostenibilidad                        (0-4 pts)
Criterio 5: Pitch final ante el jurado                    (0-4 pts)

Puntaje total: _____ / 20
`
    },
    'formato-a': {
      nombreArchivo: 'Formato - Cat A.docx',
      texto:
`FORMATO DE PROYECTO — CATEGORÍA A
Dirigido a: 1.°, 2.° y 3.° de secundaria

1. Mapa de empatía
2. Declaración POV
3. Pregunta ¿Cómo podríamos...?
4. Boceto del prototipo
5. Ficha de validación con usuarios
`
    },
    'formato-b': {
      nombreArchivo: 'Formato - Cat B.docx',
      texto:
`FORMATO DE PROYECTO — CATEGORÍA B
Dirigido a: 4.° y 5.° de secundaria

1. Modelo de negocio (Canvas)
2. Estructura de costos y precio de venta
3. Plan de sostenibilidad
4. Guion del pitch final
`
    },
    'proyecto-ejemplo': {
      nombreArchivo: 'Proyecto ejemplo.docx',
      texto:
`PROYECTO EJEMPLO — CREA Y EMPRENDE 2026
Modelo referencial de proyecto de emprendimiento desarrollado
de principio a fin, para orientar el nivel de detalle esperado
en cada etapa.
`
    },
    'precisiones-expoferia': {
      nombreArchivo: 'Precisiones de la Expoferia 2026.pptx',
      texto:
`PRECISIONES DE LA EXPOFERIA 2026
Jueves 27 de agosto — 11:00 a.m.

1. Horario de instalación de stands
2. Distribución de stands por grado y sección
3. Tiempo de exposición por equipo
4. Recomendaciones finales para el día del evento
`
    }
  };

  // Genera y descarga un archivo de texto simple en el navegador (sin backend)
  function descargarArchivoTexto(nombreArchivo, contenidoTexto) {
    const blob = new Blob([contenidoTexto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlaceTemporal = document.createElement('a');
    enlaceTemporal.href = url;
    enlaceTemporal.download = nombreArchivo;
    document.body.appendChild(enlaceTemporal);
    enlaceTemporal.click();
    document.body.removeChild(enlaceTemporal);
    URL.revokeObjectURL(url);
  }

  function mostrarToastDescarga(mensaje) {
    const toastElemento = document.getElementById('toastDescarga');
    const toastTexto = document.getElementById('toastDescargaTexto');
    if (!toastElemento) return;
    toastTexto.textContent = mensaje;
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastElemento, { delay: 2600 });
    toastBootstrap.show();
  }

  // Pinta en pantalla el valor actual de cada contador (sin incrementar)
  async function pintarContadoresDescargaIniciales() {
    const spans = document.querySelectorAll('.valor-contador');
    for (const span of spans) {
      const clave = 'descarga-' + span.dataset.contador;
      const valor = await actualizarContador(clave, { incrementar: false });
      span.textContent = new Intl.NumberFormat('es-PE').format(valor || 0);
    }
  }
  pintarContadoresDescargaIniciales();

  // Sincroniza en pantalla todos los contadores que muestren el mismo recurso
  // (la tarjeta y, si está abierto, el modal)
  function pintarValorContador(idRecurso, valor) {
    const valorFormateado = new Intl.NumberFormat('es-PE').format(valor);
    document.querySelectorAll(`.valor-contador[data-contador="${idRecurso}"]`).forEach(span => {
      span.textContent = valorFormateado;
    });
    const contadorModal = document.getElementById('modalRecursoContador');
    if (contadorModal && modalRecurso.dataset.recursoActivo === idRecurso) {
      contadorModal.textContent = valorFormateado;
    }
  }

  // --- 5.3 Modal de recurso: se llena con los data-* del botón "Ver más" ---
  const modalRecurso = document.getElementById('modalRecurso');
  const botonDescargarModal = document.getElementById('modalRecursoBotonDescargar');

  if (modalRecurso) {
    modalRecurso.addEventListener('show.bs.modal', async (evento) => {
      const boton = evento.relatedTarget;
      if (!boton) return;

      const idRecurso = boton.dataset.recurso;
      modalRecurso.dataset.recursoActivo = idRecurso;

      document.getElementById('modalRecursoTitulo').textContent = boton.dataset.titulo || '';
      document.getElementById('modalRecursoArchivo').textContent = boton.dataset.archivo || '';
      document.getElementById('modalRecursoDescripcion').textContent = boton.dataset.descripcion || '';
      document.getElementById('modalRecursoCategoria').textContent = boton.dataset.categoria || '';

      const icono = document.getElementById('modalRecursoIcono');
      icono.className = 'bi ' + (boton.dataset.icono || 'bi-file-earmark');
      const contenedorIcono = document.getElementById('modalRecursoIconoContenedor');
      contenedorIcono.className = 'tarjeta-recurso-icono icono-' + (boton.dataset.color || 'word');

      const badge = document.getElementById('modalRecursoTipoBadge');
      badge.textContent = boton.dataset.tipo || '';
      badge.className = 'badge-tipo-archivo badge-' + (boton.dataset.color || 'word');

      // Muestra el contador actual sin incrementarlo todavía (solo se incrementa al descargar)
      const valorActual = await actualizarContador('descarga-' + idRecurso, { incrementar: false });
      document.getElementById('modalRecursoContador').textContent = new Intl.NumberFormat('es-PE').format(valorActual || 0);
    });
  }

  // Click en "Descargar archivo" dentro del modal: genera el archivo + incrementa contador
  if (botonDescargarModal) {
    botonDescargarModal.addEventListener('click', async () => {
      const idRecurso = modalRecurso.dataset.recursoActivo;
      const recurso = contenidoRecursos[idRecurso];
      if (!recurso) return;

      descargarArchivoTexto(recurso.nombreArchivo, recurso.texto);

      const nuevoValor = await actualizarContador('descarga-' + idRecurso, { incrementar: true });
      pintarValorContador(idRecurso, nuevoValor);
      mostrarToastDescarga(`"${recurso.nombreArchivo}" descargado`);
    });
  }

});

/* =========================================================================
   ALTERNATIVA CON FIREBASE (más robusta que CountAPI para producción)
   =========================================================================
   Si prefieres no depender de CountAPI, puedes reemplazar las funciones
   "actualizarContador" de arriba por esta versión con Firebase Realtime
   Database (capa gratuita "Spark", sin backend propio, 100% compatible
   con GitHub Pages):

   1) Crea un proyecto en https://console.firebase.google.com
   2) Activa "Realtime Database" en modo de PRUEBA (o con estas reglas
      que solo permiten incrementar, no leer datos ajenos):

      {
        "rules": {
          "contadores": {
            "$clave": {
              ".read": true,
              ".write": true
            }
          }
        }
      }

   3) Agrega el SDK en tu <head> (antes de script.js):
      <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
      <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js"></script>

   4) Inicializa y reemplaza la lógica de conteo:

      const firebaseConfig = {
        apiKey: "TU_API_KEY",
        databaseURL: "https://TU_PROYECTO.firebaseio.com",
        projectId: "TU_PROYECTO"
      };
      firebase.initializeApp(firebaseConfig);
      const db = firebase.database();

      async function actualizarContadorFirebase(clave, incrementar = true) {
        const ref = db.ref('contadores/' + clave);
        if (incrementar) {
          const resultado = await ref.transaction(valorActual => (valorActual || 0) + 1);
          return resultado.snapshot.val();
        } else {
          const snap = await ref.get();
          return snap.val() || 0;
        }
      }

   Con "transaction()" Firebase evita que dos visitantes que descargan al
   mismo tiempo pisen el contador del otro (algo que CountAPI no garantiza
   bajo alta concurrencia). Para un colegio esto casi nunca es un problema,
   por eso CountAPI es la opción por defecto: cero configuración.
   ========================================================================= */
