(function(){
  $(document).ready(function() {
    var game = {};
    game.keys = [];

    game.width = 550;
    game.height = 600;

    game.stars = [];
    game.images = [];

    game.enemies = [];
    game.projectiles = [];

    game.doneImages = 0;
    game.requiredImages = 0;

    game.gameOver = false;
    game.gameWon = false;

    game.moving = false;

    //-------------------- to make the enemies move ------------------------------
    game.count = 24;
    game.division = 48;
    game.left = false;
    game.enemySpeed = 1;
    // ----------------------------------------------------------------------------

    game.shootTimer = 10;

    game.player = {
      x: game.width / 2 - 50,
      y: game.height - 40,
      width: 50,
      height: 30,
      speed: 3,
      rendered: false
    };

    game.explodeSound = new Audio("sounds/invaderkilled.wav");
    game.shootSound = new Audio("sounds/shoot.wav");
    game.themeSong = new Audio("sounds/spaceInvadersDubstepRemix.mp3");

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
      // game.player.rendered = false; // this is needed to fix the ship render at start... why you ask?... i have no clue.. shut up and drink your coffee
      // For some reason the background canvas was covering the ship render at the first render. so setted it to false here so it would render again. --- again, dont know why its needed.

      for (y = 0; y < 5; y++){
        for (x = 0; x < 5; x++){
          game.enemies.push({
            x: (x * 85) + 60,
            y: (y * 85),
            width: 70,
            height: 70,
            image: 1,
            dead: false,
            deadTime: 10
          })
        }
      }

      loop();
      setTimeout(function(){
        game.moving = true;
      }, 4000)
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

    function addBullet() {
      game.projectiles.push({
        x: game.player.x + game.player.width/2 - 5,
        y: game.player.y - game.player.height,
        width: 10,
        height: 30,
        image: 2
      });
    }

    function update() {
      addStars(1);
      if (game.count > 1000000) game.count = 0;
      game.count++;
      for (i in game.stars){
        game.stars[i].y--;
        if (game.stars[i].y <= -5){
          game.stars.splice(i, 1);
        }
      }
      // Player moves left
      if ((game.keys[37] || game.keys[65]) && !game.gameOver && !game.gameWon){
        // clearing here could be done in render when player is drawn. but cant figure out the bug when that is done. --- get back to it.
        if (game.player.x > 0){
          game.contextPlayer.clearRect(game.player.x, game.player.y, game.player.width, game.player.height);
          game.player.x -= game.player.speed;  
          game.player.rendered = false;    
        }
      }
      // Player moves right
      if ((game.keys[39] || game.keys[68]) && !game.gameOver && !game.gameWon){
        if (game.player.x <= game.width - game.player.width){
          game.contextPlayer.clearRect(game.player.x, game.player.y, game.player.width, game.player.height);
          game.player.x += game.player.speed;
          game.player.rendered = false;
        }
      }
      // Shooting
      if ((game.keys[32] && game.shootTimer == 10) && !game.gameOver && !game.gameWon){
        game.shootTimer--;
        addBullet();
        game.shootSound.play();
        setTimeout(function(){
          game.shootTimer = 10;
        }, 300)
      }
      if (game.count % game.division == 0){
        game.left = !game.left;
      }
      for (i in game.enemies){
        if(!game.moving){
          if (game.left){
            game.enemies[i].x -= game.enemySpeed;
          } else {
            game.enemies[i].x += game.enemySpeed;
          }
        } else{
          game.enemies[i].y++;
        }
        if (game.enemies[i].y + game.enemies[i].height >= game.player.y + 10){
          game.gameOver = true;
        }
      }
      for (i in game.projectiles){
        game.projectiles[i].y -= 3;
        if(game.projectiles[i].y <= -40){
          game.projectiles.splice(i, 1)
        }
      }
      // probably not the best way to check for collision.. but there arent that many collisions possible.. so this algorithm isnt too harsh..
      for (m in game.enemies){
        for (p in game.projectiles){
          if (collision(game.enemies[m], game.projectiles[p])){
            game.enemies[m].dead = true;
            game.enemies[m].image = 3;
            game.explodeSound.play();
            game.contextEnemies.clearRect(game.projectiles[p].x, game.projectiles[p].y, game.projectiles[p].width + 10, game.projectiles[p].height + 10);
            game.projectiles.splice(p, 1);
          }
        }
      }

      for (i in game.enemies){
        if (game.enemies[i].dead){
          game.enemies[i].deadTime--;
        }
        if (game.enemies[i].deadTime <= 0){
          game.contextEnemies.clearRect(game.enemies[i].x, game.enemies[i].y, game.enemies[i].width, game.enemies[i].height);
          game.enemies.splice(i, 1);
        }
      }

      if (game.enemies.length <= 0){
        game.gameWon = true;
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
        game.contextPlayer.moveTo(0, game.height - game.player.height - 11);
        game.contextPlayer.lineTo(game.width, game.height - game.player.height - 11);
        game.contextPlayer.strokeStyle = "red";
        game.contextPlayer.stroke();
        game.contextPlayer.drawImage(game.images[0], game.player.x, game.player.y, game.player.width, game.player.height);
        game.player.rendered = true;
      }
      for (i in game.enemies){
        var enemy = game.enemies[i];
        game.contextEnemies.clearRect(enemy.x, enemy.y, enemy.width, enemy.height);
        game.contextEnemies.drawImage(game.images[enemy.image], enemy.x, enemy.y, enemy.width, enemy.height);
      }
      for (i in game.projectiles){
        var proj = game.projectiles[i];
        game.contextEnemies.clearRect(proj.x, proj.y, proj.width, proj.height+10);
        game.contextEnemies.drawImage(game.images[proj.image], proj.x, proj.y, proj.width, proj.height);
      }

      if (game.gameOver){
        game.contextBackground.font = "bold 50px monaco";
        game.contextBackground.fillStyle = "white";
        game.contextBackground.fillText("Game Over", game.width / 2 - 150, game.height / 2 - 25);
        game.contextEnemies.clearRect(0, 0, game.width, game.height);
      }

      if (game.gameWon){
        game.contextBackground.font = "bold 50px monaco";
        game.contextBackground.fillStyle = "red";
        game.contextBackground.fillText("You WIN!", game.width / 2 - 150, game.height / 2 - 25);
        game.contextEnemies.clearRect(0, 0, game.width, game.height);
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
        game.themeSong.play();
      } else {
        setTimeout(function() {
          checkImages();
        },1)
      }
    }

    function collision(first, second){
      return !( first.x > second.x + second.width  ||
               first.x + first.width < second.x   ||
               first.y > second.y + second.height ||
               first.y + first.height < second.y );
    }

    game.contextBackground.font = "bold 50px monaco";
    game.contextBackground.fillStyle = "white";
    game.contextBackground.fillText("Loading...", game.width / 2 - 100, game.height / 2 - 25)
    initImages(["img/ship.png", "img/enemy.png", "img/bullet.png", "img/explosion.png"]);
    checkImages();
    
    $("#playAgainButton").on("click", function(){
      location.reload();
    })

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