/* ============================================
   TYPING EFFECT
   Types text character by character with
   randomized delays to feel human
   ============================================ */

function typeText(elementId, text, speed, callback) {
  var el = document.getElementById(elementId);
  if (!el) return;
  var i = 0;

  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      var delay = speed + Math.random() * speed * 0.6 - speed * 0.3;
      setTimeout(type, Math.max(delay, 15));
    } else if (callback) {
      callback();
    }
  }

  type();
}

function typeSequence(steps, index, callback) {
  if (index >= steps.length) {
    if (callback) callback();
    return;
  }
  var step = steps[index];
  typeText(step.target, step.text, step.speed, function() {
    setTimeout(function() {
      typeSequence(steps, index + 1, callback);
    }, 200);
  });
}
