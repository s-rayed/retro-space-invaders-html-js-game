(function(){
  $(document).ready(function() {
    var game = {};
    game.keys = [];

    game.width = 550;
    game.height = 600;

    game.contextBackground = document.getElementById("backgroundCanvas").getContext("2d");
    game.contextPlayer = document.getElementById("playerCanvas").getContext("2d");

    game.stars = [];
    game.images = [];
    game.doneImages = 0;
    game.requiredImages = 0;

    game.player = {
      x: game.width / 2 - 50,
      y: game.height - 40,
      width: 50,
      height: 30,
      speed: 3
    };

    $(document).keydown(function(e) {
      game.keys[e.keyCode ? e.keyCode : e.which] = true;
    });

    $(document).keyup(function(e) {
      delete game.keys[e.keyCode ? e.keyCode : e.which];
    });


    function init() {
      for(var i = 0; i < game.height; i++){
        game.stars.push({
          x: Math.floor(Math.random() * game.width),
          y: Math.floor(Math.random() * game.height),
          size: Math.random() * 4
        });
      }
      loop();
    }

    function addStars(num){
      for(var i = 0; i < num; i++){
        game.stars.push({
          x: Math.floor(Math.random() * game.width),
          y: game.height + 10,
          size: Math.random() * 4
        });
      }
    }

    // keys: {
    //   left: 37,
    //   up: 38,
    //   right: 39,
    //   down: 40,
    //   a: 65,
    //   w: 87,
    //   d: 68,
    //   s: 83,
    //   space: 32 
    // }

    function update() {
      addStars(1);
      for (i in game.stars){
        if (game.stars[i].y <= -5){
          game.stars.splice(i, 1)
        }
        game.stars[i].y--;
      }
      if (game.keys[37] || game.keys[65]){
        // clearing here could be done in render when player is drawn. but cant figure out the bug when that is done. --- get back to it.
        game.contextPlayer.clearRect(game.player.x, game.player.y, game.player.width, game.player.height);
        game.player.x -= game.player.speed;
      }
      if (game.keys[39] || game.keys[68]){
        game.contextPlayer.clearRect(game.player.x, game.player.y, game.player.width, game.player.height);
        game.player.x += game.player.speed;  
      }
    }

    function render() {
      game.contextBackground.fillStyle = "white";
      game.contextBackground.clearRect(0, 0, game.width, game.height);
      for (i in game.stars){
        var star = game.stars[i];
        game.contextBackground.fillRect(star.x, star.y, star.size, star.size)
      }
      game.contextPlayer.drawImage(game.images[0], game.player.x, game.player.y, game.player.width, game.player.height);
    }

    function loop() {
      requestAnimFrame(function() {
        loop();
      });
      update();
      render();
    }

    function initImages(paths){
      game.requiredImages = paths.length;
      for(i in paths){
        var img = new Image();
        img.src = paths[i];
        game.images[i] = img;
        game.images[i].onload = function() {
          game.doneImages++;
        }
      }
    }

    function checkImages(){
      if (game.doneImages >= game.requiredImages){
        init();
      } else {
        setTimeout(function() {
          checkImages();
        },1)
      }
    }

    game.contextBackground.font = "bold 50px monaco";
    game.contextBackground.fillStyle = "white";
    game.contextBackground.fillText("Loading...", game.width / 2 - 100, game.height / 2 - 25)
    initImages(["img/ship.png", "img/enemy.png", "img/bullet.png"]);
    checkImages();
    init();
  });

})();

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();