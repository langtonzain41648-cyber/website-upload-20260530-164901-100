(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function setupMobileNav() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(next, 5200);
    }

    var prevButton = root.querySelector(".hero-arrow.prev");
    var nextButton = root.querySelector(".hero-arrow.next");
    if (prevButton) {
      prevButton.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }
    if (nextButton) {
      nextButton.addEventListener("click", function () {
        next();
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.slide || 0));
        restart();
      });
    });
    restart();
  }

  function setupCatalog() {
    var toolbar = document.querySelector(".catalog-toolbar");
    var list = document.querySelector(".movie-list");
    if (!toolbar || !list) {
      return;
    }
    var input = toolbar.querySelector(".catalog-search");
    var buttons = Array.prototype.slice.call(toolbar.querySelectorAll("[data-sort]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type
        ].join(" "));
        card.classList.toggle("is-hidden", keyword && haystack.indexOf(keyword) === -1);
      });
    }

    function sortCards(mode) {
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "title") {
          return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
        }
        if (mode === "score") {
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        }
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      });
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        sortCards(button.dataset.sort || "year");
        applyFilter();
      });
    });
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHTML(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + escapeHTML(movie.file) + "\" aria-label=\"" + escapeHTML(movie.title) + "\">",
      "<span class=\"poster-frame\"><img src=\"" + escapeHTML(movie.cover) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\"><span class=\"play-badge\">▶</span><span class=\"year-badge\">" + escapeHTML(movie.year) + "</span></span>",
      "</a>",
      "<div class=\"card-body\"><h3><a href=\"" + escapeHTML(movie.file) + "\">" + escapeHTML(movie.title) + "</a></h3>",
      "<p>" + escapeHTML(movie.one_line) + "</p>",
      "<div class=\"meta-row\"><span>" + escapeHTML(movie.region) + "</span><span>" + escapeHTML(movie.type) + "</span></div>",
      "<div class=\"tag-row\">" + tags + "</div></div>",
      "</article>"
    ].join("");
  }

  function setupSearchPage() {
    var results = document.getElementById("search-results");
    var title = document.getElementById("search-title");
    var sort = document.getElementById("search-sort");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = String(params.get("q") || "").trim();
    var formInput = document.querySelector(".search-page-form input[name='q']");
    if (formInput) {
      formInput.value = keyword;
    }

    function matches(movie) {
      if (!keyword) {
        return true;
      }
      var lower = keyword.toLowerCase();
      return [movie.title, movie.one_line, movie.region, movie.type, movie.year, (movie.tags || []).join(" ")]
        .join(" ")
        .toLowerCase()
        .indexOf(lower) > -1;
    }

    function render() {
      var mode = sort ? sort.value : "score";
      var list = window.SEARCH_MOVIES.filter(matches).sort(function (a, b) {
        if (mode === "title") {
          return String(a.title || "").localeCompare(String(b.title || ""), "zh-Hans-CN");
        }
        if (mode === "year") {
          return Number(b.year || 0) - Number(a.year || 0);
        }
        return Number(b.score || 0) - Number(a.score || 0);
      }).slice(0, 120);
      if (title) {
        title.textContent = keyword ? "搜索结果：" + keyword : "热门影片";
      }
      if (!list.length) {
        results.innerHTML = "<div class=\"detail-panel\"><h2>未找到相关内容</h2><p>可以更换关键词，或从分类入口继续浏览。</p></div>";
        return;
      }
      results.innerHTML = list.map(createCard).join("");
    }

    if (sort) {
      sort.addEventListener("change", render);
    }
    render();
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupCatalog();
    setupSearchPage();
  });
}());
