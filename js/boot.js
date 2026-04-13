/* Boot sequence then hand off to chatbot */
(function() {
  var scene = document.getElementById('scene');
  var screen = document.getElementById('screen');
  var flash = document.getElementById('flash');
  var content = document.getElementById('content');
  var led = document.getElementById('led');
  var output = document.getElementById('output');

  function addSystem(text) {
    var div = document.createElement('div');
    div.className = 'msg msg-system';
    output.appendChild(div);
    return new Promise(function(resolve) {
      var i = 0;
      var iv = setInterval(function() {
        if (i < text.length) {
          div.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(iv);
          resolve();
        }
      }, 15);
    });
  }

  // Name flash overlay — RYANN LYNN MURPHY
  function flashName() {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;z-index:15;display:flex;align-items:center;justify-content:center;background:#000;pointer-events:none;';

    var text = document.createElement('div');
    text.style.cssText = 'font-family:inherit;font-size:1.4rem;font-weight:bold;letter-spacing:3px;color:#fff;position:relative;white-space:nowrap;';
    text.textContent = 'RYANN LYNN MURPHY';

    var cyan = document.createElement('span');
    cyan.textContent = 'RYANN LYNN MURPHY';
    cyan.style.cssText = 'position:absolute;top:0;left:0;color:#0FF;clip-path:inset(30% 0 40% 0);transform:translate(2px,1px);';
    text.appendChild(cyan);

    var magenta = document.createElement('span');
    magenta.textContent = 'RYANN LYNN MURPHY';
    magenta.style.cssText = 'position:absolute;top:0;left:0;color:#F0F;clip-path:inset(60% 0 10% 0);transform:translate(-2px,-1px);';
    text.appendChild(magenta);

    overlay.appendChild(text);
    screen.appendChild(overlay);

    var count = 0;
    var iv = setInterval(function() {
      overlay.style.opacity = Math.random() > 0.3 ? '1' : '0';
      text.style.transform = 'translate(' + (Math.random()*4-2) + 'px,' + (Math.random()*2-1) + 'px)';
      cyan.style.clipPath = 'inset(' + Math.floor(Math.random()*60) + '% 0 ' + Math.floor(Math.random()*60) + '% 0)';
      magenta.style.clipPath = 'inset(' + Math.floor(Math.random()*60) + '% 0 ' + Math.floor(Math.random()*60) + '% 0)';
      count++;
      if (count > 20) {
        clearInterval(iv);
        overlay.style.opacity = '1';
        text.style.transform = 'none';
        setTimeout(function() {
          overlay.style.transition = 'opacity 0.4s';
          overlay.style.opacity = '0';
          setTimeout(function() { overlay.remove(); }, 400);
        }, 600);
      }
    }, 60);
  }

  // Phase 1: Show computer
  setTimeout(function() { scene.classList.add('on'); }, 300);

  // Phase 2: Power on flash
  setTimeout(function() {
    led.classList.add('on');
    flash.style.opacity = '1';
    setTimeout(function() { flash.style.opacity = '0'; }, 60);
    setTimeout(function() { flash.style.opacity = '0.6'; }, 120);
    setTimeout(function() { flash.style.opacity = '0'; }, 180);
    setTimeout(function() { flash.style.opacity = '0.3'; flash.style.background = '#0F0'; }, 250);
    setTimeout(function() { flash.style.opacity = '0'; flash.style.background = '#fff'; }, 450);
  }, 1000);

  // Phase 2.5: Name flash
  setTimeout(flashName, 1500);

  // Phase 3: Content appears, boot sequence, then chatbot
  setTimeout(function() {
    content.classList.add('on');

    addSystem('scatter v0.1.0 // local-first ai').then(function() {
      return addSystem('');
    }).then(function() {
      return addSystem('ai belongs to the people who use it.');
    }).then(function() {
      return addSystem('not the companies that sell it.');
    }).then(function() {
      return addSystem('');
    }).then(function() {
      return addSystem('local models. open source. your hardware.');
    }).then(function() {
      return addSystem('no cloud. no telemetry. yours.');
    }).then(function() {
      return addSystem('');
    }).then(function() {
      return addSystem('ready_');
    }).then(function() {
      setTimeout(function() {
        Bot.start();
      }, 400);
    });
  }, 3200);
})();
