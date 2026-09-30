/**
 * Motor de scroll de CPD — sin dependencias.
 *
 * Responsabilidades:
 *  1. Marcar <html class="js-reveal"> para activar los estados iniciales ocultos.
 *  2. Reveal on scroll con IntersectionObserver (una sola vez por elemento).
 *  3. Parallax suave con requestAnimationFrame + scroll pasivo.
 *  4. Contadores animados que respetan el formato del dato original.
 *  5. Barra de progreso de lectura.
 *
 * Principios:
 *  - Progressive enhancement: sin JS, el contenido se ve igual (nunca en blanco).
 *  - prefers-reduced-motion manda: si está activo, no se anima nada.
 *  - Resiliente: si IntersectionObserver no existe, se muestra todo de golpe.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- 1. Activar estados iniciales -----------------------------------------
  // Sólo ocultamos contenido si vamos a poder revelarlo.
  root.classList.add('js-reveal');

  function showAll() {
    root.classList.remove('js-reveal');
  }

  // Sin IntersectionObserver o con reduced-motion: no hay nada que animar.
  if (reduceMotion || !('IntersectionObserver' in window)) {
    showAll();
    return;
  }

  // --- 2. Reveal on scroll --------------------------------------------------
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');

        // Los hijos con .line-inner heredan el momento del padre.
        entry.target.querySelectorAll('.line-inner').forEach(function (line) {
          line.classList.add('is-visible');
        });

        // Si el elemento trae un contador, se dispara una sola vez.
        entry.target.querySelectorAll('[data-contador]').forEach(startCounter);

        revealObserver.unobserve(entry.target);
      });
    },
    {
      // Se revela un poco antes de entrar en pantalla para que el
      // movimiento sea perceptible y no un "salto" al llegar.
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.08,
    }
  );

  // OJO: además de .reveal hay que observar las máscaras de línea. Los
  // titulares no llevan .reveal propio (van en .line-mask > .line-inner), así
  // que si no se observan nunca reciben is-visible y el texto QUEDA TAPADO
  // para siempre. Eso no es "una animación que falta": es contenido invisible.
  document.querySelectorAll('.reveal, [data-reveal-group], .line-mask').forEach(function (el) {
    revealObserver.observe(el);
  });

  // --- 2b. Red de seguridad ------------------------------------------------
  // Regla: esconder contenido sólo es aceptable si hay certeza de revelarlo.
  // Si por cualquier motivo el observer no dispara (elemento recortado por un
  // contenedor, navegador raro, layout inesperado), el contenido quedaría
  // invisible PARA SIEMPRE. Esta pasada revela lo que ya debería verse.
  function rescatarVisibles() {
    var vh = window.innerHeight;
    document.querySelectorAll('.reveal, .line-mask').forEach(function (el) {
      if (el.classList.contains('is-visible')) return;
      var r = el.getBoundingClientRect();
      // Está dentro de la ventana (o ya se pasó de largo): debería verse.
      if (r.top < vh && r.bottom > 0) {
        el.classList.add('is-visible');
        el.querySelectorAll('.line-inner').forEach(function (l) {
          l.classList.add('is-visible');
        });
      }
    });
  }

  window.addEventListener('load', function () {
    requestAnimationFrame(rescatarVisibles);
    setTimeout(rescatarVisibles, 1200);
  });

  // --- 3. Parallax ----------------------------------------------------------
  // Sólo en punteros finos: en móvil el parallax por scroll suele dar tirones
  // (la barra de direcciones cambia la altura de la ventana).
  var parallaxItems = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var canParallax = parallaxItems.length > 0 && window.matchMedia('(pointer: fine)').matches;

  if (canParallax) {
    var ticking = false;

    function applyParallax() {
      var vh = window.innerHeight;
      parallaxItems.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        // Fuera de pantalla: no gastar trabajo
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
        // Progreso de -1 (bajo el pliegue) a 1 (arriba del viewport)
        var progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        el.style.setProperty('--parallax', (progress * speed * 100).toFixed(2) + 'px');
      });
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(applyParallax);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    applyParallax();
  }

  // --- 4. Contadores --------------------------------------------------------
  // Respeta el prefijo/sufijo y el separador de miles del dato original:
  // "+10" -> cuenta 0..10 y conserva el "+"; "200" -> conserva "200".
  function startCounter(el) {
    if (el.dataset.contadorListo === '1') return;
    el.dataset.contadorListo = '1';

    var raw = el.getAttribute('data-contador') || el.textContent || '';
    var match = raw.match(/-?\d[\d.,]*/);
    if (!match) return;

    var numeroTexto = match[0];
    var prefijo = raw.slice(0, match.index);
    var sufijo = raw.slice(match.index + numeroTexto.length);

    // Detectar formato: 1.750 (miles con punto) vs 1,750 vs 1750
    var usaMilesPunto = /\.\d{3}(\D|$)/.test(numeroTexto);
    var usaMilesComa = /,\d{3}(\D|$)/.test(numeroTexto);
    var destino = parseInt(numeroTexto.replace(/[.,]/g, ''), 10);
    if (isNaN(destino) || destino <= 0) return;

    var duracion = 1400;
    var inicio = null;

    function formatear(n) {
      var s = String(n);
      if (usaMilesPunto) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      else if (usaMilesComa) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return prefijo + s + sufijo;
    }

    function paso(timestamp) {
      if (inicio === null) inicio = timestamp;
      var avance = Math.min((timestamp - inicio) / duracion, 1);
      // easeOutExpo: arranca rápido y frena, se siente más "cinematográfico"
      var suavizado = avance === 1 ? 1 : 1 - Math.pow(2, -10 * avance);
      el.textContent = formatear(Math.round(destino * suavizado));
      if (avance < 1) window.requestAnimationFrame(paso);
      else el.textContent = formatear(destino);
    }

    // Arranca desde cero para que el conteo se vea
    el.textContent = formatear(0);
    window.requestAnimationFrame(paso);
  }

  // --- 5. Progreso de lectura ----------------------------------------------
  var progressBar = document.querySelector('[data-scroll-progress]');
  if (progressBar) {
    var pTicking = false;
    function updateProgress() {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      progressBar.style.setProperty('--scroll-progress', Math.min(ratio, 1).toFixed(4));
      pTicking = false;
    }
    window.addEventListener(
      'scroll',
      function () {
        if (pTicking) return;
        pTicking = true;
        window.requestAnimationFrame(updateProgress);
      },
      { passive: true }
    );
    updateProgress();
  }
})();
