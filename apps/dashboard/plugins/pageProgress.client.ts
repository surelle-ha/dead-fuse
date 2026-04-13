// plugins/pageProgress.client.ts
// Thin top-of-page progress bar that fires on every route change.
// No external deps — pure CSS + JS animation.

export default defineNuxtPlugin((nuxtApp) => {
  let bar: HTMLDivElement | null = null;
  let shimmer: HTMLDivElement | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let rafId: number | null = null;
  let currentWidth = 0;
  let targetWidth = 0;

  function getBar(): HTMLDivElement {
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'df-progress-bar';
      bar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 2px;
        width: 0%;
        z-index: 99999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s ease;
        background: linear-gradient(90deg, #ff3333 0%, #ff6666 50%, #ff3333 100%);
        background-size: 200% 100%;
        box-shadow: 0 0 8px rgba(255, 51, 51, 0.6), 0 0 20px rgba(255, 51, 51, 0.3);
        border-radius: 0 2px 2px 0;
        will-change: width, opacity;
      `;

      shimmer = document.createElement('div');
      shimmer.style.cssText = `
        position: absolute;
        right: 0;
        top: 0;
        width: 80px;
        height: 100%;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
        animation: df-shimmer 1.2s ease-in-out infinite;
        border-radius: 0 2px 2px 0;
      `;

      if (!document.getElementById('df-progress-style')) {
        const style = document.createElement('style');
        style.id = 'df-progress-style';
        style.textContent = `
          @keyframes df-shimmer {
            0% { opacity: 0; transform: translateX(-80px); }
            40% { opacity: 1; }
            100% { opacity: 0; transform: translateX(0px); }
          }
          @keyframes df-bar-bg {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          #df-progress-bar {
            animation: df-bar-bg 2s linear infinite;
          }
        `;
        document.head.appendChild(style);
      }

      bar.appendChild(shimmer);
      document.body.appendChild(bar);
    }
    return bar;
  }

  function easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateTo(target: number) {
    targetWidth = target;

    if (rafId) cancelAnimationFrame(rafId);

    const start = currentWidth;
    const startTime = performance.now();
    const duration = 300;

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      currentWidth = start + (targetWidth - start) * easeOut(progress);

      const b = getBar();
      b.style.width = currentWidth + '%';

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        rafId = null;
      }
    }

    rafId = requestAnimationFrame(step);
  }

  function start() {
    if (timer) clearTimeout(timer);
    currentWidth = 0;
    targetWidth = 0;
    const b = getBar();
    b.style.width = '0%';
    b.style.opacity = '1';
    b.style.transition = 'opacity 0.15s ease';

    // Quickly jump to 15%, then slowly creep to 85%
    animateTo(15);
    timer = setTimeout(() => animateTo(40), 200);
    timer = setTimeout(() => animateTo(65), 600);
    timer = setTimeout(() => animateTo(80), 1400);
  }

  function finish() {
    if (timer) clearTimeout(timer);
    animateTo(100);

    setTimeout(() => {
      const b = getBar();
      b.style.transition = 'opacity 0.3s ease 0.1s';
      b.style.opacity = '0';
      setTimeout(() => {
        if (b) {
          b.style.width = '0%';
          currentWidth = 0;
        }
      }, 450);
    }, 150);
  }

  nuxtApp.hook('page:start', start);
  nuxtApp.hook('page:finish', finish);
  nuxtApp.hook('page:loading:end', finish);
});