(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupPlayer(box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".play-trigger");
    var source = video ? video.getAttribute("data-stream") : "";
    var attached = false;
    var hls = null;

    function attach() {
      if (!video || !source || attached) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      box.classList.add("playing");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          box.classList.remove("playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("play", function () {
        box.classList.add("playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          box.classList.remove("playing");
        }
      });
      video.addEventListener("ended", function () {
        box.classList.remove("playing");
      });
    }
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(setupPlayer);
  });
}());
