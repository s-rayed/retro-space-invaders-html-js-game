(function(){
  $(document).ready(function() {
    var game = {};
    game.keys = [];

    game.width = 550;
    game.height = 600;

    game.stars = [];
    game.images = [];

    game.enemies = [];

    game.doneImages = 0;
    game.requiredImages = 0;

    //-------------------- to make the enemies move ------------------------------
    game.count = 24;
    game.division = 48;
    game.left = false;
    game.enemySpeed = 1;
    // ----------------------------------------------------------------------------

    game.player = {
      x: game.width / 2 - 50,
      y: game.height - 40,
      width: 50,
      height: 30,
      speed: 3,
      rendered: false
    };

    game.contextBackground = document.getElementById("backgroundCanvas").getContext("2d");
    game.contextPlayer = document.getElementById("playerCanvas").getContext("2d");
    game.contextEnemies = document.getElementById("enemiesCanvas").getContext("2d");

    // -------------------------------------------------------------------------------------------

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
      game.player.rendered = false; // this is needed to fix the ship render at start... why you ask?... i have no clue.. shut up and drink your coffee
      // For some reason the background canvas was covering the ship render at the first render. so setted it to false here so it would render again. --- again, dont know why its needed.

      for (y = 0; y < 5; y++){
        for (x = 0; x < 5; x++){
          game.enemies.push({
            x: (x * 85) + 60,
            y: (y * 85),
            width: 70,
            height: 70,
            image: 1
          })
        }
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
      game.count++;
      for (i in game.stars){
        if (game.stars[i].y <= -5){
          game.stars.splice(i, 1)
        }
        game.stars[i].y--;
      }
      if (game.keys[37] || game.keys[65]){
        // clearing here could be done in render when player is drawn. but cant figure out the bug when that is done. --- get back to it.
        if (game.player.x > 0){
          game.contextPlayer.clearRect(game.player.x, game.player.y, game.player.width, game.player.height);
          game.player.x -= game.player.speed;  
          game.player.rendered = false;    
        }
      }
      if (game.keys[39] || game.keys[68]){
        if (game.player.x <= game.width - game.player.width){
          game.contextPlayer.clearRect(game.player.x, game.player.y, game.player.width, game.player.height);
          game.player.x += game.player.speed;
          game.player.rendered = false;
        }
      }
      if (game.count % game.division == 0){
        game.left = !game.left;
      }
      for (i in game.enemies){
        if (game.left){
          game.enemies[i].x -= game.enemySpeed;
        } else {
          game.enemies[i].x += game.enemySpeed;
        }  
      }
      
    }

    function render() {
      game.contextBackground.clearRect(0, 0, game.width, game.height);
      game.contextBackground.fillStyle = "white";
      for (i in game.stars){
        var star = game.stars[i];
        game.contextBackground.fillRect(star.x, star.y, star.size, star.size);
      }
      if (!game.player.rendered){
        console.log('rendering');
        game.contextPlayer.drawImage(game.images[0], game.player.x, game.player.y, game.player.width, game.player.height);
        game.player.rendered = true;
      }
      for (i in game.enemies){
        var enemy = game.enemies[i];
        game.contextEnemies.clearRect(enemy.x, enemy.y, enemy.width, enemy.height);
        game.contextEnemies.drawImage(game.images[enemy.image], enemy.x, enemy.y, enemy.width, enemy.height);
      }
      
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