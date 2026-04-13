/* ============================================
   EASTER EGGS
   Konami code, console messages, context menu
   ============================================ */

(function() {
  // Konami Code: up up down down left right left right b a
  var konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  var konamiIndex = 0;

  document.addEventListener('keydown', function(e) {
    if (e.keyCode === konamiSequence[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        konamiIndex = 0;
        activateKonami();
      }
    } else {
      konamiIndex = 0;
    }
  });

  function activateKonami() {
    document.body.style.transition = 'filter 0.5s';
    document.body.style.filter = 'hue-rotate(180deg) invert(1)';
    setTimeout(function() {
      document.body.style.filter = 'none';
    }, 3000);

    console.log('%c SECRET UNLOCKED ', 'background: #FF00FF; color: white; font-size: 20px; padding: 8px;');
    console.log('%c You found the Konami code. Nice.', 'color: #FF00FF; font-size: 14px;');
  }

  // Console messages for devs
  console.log('%c RYANN LYNN MURPHY ', 'background: #000; color: #0F0; font-size: 16px; padding: 8px; font-family: Courier New;');
  console.log('%c Playwright / Technologist', 'color: #666; font-size: 12px; font-family: Courier New;');
  console.log('%c If you\'re reading this you\'re either hiring me or judging my code.', 'color: #999; font-size: 11px;');
  console.log('%c Either way, hi.', 'color: #999; font-size: 11px;');
  console.log('');
  console.log('%c Hand-written HTML/CSS/JS. Yes, the terminal thing is on purpose.', 'color: #666; font-size: 10px;');
  console.log('%c Konami code works btw.', 'color: #0000EE; font-size: 10px;');

  // Custom right-click context menu
  var customMenu = null;

  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    removeMenu();

    customMenu = document.createElement('div');
    customMenu.style.cssText = 'position:fixed;z-index:9999;background:#C0C0C0;border:2px outset #DFDFDF;padding:2px;font-family:Arial,sans-serif;font-size:12px;min-width:180px;box-shadow:2px 2px 4px rgba(0,0,0,0.3);';

    var items = [
      { label: 'View Source (it\'s hand-written)', action: function() { window.open('https://github.com/ryannlynnmurphy', '_blank'); } },
      { label: 'Download Resume', action: function() { window.open('assets/resume.pdf', '_blank'); } },
      { label: '---' },
      { label: 'Why does this look like 1997?', action: function() { alert('On purpose.'); } },
      { label: 'Secret Page', action: function() { window.location.href = 'secret.html'; } }
    ];

    items.forEach(function(item) {
      if (item.label === '---') {
        var sep = document.createElement('div');
        sep.style.cssText = 'border-top:1px solid #808080;border-bottom:1px solid #fff;margin:3px 2px;';
        customMenu.appendChild(sep);
        return;
      }
      var menuItem = document.createElement('div');
      menuItem.textContent = item.label;
      menuItem.style.cssText = 'padding:4px 24px 4px 8px;cursor:pointer;';
      menuItem.addEventListener('mouseenter', function() {
        this.style.background = '#000080';
        this.style.color = '#fff';
      });
      menuItem.addEventListener('mouseleave', function() {
        this.style.background = 'transparent';
        this.style.color = '#000';
      });
      menuItem.addEventListener('click', function() {
        removeMenu();
        item.action();
      });
      customMenu.appendChild(menuItem);
    });

    customMenu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
    customMenu.style.top = Math.min(e.clientY, window.innerHeight - 150) + 'px';
    document.body.appendChild(customMenu);
  });

  document.addEventListener('click', removeMenu);

  function removeMenu() {
    if (customMenu && customMenu.parentNode) {
      customMenu.parentNode.removeChild(customMenu);
      customMenu = null;
    }
  }
})();
