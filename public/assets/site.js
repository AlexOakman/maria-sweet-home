function setupMotion(panel) {
  const video = panel.querySelector('video');
  const button = panel.querySelector('button');
  const icon = button.querySelector('span');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

  function updateButton() {
    button.setAttribute('aria-label', video.paused ? 'Воспроизвести фоновое видео' : 'Остановить фоновое видео');
    icon.textContent = video.paused ? '▶' : 'Ⅱ';
  }

  async function play() {
    if (!video.src) video.src = video.dataset.source;
    try {
      await video.play();
    } catch {
      updateButton();
    }
  }

  video.addEventListener('playing', () => {
    panel.setAttribute('data-frame', '');
    updateButton();
  });
  video.addEventListener('pause', updateButton);
  video.addEventListener('error', () => {
    panel.removeAttribute('data-frame');
    button.hidden = true;
  });
  button.addEventListener('click', () => {
    if (video.paused) void play();
    else video.pause();
  });
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) {
      video.pause();
      panel.removeAttribute('data-frame');
    }
  });

  button.hidden = false;
  if (!motionPreference.matches && !navigator.connection?.saveData) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (!motionPreference.matches && !video.src) void play();
    });
    observer.observe(panel);
  }
}

function setupReviews(dialog) {
  if (typeof dialog.showModal !== 'function') return;
  const imageArea = dialog.querySelector('.review-enlargement');
  const cards = dialog.previousElementSibling.querySelectorAll('[data-review]');

  for (const card of cards) {
    card.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const image = new Image();
      image.src = card.href;
      image.alt = card.querySelector('img').alt;
      imageArea.replaceChildren(image);
      imageArea.scrollLeft = 0;
      dialog.showModal();
    });
  }
}

function setupMetrika(counterId) {
  window.ym = window.ym || function (...args) {
    (window.ym.a ||= []).push(args);
  };
  window.ym.l ||= Date.now();

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://mc.yandex.ru/metrika/tag.js?id=${counterId}`;
  document.head.append(script);
  window.ym(counterId, 'init', { accurateTrackBounce: true, webvisor: false });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-contact]');
    if (link) window.ym(counterId, 'reachGoal', `contact_${link.dataset.contact}`);
  });
}

const motion = document.querySelector('[data-motion]');
if (motion) setupMotion(motion);
document.querySelectorAll('.review-dialog').forEach(setupReviews);
if (document.body.dataset.metrika) setupMetrika(Number(document.body.dataset.metrika));
