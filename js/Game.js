class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton(" ");
    this.leaderboardTitle = createElement("h2");
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");

    this.playerMoving = false;
    this.leftKeyActive = false;
    this.blast = false;
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function (data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state,
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.addImage("blast", blastImg);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.addImage("blast", blastImg);
    car2.scale = 0.07;

    cars = [car1, car2];

    // C38 TA
    fuels = new Group();
    powerCoins = new Group();
    obstacle1 = new Group();
    obstacle2 = new Group();

    // Adding fuel sprite in the game
    this.addSprites(fuels, 15, fuelImage, 0.02);

    // Adding coin sprite in the game
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);

    this.addSprites(obstacle1, 10, obstacle1Img, 0.05);

    this.addSprites(obstacle2, 10, obstacle2Img, 0.05);
  }

  // C38 TA
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      x = random(width / 2 + 250, width / 2 - 250);
      y = random(-height * 4.5, height - 400);

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 400, height / 2 - 400);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 400, height / 2 - 300);

    this.leaderboardTitle.html("Leaderboard");
    this.leaderboardTitle.class("resetText");
    this.leaderboardTitle.position(width / 3 - 50, 100);

    this.leader1.class("leadersText");
    this.leader2.class("leadersText");

    this.leader1.position(width / 3 - 50, 140);
    this.leader2.position(width / 3 - 50, 180);
  }

  play() {
    this.handleElements();

    this.handleResetButton();

    Player.getPlayersInfo();

    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showlifeBar();
      this.showfuelBar(); 
      this.showLeaderBoard();

      //index of the array
      var index = 0;
      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the cars in x and y direction
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        var currentlife = allPlayers[plr].life;
        if (currentlife <= 0) {
          cars[index - 1].changeImage("blast", blastImg);
          cars[index - 1].scale = 0.4;
          this.playerMoving = false;
          player.update();
        }

        // C38  SA
        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleFuel(index);
          this.handlePowerCoins(index);
          this.handleObstacle(index);
          this.handleCarACollisionWithCarB(index);

          // Changing camera position in y direction
          //camera.position.x = cars[index - 1].position.x;
          camera.position.y = cars[index - 1].position.y;
        }
      }

      // handling keyboard events

      this.handlePlayerControl();

      var finishline = height * 6 - 100;
      if (player.positionY > finishline) {
        gameState = 2;
        player.rank += 1;
        Player.updateCarsAtEnd(player.rank);
        //console.log("rank: ",player.rank)
        this.showRank();
      }
      drawSprites();
    }
  }

  handleFuel(index) {
    // Adding fuel
    cars[index - 1].overlap(fuels, function (collector, collected) {
      player.fuel = 180;
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });
    if (player.fuel > 0 && this.playerMoving) {
      player.fuel -= 0.3;
    }

    player.update();

    if (player.fuel <= 0) {
      gameState = 2;
      this.gameOver();
    }
  }

  handlePowerCoins(index) {
    cars[index - 1].overlap(powerCoins, function (collector, collected) {
      player.score+=20;
      player.update();
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });
  }

  handleObstacle(index) {
    if (
      cars[index - 1].collide(obstacle1) ||
      cars[index - 1].collide(obstacle2)
    ) {
      if (this.leftKeyActive) {
        player.positionX += 100;
      } else {
        player.positionX -= 100;
      }
      if (player.life > 0) {
        player.life -= 180 / 4;
        console.log("playerIsCollided");
      }
      player.update();
      if (player.life <= 0) {
        gameState= 2
        //this.gameOver()
        this.blast = true;
        this.playerMoving = false;
      }
    }
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        gameState: 0,
        playerCount: 0,
        players: {},
      });
      window.location.reload();
    });
  }

  handlePlayerControl() {
    if (keyIsDown(UP_ARROW)) {
      player.positionY += 10;
      this.playerMoving = true;
      player.update();
    }

    if (keyIsDown(DOWN_ARROW)) {
      player.positionY -= 10;
      this.playerMoving = false;
      player.update();
    }

    if (keyIsDown(LEFT_ARROW) && player.positionX > 600) {
      player.positionX -= 10;
      this.playerMoving = true;
      this.leftKeyActive = true;
      player.update();
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < 1250) {
      player.positionX += 10;
      this.playerMoving = true;
      this.leftKeyActive = false;
      player.update();
    }
  }

  showLeaderBoard() {
    var myplayer1, myplayer2;

    var players = Object.values(allPlayers);
    console.log(players);

    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      myplayer1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
      myplayer2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }
    if (players[1].rank === 1) {
      myplayer1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
      myplayer2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(myplayer1);
    this.leader2.html(myplayer2);
  }

  showRank() {
    swal({
      title: `Awesome! ${"\n"} Rank ${player.rank} ${"\n"} Score ${
        player.score
      }`,
      text: "You reached the finish line successfully",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "ok",
    });
  }

  showlifeBar() {
    push();

    image(lifeImage, width / 2 - 150, height - player.positionY - 300, 20, 20);

    fill("white");
    rect(width / 2 - 100, height - player.positionY - 300, 180, 20);

    fill("orange");
    rect(width / 2 - 100, height - player.positionY - 300, player.life, 20);

    pop();
  }

  showfuelBar() {
    push();

    image(fuelImage, width / 2 - 150, height - player.positionY - 330, 20, 20);

    fill("white");
    rect(width / 2 - 100, height - player.positionY - 330, 180, 20);

    fill("red");
    rect(width / 2 - 100, height - player.positionY - 330, player.fuel, 20);

    pop();
  }

  gameOver() {
    swal({
      title: `Oops! ${"\n"} Game Over`,
      text: "Good Try!",
      imageUrl:
        "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "Thanks for Playing",
    });
  }

  handleCarACollisionWithCarB(index) {
    if (index === 1) {
      if (cars[index - 1].collide(cars[1])) {
        if (this.leftKeyActive) {
          player.positionX += 100;
        } else {
          player.positionX -= 100;
        }
        if (player.life > 0) {
          player.life -= 180 / 4;
        }
        player.update();
      }
    }

    if (index === 2) {
      if (cars[index-1].collide(cars[0])) {
        if (this.leftKeyActive) {
          player.positionX += 100;
        } else {
          player.positionX -= 100;
        }
        if (player.life > 0) {
          player.life -= 180 / 4;
        }
        player.update();
      }
    }
  }
}
