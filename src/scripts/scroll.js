/**
 * Motor de scroll + tema (dark mode) — CPD
 *
 * Responsabilidades:
 *  1. Reveal on scroll con IntersectionObserver (una sola vez por elemento).
 *  2. Parallax suave con requestAnimationFrame + scroll pasivo.
 *  3. Contadores animados que respetan el formato del dato original.
 *  4. Barra de progreso de lectura.
 *  5. Tema claro/oscuro persistido, con detección del sistema.
 *
 * Reglas de oro:
 *  - El contenido es visible POR DEFECTO y la animación es una mejora.
 *  - prefers-reduced-motion manda: si está activo, no se anima nada.
 *  - Resiliente: si IntersectionObserver no existe, se muestra todo de golpe.
 */

// --- Tema (se resuelve ANTES de pintar para evitar el destello blanco) ------
// Este bloque va primero a propósito: el script se carga en el <head> como
// módulo (diferido), pero el orden dentro del archivo garantiza que el tema se
// aplique lo antes posible dentro de esa ejecución.
(function () {
  var CLAVE = 'cpd-tema';

  function temaGuardado() {
    try {
      return localStorage.getItem(CLAVE);
    } catch (e) {
      // Modo privado / cookies bloqueadas: se ignora, no se rompe nada.
      return null;
    }
  }

  function temaDelSistema() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  }

  var guardado = temaGuardado();
  var tema = guardado === 'claro' || guardado === 'oscuro' ? guardado : temaDelSistema();

  if (tema === 'oscuro') {
    document.documentElement.setAttribute('data-tema', 'oscuro');
  } else {
    document.documentElement.removeAttribute('data-tema');
  }

  // API mínima para que los botones (que pueden pintarse después) la usen.
  window.cpdTema = {
    actual: function () {
      return document.documentElement.getAttribute('data-tema') === 'oscuro' ? 'oscuro' : 'claro';
    },
    fijar: function (valor) {
      if (valor === 'oscuro') {
        document.documentElement.setAttribute('data-tema', 'oscuro');
      } else {
        document.documentElement.removeAttribute('data-tema');
      }
      try {
        localStorage.setItem(CLAVE, valor);
      } catch (e) {
        /* sin persistencia: el tema vale solo para esta sesión */
      }
      document.documentElement.dispatchEvent(
        new CustomEvent('cpd:tema', { detail: { tema: valor } })
      );
    },
    alternar: function () {
      this.fijar(this.actual() === 'oscuro' ? 'claro' : 'oscuro');
    },
  };
})();

(function () {
  var root = document.documentElement;

  // --- Botones de tema -----------------------------------------------------
  // El toggle vive en el Header, que se pinta en el HTML; se enlaza por
  // delegación para que funcione aunque el botón se inserte después.
  //
  // OJO (bug real detectado con navegador, no con el build): el click puede
  // caer en un <svg> o <path> hijo del botón. `evento.target.closest()` SÍ sube
  // por los padres, pero si el target es un nodo SVG en algunos motores el
  // closest no coincide con el botón, y el listener se quedaba sin disparar:
  // el icono cambiaba (lo hace el CSS) pero aria-pressed y aria-label no, y el
  // lector de pantalla anunciaba el estado contrario al visible.
  //
  // Por eso el estado NO se lee del evento ni de un valor capturado antes del
  // cambio: se lee del DOM en el momento de pintar. Así, aunque el handler se
  // ejecute dos veces o desde un nodo hijo, el resultado siempre converge.
  function sincronizarBotones() {
    var oscuro = window.cpdTema.actual() === 'oscuro';
    document.querySelectorAll('[data-tema-toggle]').forEach(function (boton) {
      boton.setAttribute('aria-pressed', oscuro ? 'true' : 'false');
      boton.setAttribute(
        'aria-label',
        oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
      );
    });
  }

  document.addEventListener('click', function (evento) {
    var nodo = evento.target;
    // Sube manualmente por el árbol: robusto con nodos SVG.
    while (nodo && nodo !== document) {
      if (nodo.hasAttribute && nodo.hasAttribute('data-tema-toggle')) {
        window.cpdTema.alternar();
        // Se sincroniza aquí mismo, sin esperar al evento: garantiza que el
        // estado accesible quede correcto aunque el listener del evento falle.
        sincronizarBotones();
        return;
      }
      nodo = nodo.parentNode;
    }
  });

  document.addEventListener('cpd:tema', sincronizarBotones);
  sincronizarBotones();

  // --- Motor de animación --------------------------------------------------
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Marca que el JS está activo: sólo entonces los reveals arrancan ocultos.
  root.classList.add('js-reveal');
  if (reduceMotion) {
    root.classList.remove('js-reveal');
  }

  // Sin IntersectionObserver o con reduced-motion: no hay nada que animar.
  if (reduceMotion || !('IntersectionObserver' in window)) {
    return;
  }

  // --- Contadores ----------------------------------------------------------
  // Respeta el formato del dato original: si venía "+10" o "1.200" se conserva
  // el prefijo, el sufijo y el separador de miles.
  function animarContador(el) {
    if (el.dataset.contadorListo === '1') return;
    el.dataset.contadorListo = '1';

    var original = el.getAttribute('data-contador') || el.textContent || '';
    var match = original.match(/-?\d[\d.,]*/);
    if (!match) return;

    var numeroTexto = match[0];
    var prefijo = original.slice(0, match.index);
    var sufijo = original.slice(match.index + numeroTexto.length);
    var milesConPunto = /\.\d{3}(\D|$)/.test(numeroTexto);
    var milesConComa = /,\d{3}(\D|$)/.test(numeroTexto);
    var destino = parseInt(numeroTexto.replace(/[.,]/g, ''), 10);

    if (isNaN(destino) || destino <= 0) return;

    var DURACION = 1400;

    function formatear(valor) {
      var texto = String(valor);
      if (milesConPunto) texto = texto.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      else if (milesConComa) texto = texto.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return prefijo + texto + sufijo;
    }

    var inicio = null;

    function paso(tiempo) {
      if (inicio === null) inicio = tiempo;
      var progreso = Math.min((tiempo - inicio) / DURACION, 1);
      // Suavizado exponencial: arranca rápido y frena al final.
      var suave = progreso === 1 ? 1 : 1 - Math.pow(2, -10 * progreso);
      el.textContent = formatear(Math.round(destino * suave));
      if (progreso < 1) window.requestAnimationFrame(paso);
      else el.textContent = formatear(destino);
    }

    el.textContent = formatear(0);
    window.requestAnimationFrame(paso);
  }

  // --- 2. Reveal on scroll -------------------------------------------------
  var revealObserver = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;

        entrada.target.classList.add('is-visible');

        entrada.target.querySelectorAll('.line-inner').forEach(function (linea) {
          linea.classList.add('is-visible');
        });

        entrada.target.querySelectorAll('[data-contador]').forEach(animarContador);

        revealObserver.unobserve(entrada.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
  );

  // OJO: además de .reveal hay que observar las máscaras de línea. Los
  // titulares no llevan .reveal propio (van en .line-mask > .line-inner), así
  // que si no se observan nunca reciben is-visible y el texto QUEDA TAPADO
  // (bug real detectado con verificación visual, no con el build).
  document.querySelectorAll('.reveal, [data-reveal-group], .line-mask').forEach(function (el) {
    revealObserver.observe(el);
  });

  // Red de seguridad: si el observer falla o el elemento ya está en pantalla,
  // se revela igual. Esconder contenido sólo es aceptable si hay certeza de
  // revelarlo.
  //
  // OJO (bug real, reproducido): un IntersectionObserver NO dispara si el
  // salto de scroll es mayor que el viewport — el elemento nunca llega a
  // intersectar dentro de un frame observado. Con un scroll rápido (o al
  // saltar al final con un ancla) secciones enteras QUEDABAN INVISIBLES:
  // con scroll rápido se medían 22 elementos ocultos y con scroll lento 4
  // (los 4 del carrete, que es el comportamiento buscado).
  //
  // Por eso la red de seguridad NO puede correr sólo en `load`: tiene que
  // repetirse después del scroll. Aquí se engancha al mismo ciclo de scroll
  // pasivo que el parallax y la barra de progreso.
  function revelarLoVisible() {
    var alto = window.innerHeight;
    document.querySelectorAll('.reveal, .line-mask').forEach(function (el) {
      if (el.classList.contains('is-visible')) return;
      var caja = el.getBoundingClientRect();

      // Dos casos, y el segundo es el que faltaba:
      //  a) el elemento está dentro de la ventana → se revela;
      //  b) el elemento quedó POR ENCIMA de la ventana (el usuario ya pasó de
      //     largo con un scroll rápido) → también se revela. Si no, nunca
      //     cumpliría `bottom > 0` y quedaría invisible para siempre.
      var dentro = caja.top < alto && caja.bottom > 0;
      var pasoDeLargo = caja.bottom <= 0;

      if (dentro || pasoDeLargo) {
        el.classList.add('is-visible');
        el.querySelectorAll('.line-inner').forEach(function (linea) {
          linea.classList.add('is-visible');
        });
        el.querySelectorAll('[data-contador]').forEach(animarContador);
      }
    });
  }

  // Rescate diferido: si el usuario aterriza a mitad de página (ancla, recarga
  // conservando el scroll, gesto de "ir arriba"), hay que resolver el estado
  // inicial una vez que el layout está asentado.
  window.addEventListener('load', function () {
    requestAnimationFrame(revelarLoVisible);
    setTimeout(revelarLoVisible, 1200);
  });

  // Y de forma continua: cada scroll (ya pasivo y agrupado por rAF) se rescata
  // lo que el observer no haya alcanzado. Sin esto, un scroll rápido deja
  // contenido invisible de forma permanente.
  var rescatePendiente = false;
  function pedirRescate() {
    if (rescatePendiente) return;
    rescatePendiente = true;
    window.requestAnimationFrame(function () {
      revelarLoVisible();
      rescatePendiente = false;
    });
  }

  window.addEventListener('scroll', pedirRescate, { passive: true });
  window.addEventListener('resize', pedirRescate, { passive: true });

  // --- 3. Parallax ---------------------------------------------------------
  var capas = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));

  if (capas.length > 0 && window.matchMedia('(pointer: fine)').matches) {
    var pendiente = false;

    function pintarParallax() {
      var alto = window.innerHeight;
      capas.forEach(function (capa) {
        var caja = capa.getBoundingClientRect();
        if (caja.bottom < -200 || caja.top > alto + 200) return;
        var fuerza = parseFloat(capa.getAttribute('data-parallax')) || 0.12;
        // -1 (abajo) a 1 (arriba) respecto al centro del viewport.
        var relativo = (caja.top + caja.height / 2 - alto / 2) / (alto / 2 + caja.height / 2);
        capa.style.setProperty('--parallax', (relativo * fuerza * 100).toFixed(2) + 'px');
      });
      pendiente = false;
    }

    function pedirParallax() {
      if (pendiente) return;
      pendiente = true;
      window.requestAnimationFrame(pintarParallax);
    }

    window.addEventListener('scroll', pedirParallax, { passive: true });
    window.addEventListener('resize', pedirParallax, { passive: true });
    pintarParallax();
  }

  // --- Barra de progreso de lectura ---------------------------------------
  var barra = document.querySelector('[data-scroll-progress]');
  if (barra) {
    var barraPendiente = false;

    function pintarBarra() {
      var total = document.documentElement.scrollHeight - window.innerHeight;
      var progreso = total > 0 ? window.scrollY / total : 0;
      barra.style.setProperty('--scroll-progress', Math.min(progreso, 1).toFixed(4));
      barraPendiente = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (barraPendiente) return;
        barraPendiente = true;
        window.requestAnimationFrame(pintarBarra);
      },
      { passive: true }
    );
    pintarBarra();
  }
})();
