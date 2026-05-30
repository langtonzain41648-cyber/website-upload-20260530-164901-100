(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var opened = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!opened));
      mobilePanel.hidden = opened;
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    };

    var move = function (step) {
      showSlide(active + step);
    };

    var start = function () {
      timer = window.setInterval(function () {
        move(1);
      }, 5000);
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    start();
  }

  var normalize = function (value) {
    return (value || '').toString().trim().toLowerCase();
  };

  var applyFilter = function (keyword, category) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-grid] [data-search]'));
    var empty = document.querySelector('.empty-result');
    var q = normalize(keyword);
    var cat = normalize(category);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var matchedText = !q || text.indexOf(q) !== -1;
      var matchedCategory = !cat || cardCategory === cat;
      var matched = matchedText && matchedCategory;

      card.classList.toggle('is-filtered-out', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  };

  var localForm = document.querySelector('[data-local-search]');

  if (localForm) {
    var localInput = localForm.querySelector('input[type="search"]');

    localForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter(localInput ? localInput.value : '', '');
    });

    if (localInput) {
      localInput.addEventListener('input', function () {
        applyFilter(localInput.value, '');
      });
    }
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    var params = new URLSearchParams(window.location.search);
    var searchInput = searchPage.querySelector('input[name="q"]');
    var categorySelect = searchPage.querySelector('select[name="category"]');

    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }

    if (categorySelect && params.get('category')) {
      categorySelect.value = params.get('category');
    }

    var runSearch = function () {
      applyFilter(searchInput ? searchInput.value : '', categorySelect ? categorySelect.value : '');
    };

    searchPage.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch();
    });

    if (searchInput) {
      searchInput.addEventListener('input', runSearch);
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', runSearch);
    }

    runSearch();
  }
})();
