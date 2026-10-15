/* Seamless edges on mobile Safari
   ---------------------------------------------------------------------------
   Safari on iPhone paints the areas behind its status bar and toolbar with the
   background of a position: fixed element touching the top / bottom edge of
   the viewport. The page has two such strips (.edge--top / .edge--bottom,
   direct children of <body>, iOS only via CSS); this script keeps their colour
   (and theme-color) matched to what is at the top and bottom of the screen
   while scrolling.

   Mark regions with the colour(s) a viewer sees there:
     data-edge="#0f0636"                  one colour for the whole element
     data-edge="#a #b #c"                 colours spread top -> bottom over it
     data-edge-above="#a #b" / -below     a band painted just above / below the
                                          element (e.g. its ::before / ::after);
                                          its height is data-edge-above-size /
                                          -below-size (px), else the height of
                                          the element's ::before / ::after
   Nested regions win over their parents; bands win over everything.
   Writes --edge-top / --edge-bottom on <html> and updates theme-color. */
(function () {
  var root = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  var regions = [];
  var last = { top: "", bottom: "" };
  var ticking = false;

  function stops(value) {
    return value ? value.trim().split(/\s+/) : null;
  }

  function pick(list, frac) {
    return list[Math.min(list.length - 1, Math.max(0, Math.floor(frac * list.length)))];
  }

  function bandSize(el, which) {
    var size = parseFloat(el.getAttribute("data-edge-" + which + "-size"));
    if (size) return size;
    return parseFloat(getComputedStyle(el, which === "above" ? "::before" : "::after").height) || 0;
  }

  function collect() {
    regions = [].map.call(document.querySelectorAll("[data-edge], [data-edge-above], [data-edge-below]"), function (el) {
      var depth = 0;
      for (var p = el.parentElement; p; p = p.parentElement) if (p.hasAttribute("data-edge")) depth++;
      return {
        el: el,
        depth: depth,
        main: stops(el.getAttribute("data-edge")),
        above: stops(el.getAttribute("data-edge-above")),
        below: stops(el.getAttribute("data-edge-below")),
        aboveSize: el.hasAttribute("data-edge-above") ? bandSize(el, "above") : 0,
        belowSize: el.hasAttribute("data-edge-below") ? bandSize(el, "below") : 0
      };
    });
  }

  // The colour at height y (viewport px): the deepest region covering y.
  function colourAt(y) {
    var best = null;
    var bestRank = -1;
    regions.forEach(function (r) {
      var box = r.el.getBoundingClientRect();
      var hit = null;
      var rank = -1;
      if (r.above && y >= box.top - r.aboveSize && y < box.top) {
        hit = pick(r.above, (y - (box.top - r.aboveSize)) / r.aboveSize); rank = 1000 + r.depth;
      } else if (r.below && y >= box.bottom && y < box.bottom + r.belowSize) {
        hit = pick(r.below, (y - box.bottom) / r.belowSize); rank = 1000 + r.depth;
      } else if (r.main && y >= box.top && y < box.bottom) {
        hit = pick(r.main, (y - box.top) / box.height); rank = r.depth;
      }
      if (hit && rank > bestRank) { best = hit; bestRank = rank; }
    });
    return best;
  }

  function update() {
    ticking = false;
    var inset = 6; // just inside the viewport, where the strips sit
    var top = colourAt(inset) || last.top;
    var bottom = colourAt(window.innerHeight - inset) || last.bottom;
    if (top && top !== last.top) {
      root.style.setProperty("--edge-top", top);
      if (meta) meta.setAttribute("content", top);
      last.top = top;
    }
    if (bottom && bottom !== last.bottom) {
      root.style.setProperty("--edge-bottom", bottom);
      last.bottom = bottom;
    }
  }

  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  function refresh() { collect(); request(); }

  collect();
  update();
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", refresh);                    // incl. Safari's toolbar resizing the viewport
  if (window.visualViewport) window.visualViewport.addEventListener("resize", request);
  window.addEventListener("pageshow", request);                  // back/forward cache, restored scroll
  window.addEventListener("load", refresh);                      // layout after images and fonts
})();
