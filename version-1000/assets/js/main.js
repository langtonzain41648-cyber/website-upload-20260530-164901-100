(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
      button.textContent = expanded ? "☰" : "×";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll(".hero-thumb"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("is-active", i === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-slide") || 0));
        schedule();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("mouseenter", function () {
        activate(Number(thumb.getAttribute("data-slide") || 0));
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        activate(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        activate(index + 1);
        schedule();
      });
    }

    activate(0);
    schedule();
  }

  function setupCategoryFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var grid = scope.parentElement.querySelector("[data-card-grid]");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-sort]"));
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      cards.forEach(function (card, order) {
        card.setAttribute("data-order", String(order));
      });

      function filterCards() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          card.classList.toggle("is-filter-hidden", keyword && haystack.indexOf(keyword) === -1);
        });
      }

      function sortCards(mode) {
        var sorted = cards.slice();
        if (mode === "year") {
          sorted.sort(function (a, b) {
            return (b.getAttribute("data-year") || "").localeCompare(a.getAttribute("data-year") || "", "zh-Hans-CN", { numeric: true });
          });
        } else if (mode === "title") {
          sorted.sort(function (a, b) {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
          });
        } else {
          sorted.sort(function (a, b) {
            return Number(a.getAttribute("data-order")) - Number(b.getAttribute("data-order"));
          });
        }
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (input) {
        input.addEventListener("input", filterCards);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          sortCards(button.getAttribute("data-sort") || "default");
          filterCards();
        });
      });
    });
  }

  function createSearchCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";

    var poster = document.createElement("a");
    poster.className = "card-poster";
    poster.href = movie.file;

    var img = document.createElement("img");
    img.src = movie.cover;
    img.alt = movie.title;
    img.loading = "lazy";
    poster.appendChild(img);

    var shade = document.createElement("span");
    shade.className = "poster-shade";
    poster.appendChild(shade);

    var play = document.createElement("span");
    play.className = "play-mark";
    play.textContent = "▶";
    poster.appendChild(play);

    var type = document.createElement("span");
    type.className = "type-badge";
    type.textContent = movie.type;
    poster.appendChild(type);

    var year = document.createElement("span");
    year.className = "year-badge";
    year.textContent = movie.year;
    poster.appendChild(year);

    var body = document.createElement("div");
    body.className = "card-body";

    var tags = document.createElement("div");
    tags.className = "card-tags";
    var region = document.createElement("a");
    region.className = "region-pill";
    region.href = movie.categoryFile;
    region.textContent = movie.categoryName;
    tags.appendChild(region);
    movie.tags.slice(0, 2).forEach(function (value) {
      var tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = value;
      tags.appendChild(tag);
    });

    var title = document.createElement("h3");
    var titleLink = document.createElement("a");
    titleLink.href = movie.file;
    titleLink.textContent = movie.title;
    title.appendChild(titleLink);

    var summary = document.createElement("p");
    summary.textContent = movie.oneLine;

    var meta = document.createElement("div");
    meta.className = "card-meta";
    meta.textContent = movie.region + " · " + movie.genre;

    body.appendChild(tags);
    body.appendChild(title);
    body.appendChild(summary);
    body.appendChild(meta);
    article.appendChild(poster);
    article.appendChild(body);
    return article;
  }

  function setupSearchPage() {
    var results = document.getElementById("search-results");
    var summary = document.getElementById("search-summary");
    var title = document.getElementById("search-title");
    if (!results || typeof SEARCH_MOVIES === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var searchInput = document.querySelector(".big-search input[name='q']");
    if (searchInput) {
      searchInput.value = query;
    }
    results.innerHTML = "";
    if (!query) {
      if (summary) {
        summary.textContent = "请输入关键词浏览相关影片。";
      }
      return;
    }
    var normalized = query.toLowerCase();
    var matched = SEARCH_MOVIES.filter(function (movie) {
      return [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        movie.tags.join(" ")
      ].join(" ").toLowerCase().indexOf(normalized) !== -1;
    });
    if (title) {
      title.textContent = "搜索结果";
    }
    if (summary) {
      summary.textContent = "与“" + query + "”相关的影片";
    }
    matched.slice(0, 240).forEach(function (movie) {
      results.appendChild(createSearchCard(movie));
    });
    if (!matched.length) {
      var empty = document.createElement("p");
      empty.className = "card-meta";
      empty.textContent = "未找到相关作品，换个关键词试试。";
      results.appendChild(empty);
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupCategoryFilters();
    setupSearchPage();
  });
})();
