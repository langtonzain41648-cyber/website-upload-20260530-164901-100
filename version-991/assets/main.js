const menuButton = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
  });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  let current = 0;
  let timer = null;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      slide.classList.toggle('is-active', position === current);
    });
    dots.forEach((dot, position) => {
      dot.classList.toggle('is-active', position === current);
    });
  };

  const start = () => {
    timer = window.setInterval(() => showSlide(current + 1), 5200);
  };

  const restart = () => {
    window.clearInterval(timer);
    start();
  };

  dots.forEach((dot, position) => {
    dot.addEventListener('click', () => {
      showSlide(position);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      showSlide(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      showSlide(current + 1);
      restart();
    });
  }

  showSlide(0);
  start();
}

const normalizeText = (value) => (value || '').toString().toLowerCase().trim();

const setupFilter = (scope) => {
  const input = scope.querySelector('[data-filter-input]');
  const typeSelect = scope.querySelector('[data-filter-type]');
  const cards = Array.from(document.querySelectorAll('[data-filter-card]'));
  const empty = document.querySelector('[data-empty-state]');

  const apply = () => {
    const query = normalizeText(input ? input.value : '');
    const typeValue = normalizeText(typeSelect ? typeSelect.value : '');
    let visible = 0;

    cards.forEach((card) => {
      const text = normalizeText([
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.genre
      ].join(' '));
      const type = normalizeText(card.dataset.type);
      const matchedQuery = !query || text.includes(query);
      const matchedType = !typeValue || type.includes(typeValue);
      const shouldShow = matchedQuery && matchedType;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  };

  if (input) {
    input.addEventListener('input', apply);
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', apply);
  }

  apply();
};

document.querySelectorAll('[data-filter-scope]').forEach(setupFilter);

const setupPlayers = () => {
  document.querySelectorAll('[data-player]').forEach((player) => {
    const video = player.querySelector('video');
    const overlay = player.querySelector('[data-play]');

    if (!video || !overlay) {
      return;
    }

    const load = () => {
      const src = video.getAttribute('data-hls');
      if (!src || video.dataset.ready === '1') {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }

      video.dataset.ready = '1';
    };

    const play = () => {
      load();
      overlay.classList.add('is-hidden');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          overlay.classList.remove('is-hidden');
        });
      }
    };

    overlay.addEventListener('click', play);
    video.addEventListener('play', () => overlay.classList.add('is-hidden'));
    video.addEventListener('pause', () => {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
  });
};

setupPlayers();
