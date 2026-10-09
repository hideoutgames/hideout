// Keep the footer year current (static fallback in the HTML is the build year).
(function () {
  var el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
})();
