var canvas;
var context;
var proton;
var renderer;
var emitter;
var mouseObj;
var attractionForce;
var _mousedown = false;

window.handsfree = undefined;

main();

function main() {
  canvas = document.getElementById("testCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  loadImage();

  mouseObj = {
    x: canvas.width / 2,
    y: canvas.height / 2
  };

  canvas.addEventListener("mousedown", mouseDownHandler, false);
  canvas.addEventListener("mousemove", mouseMoveHandler, false);
  canvas.addEventListener("mouseup", mouseUpHandler, false);

  startHandsFree();

  resize();
}

function startHandsFree() {
  // Start settings for your app
  // Instantiate Handsfree
  var handsfree = new Handsfree({ debug: false });
  window.handsfree = handsfree;

  handsfree.use({
    name: "PaperDraw",
    /**
     * This is called on every webcam frame
     * @param faces See README
     */
    onFrame(faces) {
      //console.log(faces);
      faces.forEach((face, faceIndex) => {
        this.maybeStartPath(face, faceIndex);
        this.maybeDrawPath(face, faceIndex);
        this.maybeEndPath(face, faceIndex);
      });
    },

    /**
     * Do stuff when the mouse is released
     */
    maybeEndPath(face, faceIndex) {
      if (face.cursor.state.mouseUp) {
        //console.log('mouse up');
        document.getElementById("testCanvas").dispatchEvent(
          new MouseEvent("mouseup", {
            bubbles: true,
            cancelable: true,
            clientX: face.cursor.x,
            clientY: face.cursor.y
          })
        );
      }
    },

    /**
     * Starts a new path when clicked
     */
    maybeStartPath(face, faceIndex) {
      if (face.cursor.state.mouseDown) {
        console.log("mouse down");
        // Dispatch a mousedown at the point of click, bubbling in case we click a span element inside a button for example
        document.getElementById("testCanvas").dispatchEvent(
          new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
            clientX: face.cursor.x,
            clientY: face.cursor.y
          })
        );
      }
    },

    /**
     * Continues drawing a path
     */
    maybeDrawPath(face, faceIndex) {
      //  if (face.cursor.state.mouseDrag) {
      document.getElementById("testCanvas").dispatchEvent(
        new MouseEvent("mousemove", {
          bubbles: true,
          cancelable: true,
          clientX: face.cursor.x,
          clientY: face.cursor.y
        })
      );
      // }
    }
  });
}

function loadImage() {
  var image = new Image();
  image.onload = function(e) {
    createProton(e.target);
    tick();
  };
  image.src =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJkSURBVHjaxJeJbusgEEW94S1L//83X18M2MSuLd2pbqc4wZGqRLrKBsyZhQHny7Jk73xVL8xpVhWrcmiB5lX+6GJ5YgQ2owbAm8oIwH1VgKZUmGcRqKGGPgtEQQAzGR8hQ59fAmhJHSAagigJ4E7GPWRXOYC6owAd1JM6wDQPADyMWUqZRMqmAojHp1Vn6EQQEgUNMJLnUjMyJsM49wygBkAPw9dVFwXRkncCIIW3GRgoTQUZn6HxCMAFEFd8TwEQ78X4rHbILoAUmeT+RFG4UhQ6MiIAE4W/UsYFjuVjAIa2nIY4q1R0GFtQWG3E84lqw2GO2QOoCKBVu0BAPgDSU0eUDjjQenNkV/AW/pWChhpMTelo1a64AOKM30vk18GzTHXCNtI/Knz3DFBgsUqBGIjTInXRY1yA9xkVoqW5tVq3pDR9A0hfF5BSARmVnh7RMDCaIdcNgbPBkgzn1Bu+SfIEFSpSBmkxyrMicb0fAEuCZrWnN89veA/4XcakrPcjBWzkTuLjlbfTQPOlBhz+HwkqqPXmPQDdrQItxE1moGof1S74j/8txk8EHhTQrAE8qlwfqS5yukm1x/rAJ9Jiaa6nyATqD78aUVBhFo8b1V4DdTXdCW+IxA1zB4JhiOhZMEWO1HqnvdoHZ4FAMIhV9REF8FiUm0jsYPEJx/Fm/N8OhH90HI9YRHesWbXXZwAShU8qThe7H8YAuJmw5yOd989uRINKRTJAhoF8jbqrHKfeCYdIISZfSq26bk/K+yO3YvfKrVgiwQBHnwt8ynPB25+M8hceTt/ybPhnryJ78+tLgAEAuCFyiQgQB30AAAAASUVORK5CYII=";
}

function createProton(image) {
  proton = new Proton();
  emitter = new Proton.Emitter();
  emitter.rate = new Proton.Rate(new Proton.Span(100, 20), 0.1);

  emitter.addInitialize(new Proton.Mass(1));
  emitter.addInitialize(new Proton.Body(image));
  //emitter.addInitialize(new Proton.P(new Proton.PointZone(canvas.width / 2, canvas.height / 2)));
  emitter.addInitialize(new Proton.Life(1, 1.7));
  emitter.addInitialize(
    new Proton.V(new Proton.Span(3, 5), new Proton.Span(0, 360), "polar")
  );

  emitter.addBehaviour(new Proton.Color("#FF44", "#FF0000"));
  attractionForce = new Proton.Attraction(mouseObj, 40, 200);
  emitter.addBehaviour(attractionForce);
  emitter.addBehaviour(
    new Proton.Scale(Proton.getSpan(1, 1.6), Proton.getSpan(0, 0.1))
  );
  emitter.addBehaviour(new Proton.Alpha(1, 0.2));

  emitter.p.x = canvas.width / 2;
  emitter.p.y = canvas.height / 2;
  emitter.emit();
  proton.addEmitter(emitter);

  renderer = new Proton.WebGLRenderer(canvas);
  renderer.blendFunc("SRC_ALPHA", "ONE");
  proton.addRenderer(renderer);
}

function resize() {
  window.onresize = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    mouseObj.x = canvas.width / 2;
    mouseObj.y = canvas.height / 2;
    emitter.p.x = canvas.width / 2;
    emitter.p.y = canvas.height / 2;

    renderer.resize(canvas.width, canvas.height);
  };
}

function tick() {
  requestAnimationFrame(tick);

  if (proton) {
    proton.update();
  }
}

function mouseMoveHandler(e) {
  //if (_mousedown) {
  if (e.layerX || e.layerX == 0) {
    emitter.p.x = e.layerX;
    emitter.p.y = e.layerY;

    mouseObj.x = e.layerX;
    mouseObj.y = e.layerY;
  } else if (e.offsetX || e.offsetX == 0) {
    emitter.p.x = e.offsetX;
    emitter.p.y = e.offsetY;

    mouseObj.x = e.offsetY;
    mouseObj.y = e.offsetY;
  }

  //emitter.p.x = mouseX; //e.layerX;
  //emitter.p.y = mouseY;//e.layerY;
  //}
}

function mouseDownHandler(e) {
  _mousedown = true;
  attractionForce.reset(mouseObj, 0, 200);
  setTimeout(function() {
    attractionForce.reset(mouseObj, 10, 200);
  }, 500);
}
function mouseUpHandler(e) {
  _mousedown = false;
}
