
const GAME_W = 1000;
const GAME_H = 700;

const START_TIME = 5.0;
const MIN_TIME = 1.5;
const TIME_DECREASE_PER_POINT = 0.05;
const WRONG_PENALTY = 1.0;

const AD_MIN_INTERVAL = 9000;
const AD_MAX_INTERVAL = 15000;

// ------------------------------
// IMAGES
// ------------------------------

let playerFrames = [];
let computerFrames = [];
let phoneFrames = [];

let playerImg;
let computerImg;
let phoneImg;

let adImg;

// ------------------------------
// SOUNDS
// ------------------------------

let correctSounds = [];
let errorSound = null;

// ------------------------------
// GAME VARIABLES
// ------------------------------

let gameState = "title";

let currentLetter = "";
let score = 0;
let timeLeft = START_TIME;
let bestScore = 0;

let compiledCharacters = "";

let lastFrameTime = 0;

// ------------------------------
// ANIMATION
// ------------------------------

let lastAnimationTime = 0;
const ANIMATION_INTERVAL = 200;

// ------------------------------
// ADVERTISEMENT
// ------------------------------

let adOpen = false;
let nextAdAt = 0;
let adCloseRect = {};

// ------------------------------
// FEEDBACK
// ------------------------------

let feedback = "";
let feedbackUntil = 0;

// ------------------------------
// LAYOUT
// ------------------------------

let scaleFactor = 1;
let offsetX = 0;
let offsetY = 0;


// Calculate maximum time based on score
function getMaxTime() {
  return max(
    MIN_TIME,
    START_TIME - score * TIME_DECREASE_PER_POINT
  );
}


// ------------------------------
// SETUP
// ------------------------------

async function setup() {
  createCanvas(windowWidth, windowHeight);

  textFont("Comic Sans MS");
  textAlign(CENTER, CENTER);

  // Load player images
  for (let i = 0; i < 5; i++) {
    const filename = i === 0 ? "plr.png" : `plr${i}.png`;

    try {
      const img = await loadImage(`plr/${filename}`);
      playerFrames.push(img);
    } catch (error) {
      console.error("Could not load player image:", filename, error);
    }
  }

  // Load computer images
  for (let i = 0; i < 5; i++) {
    const filename = i === 0 ? "pasukon.png" : `pasukon${i}.png`;

    try {
      const img = await loadImage(`pasukon/${filename}`);
      computerFrames.push(img);
    } catch (error) {
      console.error("Could not load computer image:", filename, error);
    }
  }

  // Load phone images
  for (let i = 0; i < 5; i++) {
    const filename = i === 0 ? "phone.png" : `phone${i}.png`;

    try {
      const img = await loadImage(`phone/${filename}`);
      phoneFrames.push(img);
    } catch (error) {
      console.error("Could not load phone image:", filename, error);
    }
  }

  // Load advertisement image
  try {
    adImg = await loadImage("ad.png");
  } catch (error) {
    console.error("Could not load ad.png:", error);
  }

  // Load sounds without blocking the game setup
  loadGameSounds();

  selectRandomFrames();
  calculateLayout();

  lastFrameTime = millis();
}


// ------------------------------
// SOUND LOADING
// ------------------------------

function loadGameSounds() {
  if (typeof loadSound !== "function") {
    console.error(
      "p5.sound was not loaded. Check your index.html script tags."
    );
    return;
  }

  // Correct-answer sounds
  for (let i = 1; i <= 4; i++) {
    const sound = loadSound(
      `sounds/c${i}.wav`,
      () => {
        console.log(`Loaded sounds/c${i}.wav`);
      },
      (error) => {
        console.error(`Could not load sounds/c${i}.wav`, error);
      }
    );

    correctSounds.push(sound);
  }

  // Incorrect-answer sound
  errorSound = loadSound(
    "sounds/error.wav",
    () => {
      console.log("Loaded sounds/error.wav");
    },
    (error) => {
      console.error("Could not load sounds/error.wav", error);
    }
  );
}


// Play a random correct-answer sound
function playCorrectSound() {
  const availableSounds = correctSounds.filter(
    sound => sound && sound.isLoaded()
  );

  if (availableSounds.length === 0) {
    console.warn("No correct-answer sounds are loaded yet.");
    return;
  }

  const sound = random(availableSounds);

  sound.play();
}


// Play the incorrect-answer sound
function playErrorSound() {
  if (errorSound && errorSound.isLoaded()) {
    errorSound.play();
  } else {
    console.warn("The error sound is not loaded yet.");
  }
}


// ------------------------------
// LAYOUT
// ------------------------------

function calculateLayout() {
  scaleFactor = min(
    width / GAME_W,
    height / GAME_H
  );

  offsetX = (width - GAME_W * scaleFactor) / 2;
  offsetY = (height - GAME_H * scaleFactor) / 2;
}


// ------------------------------
// MAIN DRAW LOOP
// ------------------------------

function draw() {
  background(239, 241, 245);

  updateAnimations();

  push();

  translate(offsetX, offsetY);
  scale(scaleFactor);

  drawBackground();

  if (gameState === "title") {
    drawScene();
    drawTitleScreen();

  } else if (gameState === "playing") {
    updateGame();

    drawScene();
    drawHUD();

    if (adOpen) {
      drawAd();
    }

    drawFeedback();

  } else if (gameState === "gameover") {
    drawScene();
    drawHUD();
    drawGameOver();
  }

  pop();
}


// ------------------------------
// BACKGROUND
// ------------------------------

function drawBackground() {
  noStroke();
  fill(255);

  rect(0, 0, GAME_W, GAME_H);

  stroke(220);
  strokeWeight(2);

  line(0, 620, GAME_W, 620);

  noStroke();
}


// ------------------------------
// MAIN SCENE
// ------------------------------

function drawScene() {
  drawAsset(
    playerImg,
    335,
    275,
    175,
    220,
    "PLAYER"
  );

  drawAsset(
    computerImg,
    625,
    280,
    300,
    240,
    "COMPUTER"
  );

  drawCompiledCharacters();

  drawAsset(
    phoneImg,
    500,
    515,
    150,
    240,
    "PHONE"
  );

  if (!phoneImg) {
    drawPhoneFallback(500, 515);
  }

  if (gameState === "playing" && !adOpen) {
    drawLetterOnPhone();
  }
}


// ------------------------------
// DRAW ASSETS
// ------------------------------

function drawAsset(img, x, y, w, h, label) {
  if (img) {
    imageMode(CENTER);
    image(img, x, y, w, h);
  } else {
    rectMode(CENTER);

    stroke(190);
    strokeWeight(2);
    fill(248);

    rect(x, y, w * 0.75, h * 0.7, 12);

    noStroke();
    fill(110);

    textSize(16);
    text(label, x, y);

    rectMode(CORNER);
  }
}


// ------------------------------
// PHONE FALLBACK
// ------------------------------

function drawPhoneFallback(x, y) {
  rectMode(CENTER);

  stroke(35);
  strokeWeight(3);
  fill(250);

  rect(x, y, 138, 225, 20);

  noStroke();
  fill(225);

  rect(x, y, 112, 180, 8);

  fill(70);
  circle(x, y - 100, 5);

  rectMode(CORNER);
}


// ------------------------------
// COMPUTER TEXT
// ------------------------------

function drawCompiledCharacters() {
  drawingContext.save();

  // Computer screen clipping area
  drawingContext.beginPath();

  drawingContext.rect(
    550,
    205,
    170,
    125
  );

  drawingContext.clip();

  textFont("Comic Sans MS");
  textSize(17);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);

  fill(255);
  noStroke();

  // Keep the text centered
  text(
    compiledCharacters,
    635,
    265
  );

  drawingContext.restore();

  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
}


// ------------------------------
// PHONE LETTER
// ------------------------------

function drawLetterOnPhone() {
  noStroke();
  fill(255);

  textStyle(BOLD);
  textSize(58);

  text(
    currentLetter,
    500,
    515
  );

  textStyle(NORMAL);
}


// ------------------------------
// HUD
// ------------------------------

function drawHUD() {
  fill(40);

  textAlign(LEFT, CENTER);
  textSize(22);
  textStyle(BOLD);

  text(
    "SCORE  " + score,
    35,
    38
  );

  textStyle(NORMAL);
  textSize(15);
  fill(115);

  text(
    "BEST  " + max(bestScore, score),
    36,
    57.5
  );

  const barX = 35;
  const barY = 92;
  const barW = 300;
  const barH = 18;

  const ratio = constrain(
    timeLeft / getMaxTime(),
    0,
    1
  );

  textAlign(LEFT, CENTER);
  fill(60);
  textSize(14);

  text(
    "TIME REMAINING",
    barX,
    barY - 17
  );

  noStroke();
  fill(225);

  rect(
    barX,
    barY,
    barW,
    barH,
    9
  );

  if (timeLeft > 2) {
    fill(54, 170, 112);
  } else if (timeLeft > 1) {
    fill(240, 166, 55);
  } else {
    fill(225, 65, 65);
  }

  rect(
    barX,
    barY,
    barW * ratio,
    barH,
    9
  );

  fill(40);
  textAlign(LEFT, CENTER);
  textSize(18);

  text(
    timeLeft.toFixed(1) + "s",
    barX + barW + 14,
    barY + 9
  );

  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
}


// ------------------------------
// GAME UPDATE
// ------------------------------

function updateGame() {
  const now = millis();

  const delta = min(
    (now - lastFrameTime) / 1000,
    0.1
  );

  lastFrameTime = now;

  // Timer continues while an ad is open
  timeLeft -= delta;

  if (timeLeft <= 0) {
    timeLeft = 0;
    endGame();
    return;
  }

  if (!adOpen && now >= nextAdAt) {
    showAd();
  }
}


// ------------------------------
// START GAME
// ------------------------------

function startGame() {
  // Unlock browser audio after user interaction
  if (typeof userStartAudio === "function") {
    userStartAudio();
  }

  gameState = "playing";

  score = 0;
  timeLeft = getMaxTime();

  adOpen = false;
  feedback = "";

  compiledCharacters = "";

  lastFrameTime = millis();

  currentLetter = randomLetter();

  scheduleNextAd();
}


// ------------------------------
// RANDOM LETTER
// ------------------------------

function randomLetter() {
  return String.fromCharCode(
    65 + floor(random(26))
  );
}


// ------------------------------
// ADS
// ------------------------------

function scheduleNextAd() {
  nextAdAt = millis() + random(
    AD_MIN_INTERVAL,
    AD_MAX_INTERVAL
  );
}


function showAd() {
  adOpen = true;
}


function closeAd() {
  if (!adOpen) return;

  adOpen = false;

  scheduleNextAd();

  feedback = "BACK TO THE CHALLENGE!";
  feedbackUntil = millis() + 900;
}


// ------------------------------
// GAME OVER
// ------------------------------

function endGame() {
  gameState = "gameover";

  adOpen = false;

  bestScore = max(bestScore, score);
}


// ------------------------------
// KEYBOARD INPUT
// ------------------------------

function keyPressed(event) {
  // Use the actual keyboard event.
  // Fall back to p5's key variable if necessary.
  const pressedKey = event && event.key
    ? event.key
    : key;

  // Start or restart
  if (gameState === "title" || gameState === "gameover") {
    if (
      pressedKey === "Enter" ||
      pressedKey === " "
    ) {
      startGame();
      return false;
    }

    return;
  }

  // Ignore keyboard input if the game is not active
  if (gameState !== "playing" || adOpen) {
    return;
  }

  // Only accept A-Z
  if (
    typeof pressedKey !== "string" ||
    !/^[a-z]$/i.test(pressedKey)
  ) {
    return;
  }

  const answer = pressedKey.toUpperCase();

  // ----------------------------
  // CORRECT ANSWER
  // ----------------------------

  if (answer === currentLetter) {
    compiledCharacters += answer;

    score++;

    // Reset timer using the updated score
    timeLeft = getMaxTime();

    // Generate a new letter
    currentLetter = randomLetter();

    // Play a random correct sound
    playCorrectSound();

    feedback = "CORRECT!";
    feedbackUntil = millis() + 400;

  }

  // ----------------------------
  // INCORRECT ANSWER
  // ----------------------------

  else {
    timeLeft -= WRONG_PENALTY;

    playErrorSound();

    feedback = "-1 SECOND!";
    feedbackUntil = millis() + 650;

    if (timeLeft <= 0) {
      timeLeft = 0;
      endGame();
    }
  }

  // Prevent default browser keyboard behavior
  return false;
}


// ------------------------------
// MOUSE INPUT
// ------------------------------

function mousePressed() {
  const mx = (mouseX - offsetX) / scaleFactor;
  const my = (mouseY - offsetY) / scaleFactor;

  // Start or restart button
  if (gameState === "title" || gameState === "gameover") {
    if (
      insideRect(
        mx,
        my,
        365,
        430,
        270,
        65
      )
    ) {
      startGame();
    }

    return;
  }

  // Advertisement close button
  if (gameState === "playing" && adOpen) {
    if (
      insideRect(
        mx,
        my,
        adCloseRect.x,
        adCloseRect.y,
        adCloseRect.w,
        adCloseRect.h
      )
    ) {
      closeAd();
    }
  }
}


// ------------------------------
// RECTANGLE COLLISION
// ------------------------------

function insideRect(px, py, x, y, w, h) {
  return (
    px >= x &&
    px <= x + w &&
    py >= y &&
    py <= y + h
  );
}


// ------------------------------
// ADVERTISEMENT DISPLAY
// ------------------------------

function drawAd() {
  const x = 355;
  const y = 415;
  const w = 290;
  const h = 180;

  // Shadow
  noStroke();
  fill(0, 0, 0, 45);

  rect(
    x + 7,
    y + 7,
    w,
    h,
    14
  );

  if (adImg) {
    imageMode(CORNER);
    image(adImg, x, y, w, h);

  } else {
    fill(255, 252, 242);
    stroke(45);
    strokeWeight(2);

    rect(x, y, w, h, 14);

    noStroke();
    fill(245, 205, 85);

    rect(x, y, w, 35, 14);
    rect(x, y + 23, w, 12);

    fill(45);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(17);

    text(
      "TOTALLY REAL AD",
      x + w / 2,
      y + 18
    );

    textStyle(NORMAL);
    textSize(16);

    text(
      "CLICK TO CLAIM",
      x + w / 2,
      y + 78
    );

    textSize(12);
    fill(120);

    text(
      "This interruption costs you time!",
      x + w / 2,
      y + 105
    );
  }

  // Close button
  const bx = x + w - 36;
  const by = y + 7;
  const bw = 29;
  const bh = 27;

  noStroke();
  fill(220, 65, 65);

  rect(
    bx,
    by,
    bw,
    bh,
    6
  );

  fill(255);
  textStyle(BOLD);
  textSize(19);

  text(
    "X",
    bx + bw / 2,
    by + bh / 2
  );

  textStyle(NORMAL);

  adCloseRect = {
    x: bx,
    y: by,
    w: bw,
    h: bh
  };

  fill(40);
  textSize(13);

  text(
    "CLOSE THE AD TO REVEAL THE LETTER",
    500,
    610
  );
}


// ------------------------------
// ANIMATION FRAMES
// ------------------------------

function selectRandomFrames() {
  if (playerFrames.length > 0) {
    playerImg = random(playerFrames.slice(0, -1));
  }

  if (computerFrames.length > 0) {
    computerImg = random(computerFrames.slice(0, -1));
  }

  if (phoneFrames.length > 0) {
    phoneImg = random(phoneFrames.slice(0, -1));
  }
}


function updateAnimations() {
  if (
    millis() - lastAnimationTime >= ANIMATION_INTERVAL
  ) {
    selectRandomFrames();
    lastAnimationTime = millis();
  }
}


// ------------------------------
// FEEDBACK
// ------------------------------

function drawFeedback() {
  if (millis() > feedbackUntil || !feedback) {
    return;
  }

  textAlign(CENTER, CENTER);
  textSize(22);
  textStyle(BOLD);

  if (feedback === "CORRECT!") {
    fill(30, 155, 95);
  } else {
    fill(210, 65, 65);
  }

  text(feedback, 500, 150);

  textStyle(NORMAL);
}


// ------------------------------
// TITLE SCREEN
// ------------------------------

function drawTitleScreen() {
  fill(20, 25, 38, 215);
  noStroke();

  rect(
    0,
    0,
    GAME_W,
    GAME_H
  );

  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(48);

  text("MFA PANIC", 500, 190);

  textStyle(NORMAL);
  textSize(19);

  text(
    "Read the phone. Type the letter. Stay alive.",
    500,
    250
  );

  textSize(16);

  text(
    "Correct letter = timer reset",
    500,
    310
  );

  text(
    "Wrong letter = lose 1 second",
    500,
    340
  );

  text(
    "Ads block your letter. Close them quickly!",
    500,
    370
  );

  drawButton(
    365,
    430,
    270,
    65,
    "START GAME"
  );

  textSize(13);
  fill(215);

  text(
    "Use your keyboard to enter letters A-Z",
    500,
    525
  );

  textStyle(NORMAL);
}


// ------------------------------
// GAME OVER SCREEN
// ------------------------------

function drawGameOver() {
  fill(20, 25, 38, 225);
  noStroke();

  rect(
    0,
    0,
    GAME_W,
    GAME_H
  );

  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(48);

  text("TIME'S UP", 500, 235);

  textStyle(NORMAL);
  textSize(26);

  text(
    "Score: " + score,
    500,
    315
  );

  textSize(17);

  text(
    "Best this session: " + bestScore,
    500,
    355
  );

  drawButton(
    365,
    430,
    270,
    65,
    "PLAY AGAIN"
  );

  textSize(14);
  fill(215);

  text(
    "Press ENTER to restart",
    500,
    520
  );

  textStyle(NORMAL);
}


// ------------------------------
// BUTTONS
// ------------------------------

function drawButton(x, y, w, h, label) {
  noStroke();
  fill(40, 120, 230);

  rect(
    x,
    y,
    w,
    h,
    12
  );

  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(21);

  text(
    label,
    x + w / 2,
    y + h / 2
  );

  textStyle(NORMAL);
}


// ------------------------------
// WINDOW RESIZE
// ------------------------------

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );

  calculateLayout();
}
