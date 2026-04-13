/* ============================================
   GLITCH TEXT EFFECT
   Scrambles text on hover for 200ms then
   resolves to original
   ============================================ */

(function() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';

  document.querySelectorAll('.glitch-hover').forEach(function(el) {
    var original = el.textContent;

    el.addEventListener('mouseenter', function() {
      var iterations = 0;
      var maxIterations = 6;

      var interval = setInterval(function() {
        el.textContent = original.split('').map(function(char, i) {
          if (i < iterations) return original[i];
          if (char === ' ') return ' ';
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');

        iterations++;
        if (iterations > maxIterations) {
          clearInterval(interval);
          el.textContent = original;
        }
      }, 35);
    });
  });
})();
