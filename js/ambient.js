/* ============================================
   AMBIENT LIFE
   Smooth flowing animations, occasional glitches,
   the feeling of creative energy moving through
   ============================================ */

(function() {
  // Scroll reveal with staggered timing
  var reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length) {
    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function(el) { revealObserver.observe(el); });
  }

  // Flowing gradient background animation
  var bg = document.createElement('div');
  bg.className = 'ambient-bg';
  bg.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bg);

  // Random glitch bursts on interactive elements
  var glitchTargets = document.querySelectorAll('.project-name, .play-title, .page-title, h1');
  glitchTargets.forEach(function(el) {
    var original = el.textContent;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';

    // Random glitch every 8-20 seconds
    function scheduleGlitch() {
      var delay = 8000 + Math.random() * 12000;
      setTimeout(function() {
        glitchText(el, original);
        scheduleGlitch();
      }, delay);
    }

    // Also glitch on hover
    el.addEventListener('mouseenter', function() {
      glitchText(el, original);
    });

    scheduleGlitch();

    function glitchText(element, orig) {
      var iterations = 0;
      var interval = setInterval(function() {
        element.textContent = orig.split('').map(function(c, i) {
          if (i < iterations || c === ' ') return orig[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        iterations += 2;
        if (iterations > orig.length) {
          clearInterval(interval);
          element.textContent = orig;
        }
      }, 30);
    }
  });

  // Smooth parallax on mouse move (subtle)
  var page = document.querySelector('.page');
  if (page && window.innerWidth > 700) {
    document.addEventListener('mousemove', function(e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 2;
      var y = (e.clientY / window.innerHeight - 0.5) * 2;
      page.style.transform = 'translate(' + (x * -1.5) + 'px, ' + (y * -1) + 'px)';
    });
  }

  // Occasional screen flicker (very subtle)
  function flicker() {
    document.body.style.opacity = '0.97';
    setTimeout(function() {
      document.body.style.opacity = '1';
    }, 50);
    setTimeout(flicker, 15000 + Math.random() * 25000);
  }
  setTimeout(flicker, 10000);
})();
