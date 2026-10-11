(function () {
  // Header scroll-away: expose how far the page has scrolled through the hero
  // as --p (0..1) on .hero; games.css turns it into the parallax / fade.
  var hero = document.querySelector(".hero");
  if (hero) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var p = window.scrollY / (hero.offsetHeight * 0.8);
      hero.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(4));
    };
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // Fade sections in as they scroll into view.
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  items.forEach(function (el) { io.observe(el); });
})();
