(function () {
  var shell = document.querySelector('.player-shell');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var cover = shell.querySelector('.player-cover');
  var source = shell.getAttribute('data-video-src');
  var hlsInstance = null;
  var prepared = false;

  var playVideo = function () {
    var attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  };

  var attachWithHls = function () {
    if (hlsInstance || !window.Hls || !window.Hls.isSupported()) {
      return false;
    }

    hlsInstance = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
      playVideo();
    });

    return true;
  };

  var prepare = function () {
    if (!video || !source) {
      return;
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    if (prepared) {
      playVideo();
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.load();
      playVideo();
      return;
    }

    if (attachWithHls()) {
      return;
    }

    video.src = source;
    video.load();
    playVideo();
  };

  if (cover) {
    cover.addEventListener('click', prepare);
  }

  shell.addEventListener('click', function (event) {
    if (event.target === video && !prepared) {
      prepare();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });
})();
