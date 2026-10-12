(function () {
  var root = document.documentElement;

  // Header intro: games.css holds it on its first frame until <html> gets
  // .intro-go. Start it once the sky photo is decoded and the title font has
  // loaded, so nothing pops in mid-animation (the inline script in the page
  // head starts it after 2s regardless).
  var start = function () { root.classList.add("intro-go"); };
  var waits = [];
  var sky = document.querySelector(".hero__photo img");
  if (sky && sky.decode) waits.push(sky.decode().catch(function () {}));
  if (document.fonts && document.fonts.load) {
    waits.push(document.fonts.load('800 1em "Outfit"').catch(function () {}));
    waits.push(document.fonts.load('500 1em "Outfit"').catch(function () {}));
  }
  Promise.all(waits).then(start);

  // Images inside (or being) an element, ready to paint; gives up after `ms`.
  var imagesReady = function (el, ms) {
    var imgs = el.tagName === "IMG" ? [el] : [].slice.call(el.querySelectorAll("img"));
    var ready = Promise.all(imgs.map(function (img) {
      return img.decode ? img.decode().catch(function () {}) : null;
    }));
    return Promise.race([ready, new Promise(function (r) { setTimeout(r, ms); })]);
  };

  // Fade sections in as they scroll into view, once their images are ready
  // (so a card never slides in empty and fills in afterwards). Anything that
  // is already above the screen, or earlier on the page than an element being
  // revealed, is revealed too, so jumping past (anchor link, reload mid-page)
  // never leaves elements hidden.
  var items = [].slice.call(document.querySelectorAll(".reveal"));
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }
  var reveal = function (el) {
    if (el.dataset.revealing) return;
    el.dataset.revealing = "1";
    io.unobserve(el);
    imagesReady(el, 1500).then(function () { el.classList.add("is-in"); });
  };
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting && entry.boundingClientRect.bottom > 0) return;
      var i = items.indexOf(entry.target);
      for (var j = 0; j <= i; j++) reveal(items[j]);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  items.forEach(function (el) { io.observe(el); });
})();
