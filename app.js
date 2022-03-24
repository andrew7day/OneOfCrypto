function runAnimation(frameFunc) {
  var lastTime = null;
  function frame(time) {
    var stop = false;
    if (lastTime != null) {
      var timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop) {
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);
}

function runLevel(level, Display) {
  initGameObjects();
  return new Promise(done => {
    var arrows = trackKeys(arrowCodes);
    var display = new Display(document.body, level);
    runAnimation(step => {
      level.act(step, arrows);
      display.drawFrame(step);
      if (level.isFinished()) {
        display.clear();
        done(level.status);
        return false;
      }
    });
  });
}

function initGameObjects() {
  if (initGameObjects.isInit) {
    return;
  }

  initGameObjects.isInit = true;

  Level.prototype.act = function(step, keys) {
    if (this.status !== null) {
      this.finishDelay -= step;
    }

    while (step > 0) {
      var thisStep = Math.min(step, maxStep);
      this.actors.forEach(actor => {
        actor.act(thisStep, this, keys);
      });

      if (this.status === 'lost') {
        this.player.pos.y += thisStep;
        this.player.size.y -= thisStep;
      }

      step -= thisStep;
    }
  };
