(function() {
  var c = document.getElementById('rain');
  var ctx = c.getContext('2d');
  var fs = 14, cols, drops;
  function init() {
    c.width = innerWidth; c.height = innerHeight;
    cols = Math.floor(c.width / fs);
    drops = Array.from({length: cols}, function() { return Math.random() * -100; });
  }
  init();
  addEventListener('resize', init);
  setInterval(function() {
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = fs + 'px monospace';
    for (var i = 0; i < drops.length; i++) {
      ctx.fillStyle = 'rgba(0,255,0,' + (0.08 + Math.random() * 0.25) + ')';
      ctx.fillText(Math.random() > 0.5 ? '1' : '0', i * fs, drops[i] * fs);
      if (drops[i] * fs > c.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }, 50);
})();
