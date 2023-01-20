var canvas;
var backgroundImage, bgImg, car1_img, car2_img, track;
var database, gameState;
var form, player, playerCount;
var allPlayers, car1, car2,fuels, powerCoins,obstacle1, obstacle2;
var cars = [];
var fuelImage, powerCoinImage,lifeImage, obstacle1Img, obstacle2Img,blastImg;
//BP
function preload() {
  backgroundImage = loadImage("./assets/background.png");
  car1_img = loadImage("../assets/car1.png");
  car2_img = loadImage("../assets/car2.png");
  track = loadImage("../assets/track.jpg");
  fuelImage = loadImage("./assets/fuel.png");
  powerCoinImage = loadImage("./assets/goldCoin.png");
  lifeImage = loadImage("./assets/life.png")
  obstacle1Img = loadImage("./assets/obstacle1.png")
  obstacle2Img = loadImage("./assets/obstacle2.png")
  blastImg = loadImage("./assets/blast.png")
}

//BP
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  database = firebase.database();
  game = new Game();
  game.getState();
  game.start();
 
}

//BP
function draw() {
  background(backgroundImage);
  if (playerCount === 2) {
    game.update(1);
  }

  if (gameState === 1) {
    game.play();
   // game.showLeaderBoard();
  }

  if (gameState === 2) {
    game.showLeaderBoard(); 
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
