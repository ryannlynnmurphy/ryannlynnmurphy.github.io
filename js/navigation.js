/* ============================================
   NAVIGATION
   Scroll highlighting, smooth scroll, [?] menu
   ============================================ */

(function() {
  var navLinks = document.querySelectorAll('.nav-link');
  var sections = document.querySelectorAll('.section');
  var helpBtn = document.getElementById('help-btn');
  var hiddenMenu = document.getElementById('hidden-menu');

  // Highlight active nav link on scroll
  function updateActiveLink() {
    var scrollY = window.scrollY + 80;

    sections.forEach(function(section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function(link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink();

  // [?] menu toggle
  if (helpBtn && hiddenMenu) {
    helpBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      hiddenMenu.classList.toggle('open');
    });

    document.addEventListener('click', function() {
      hiddenMenu.classList.remove('open');
    });

    hiddenMenu.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
})();
