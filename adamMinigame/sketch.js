// Mini-Game #3: Scam or Not?
//
// HOW TO PLAY
//  - Read the email on the computer.
//  - SAFE email?  Press SPACE to continue.
//  - SCAM email?  Dial the report hotline on the phone (type the digits 1-9, or click the keypad).
//  - Hover over links on the computer to see where they REALLY go.
//  - If you catch a scam, click "Warn Friends & Family" to spread awareness.
//  - Emails get sneakier as the levels go up!
//  - Click the Fullscreen button (bottom-left) or press F to go fullscreen. Press ESC to exit.

// =====================================================
// EDIT ME: SCAM TIPS (shown on the info board)
// Add, remove or reword anything you like.
// The board spaces them out automatically, but around 6-7 tips fits best.
// =====================================================
const TIPS = [
  "Check links to make sure they are official and note being used for phishing",
  "Make sure the person emailing you is someone you know and that their email is official",
  "Don't give away info like credit cards or passwords.",
  "Watch for things trying to get you to rush like it saying urgent or emergancy",
  "If it is too good to be true... IT IS",
  "Report the scam to make sure no one else falls for it!!!!!"
];

const HOTLINE = "5551472"; // digits 1-9 only because the keypad has no 0
const LEVEL_NAMES = ["", "Easy", "Tricky", "Sneaky"];
const LEVEL_COLORS = ["#000", "#2e9e4f", "#e08a1e", "#cc3333"];

// level 1 = obvious, level 3 = very subtle
const emails = [
  // ---------- LEVEL 1 ----------
  {
    level: 1,
    from: "support@paypa1-security.com",
    subject: "URGENT: Your account will be closed!",
    body: "Dear customer, we detected strange activity. Verify within 24 hours or your account will be deleted forever!",
    link: { text: "Click here to verify", url: "http://paypa1-verify.xyz/login" },
    scam: true,
    why: "Misspelled sender (paypa1), fake urgency, and a link to a strange website."
  },
  {
    level: 1,
    from: "mom@gmail.com",
    subject: "Dinner on Sunday?",
    body: "Hi sweetie, are you coming over for dinner on Sunday? Grandma is making her lasagna. Let me know!",
    scam: false,
    why: "Someone you know, a normal message, and no links or requests for info."
  },
  {
    level: 1,
    from: "prizes@free-giftcards-now.net",
    subject: "You WON a $1000 gift card!!!",
    body: "Congratulations lucky winner! Reply with your full name, address and credit card number to claim your prize today!",
    scam: true,
    why: "You can't win a contest you never entered, and nobody needs your credit card to give you a prize."
  },
  {
    level: 1,
    from: "noreply@school.edu",
    subject: "Picture day reminder",
    body: "Reminder: picture day is this Friday. No action is needed. Forms were handed out in class last week.",
    scam: false,
    why: "Real school address, and it doesn't ask you for anything."
  },

  // ---------- LEVEL 2 ----------
  {
    level: 2,
    from: "billing@netflix-support.co",
    subject: "Payment problem with your account",
    body: "We couldn't process your last payment. Please update your card details to keep watching.",
    link: { text: "Update payment method", url: "http://netflix-billing-update.co/card" },
    scam: true,
    why: "Netflix doesn't email from this address, and the link goes to an unofficial site that wants your card details."
  },
  {
    level: 2,
    from: "shipment-tracking@amazon.com",
    subject: "Your order has shipped",
    body: "Your package is on its way and should arrive Thursday. Track it any time in your Amazon account.",
    link: { text: "View your orders", url: "https://www.amazon.com/orders" },
    scam: false,
    why: "Real Amazon address, and the link really does go to amazon.com."
  },
  {
    level: 2,
    from: "ms.carter@school-edu.org",
    subject: "Confirm your login for the class portal",
    body: "Hi! I'm moving everyone to a new class portal. Please reply with your username and password so I can add you.",
    scam: true,
    why: "Look closely: school-edu.org is not school.edu. And nobody legit asks for your password."
  },

  // ---------- LEVEL 3 ----------
  {
    level: 3,
    from: "tracking@ups.com",
    subject: "Delivery attempt failed",
    body: "We couldn't deliver your package today. Confirm your address and pay a $1.99 redelivery fee to reschedule.",
    link: { text: "Reschedule delivery", url: "https://ups.com.package-redirect.net/track" },
    scam: true,
    why: "The sender looks real, but the link's true domain is package-redirect.net. Always hover before you click!"
  },
  {
    level: 3,
    from: "alerts@chase.com",
    subject: "New sign-in to your account",
    body: "We noticed a sign-in from a new device. If this was you, no action is needed. If not, call the number on the back of your card.",
    scam: false,
    why: "It sounds scary, but it has no link, asks for no info, and tells you to use the number on your own card."
  },
  {
    level: 3,
    from: "jake.m@gmail.com",
    subject: "lol is this you??",
    body: "omg found this pic of you from last weekend, you look so funny",
    link: { text: "photos from last weekend", url: "http://photo-share-gallery.link/jake" },
    scam: true,
    why: "Even a friend's account can be hacked. A vague message with a surprise link is a red flag. Ask them another way."
  },
  {
    level: 3,
    from: "teacher@school.edu",
    subject: "Homework help",
    body: "Here are the notes from today's class. They're in your folder on the school site. See you tomorrow!",
    scam: false,
    why: "Expected sender, real address, and nothing is being asked of you."
  }
];

// ---------- game state ----------
let order = [];
let idx = 0;
let score = 0;
let warnings = 0;
let answered = false;
let lastCorrect = false;
let lastWasScam = false;
let lastGuessScam = false;
let warned = false;
let finished = false;
let dialed = "";
let wrongNumberUntil = 0;
let answerTime = 0;
let bannerUntil = 0;
let pressedKey = -1;
let pressedUntil = 0;
let tooltipUrl = null;
let cnv;
let mx = 0; // mouse position in game coordinates (works at any canvas scale)
let my = 0;
let lastScaleKey = "";

// ---------- layout ----------
// Hand-drawn art (loaded in setup). Each asset is positioned/scaled on the 1200x680 game canvas.
let imgs = {};
let assetsReady = false;
const GAME_W = 1200;
const GAME_H = 680;
const SCREEN_CYAN = [0, 224, 255]; // colour of the phone/computer screens in the art

const COMP = { x: 232, y: 64, s: 0.75, w: 771, h: 559 };          // computer art (771x559 px)
const PHONE = { x: 12, y: 150, s: 0.585, w: 358, h: 635 };        // phone art (358x635 px)
const BOARD = { x: 828, y: 92, sx: 0.76, sy: 1.1, w: 481, h: 469 }; // bulletin board art (481x469 px)

// Key centres measured on the phone art (in art pixels, relative to the image's top-left)
const KEY_ART = [
  [109, 246], [186, 237], [270, 243],
  [114, 331], [193, 342], [267, 357],
  [116, 416], [196, 421], [263, 428]
];
const KEY_R = 18; // click radius (game pixels)

const screenR = { x: 266, y: 88, w: 514, h: 272 };               // cyan screen area of the computer
// SAFE / CONTINUE / WARN buttons use your drawings. Change BTN_H to make them bigger or smaller
// (width follows automatically), and BTN_Y to move them up or down.
const BTN_H = 50;
const BTN_Y = 364;
const mainBtn = { x: 276, y: BTN_Y, w: 90, h: BTN_H };   // SAFE, then CONTINUE after answering
const warnBtn = { x: 520, y: BTN_Y, w: 90, h: BTN_H };   // WARN (after catching a scam)
const clearBtn = { x: 79, y: 468, w: 80, h: 26, label: "Clear" };
const infoR = { x: 878, y: 196, w: 270, h: 340 };                // text area on the tan part of the board
// Fullscreen button uses your drawn PNG. Height is worked out from the image's shape in setup().
const fsBtn = { x: 20, y: 600, w: 150, h: 67 };
const playBtn = { x: 510, y: 410, w: 180, h: 50, label: "Play Again" };

let pseudoFS = false; // fallback "fullscreen" (fills the browser window) if the real Fullscreen API is blocked

async function setup() {
  cnv = createCanvas(GAME_W, GAME_H);
  cnv.parent("game-wrap");
  pixelDensity(max(2, window.devicePixelRatio || 1)); // crisp when scaled up in fullscreen
  textFont("Arial");

  // Pointer input (coordinates are converted to game space, so it works at any scale / fullscreen)
  const el = cnv.elt;
  el.addEventListener("pointermove", setMouse);
  el.addEventListener("pointerdown", (e) => {
    setMouse(e);
    if (inRect(mx, my, fsBtn)) return; // fullscreen is handled on "click" (browsers require it there)
    handleClick();
  });
  el.addEventListener("click", (e) => {
    setMouse(e);
    if (inRect(mx, my, fsBtn)) toggleFullscreen();
  });
  document.addEventListener("fullscreenchange", () => { lastScaleKey = ""; });
  document.addEventListener("webkitfullscreenchange", () => { lastScaleKey = ""; });
  window.addEventListener("resize", () => { lastScaleKey = ""; });

  imgs.computer = await loadImage("computer.png");
  imgs.phone = await loadImage("phone.png");
  imgs.board = await loadImage("board.png");
  imgs.fullscreen = await loadImage("fullscreen.png"); // your hand-drawn Fullscreen button

  // keep the drawing's proportions and sit it at the bottom-left
  fsBtn.h = fsBtn.w * imgs.fullscreen.height / imgs.fullscreen.width;
  fsBtn.y = GAME_H - fsBtn.h - 10;

  imgs.safe = await loadImage("safe.png");
  imgs.continue = await loadImage("continue.png");
  imgs.warn = await loadImage("warn.png");
  imgs.infos = await loadImage("infos.png");
  warnBtn.w = BTN_H * imgs.warn.width / imgs.warn.height;

  assetsReady = true;
  startGame();
}

function startGame() {
  // sort by level, shuffle inside each level so it gets harder as you go
  order = [];
  for (let lvl = 1; lvl <= 3; lvl++) {
    const ids = [];
    for (let i = 0; i < emails.length; i++) if (emails[i].level === lvl) ids.push(i);
    order = order.concat(shuffle(ids));
  }
  idx = 0;
  score = 0;
  warnings = 0;
  answered = false;
  warned = false;
  finished = false;
  dialed = "";
  bannerUntil = millis() + 2500;
}

function currentEmail() {
  return emails[order[idx]];
}

function draw() {
  if (!assetsReady) return;
  background(245);
  tooltipUrl = null;
  drawHeader();
  drawComputer();
  drawPhone();
  drawInfo();
  drawTooltip();
  drawLevelBanner();
  if (finished) drawEndScreen();
  drawFullscreenButton();
  applyScale();
}

// =====================================================
// DRAWING
// =====================================================
function drawHeader() {
  noStroke();
  fill(20);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  textSize(32);
  text("Scam or Not?", 40, 20);
  textSize(14);
  fill(100);
  text("Mini-Game #3", 42, 62);

  // level
  const lvl = finished ? 3 : currentEmail().level;
  textAlign(CENTER, TOP);
  textSize(22);
  textStyle(BOLD);
  fill(LEVEL_COLORS[lvl]);
  text("Level " + lvl + ": " + LEVEL_NAMES[lvl], 530, 22);
  textStyle(NORMAL);

  // score
  textAlign(RIGHT, TOP);
  fill(20);
  textSize(22);
  text("Score: " + score + " / " + emails.length, width - 40, 20);
  textSize(14);
  fill(90);
  text("Email " + min(idx + 1, emails.length) + " of " + emails.length, width - 40, 52);
  text("Friends warned: " + warnings, width - 40, 72);
}

function drawComputer() {
  // little stand + base under the drawn monitor
  noStroke();
  fill(0);
  rect(COMP.x + 348 * COMP.s, COMP.y + 540 * COMP.s, 92 * COMP.s, 60);
  rect(COMP.x + 394 * COMP.s - 75, COMP.y + 540 * COMP.s + 54, 150, 12, 5);

  image(imgs.computer, COMP.x, COMP.y, COMP.w * COMP.s, COMP.h * COMP.s);
  const cx = COMP.x + COMP.w * COMP.s / 2;

  if (!finished) {
    const e = currentEmail();
    const sx = screenR.x + 15;

    fill(0, 40, 100);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(22);
    text("Email", sx, screenR.y + 12);

    fill(0, 30, 70);
    textSize(14);
    textStyle(NORMAL);
    text("From: " + e.from, sx, screenR.y + 48, screenR.w - 30, 22);
    textStyle(BOLD);
    text("Subject: " + e.subject, sx, screenR.y + 72, screenR.w - 30, 22);
    textStyle(NORMAL);
    textSize(15);
    text(e.body, sx, screenR.y + 100, screenR.w - 30, 62);

    if (e.link) {
      textSize(14);
      const lw = textWidth(e.link.text);
      const ly = screenR.y + 166;
      const over = mx > sx && mx < sx + lw && my > ly - 2 && my < ly + 18;
      fill(over ? color(0, 0, 255) : color(20, 40, 170));
      text(e.link.text, sx, ly);
      stroke(over ? color(0, 0, 255) : color(20, 40, 170));
      strokeWeight(1);
      line(sx, ly + 17, sx + lw, ly + 17);
      noStroke();
      if (over) tooltipUrl = e.link.url;
    }

    if (answered) {
      let head;
      if (lastCorrect && lastWasScam) head = "Correct! Scam reported.";
      else if (lastCorrect) head = "Correct! This email is safe.";
      else if (lastWasScam) head = "Oops! That was a scam and you let it through.";
      else head = "Oops! That email was actually safe.";
      fill(lastCorrect ? color(0, 100, 35) : color(170, 20, 20));
      textStyle(BOLD);
      textSize(15);
      text(head, sx, screenR.y + 196, screenR.w - 30, 22);
      textStyle(NORMAL);
      textSize(13);
      fill(0, 30, 70);
      text(e.why, sx, screenR.y + 216, screenR.w - 30, 44);
    }

    // main button: SAFE -> CONTINUE
    const mainImg = answered ? imgs.continue : imgs.safe;
    mainBtn.w = BTN_H * mainImg.width / mainImg.height;
    drawImgButton(mainImg, mainBtn, true);

    // WARN button after a correct report (greyed out once you've warned people)
    if (answered && lastCorrect && lastWasScam) {
      drawImgButton(imgs.warn, warnBtn, !warned);
    }

    // hint on the bezel
    fill(255);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(14);
    if (!answered) {
      text("Safe? Press SPACE.   Scam? Dial the report hotline on the phone!", cx, 424);
    } else {
      text("Press SPACE to go to the next email", cx, 424);
    }
  }
}

function drawButton(b, label, enabled, c) {
  const hover = enabled && inRect(mx, my, b);
  stroke(0);
  strokeWeight(2);
  fill(enabled ? (hover ? lerpColor(c, color(255), 0.3) : c) : color(130));
  rect(b.x, b.y, b.w, b.h, 8);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  textStyle(BOLD);
  text(label, b.x + b.w / 2, b.y + b.h / 2);
  textStyle(NORMAL);
}

function keyPos(i) {
  return { x: PHONE.x + KEY_ART[i][0] * PHONE.s, y: PHONE.y + KEY_ART[i][1] * PHONE.s };
}

function drawPhone() {
  image(imgs.phone, PHONE.x, PHONE.y, PHONE.w * PHONE.s, PHONE.h * PHONE.s);

  // dialed digits sit on the two lines drawn at the bottom of the phone screen (___-____)
  const lx = PHONE.x + 127 * PHONE.s;  // centre of left line
  const rx = PHONE.x + 251 * PHONE.s;  // centre of right line
  const by = PHONE.y + 512 * PHONE.s;  // just above the lines
  noStroke();
  textStyle(BOLD);
  if (millis() < wrongNumberUntil) {
    // cover the drawn lines, then show the message
    fill(SCREEN_CYAN[0], SCREEN_CYAN[1], SCREEN_CYAN[2]);
    rect(PHONE.x + 84 * PHONE.s, PHONE.y + 476 * PHONE.s, 222 * PHONE.s, 52 * PHONE.s);
    fill(190, 30, 30);
    textAlign(CENTER, CENTER);
    textSize(12);
    text("Wrong number!", PHONE.x + 195 * PHONE.s, PHONE.y + 502 * PHONE.s);
  } else if (dialed.length > 0) {
    fill(20);
    textAlign(CENTER, BOTTOM);
    textSize(18);
    text(dialed.slice(0, 3), lx, by);
    if (dialed.length > 3) text(dialed.slice(3), rx, by);
  }
  textStyle(NORMAL);

  // key press highlight
  for (let i = 0; i < 9; i++) {
    if (pressedKey === i + 1 && millis() < pressedUntil) {
      const k = keyPos(i);
      noStroke();
      fill(255, 220, 0, 170);
      circle(k.x, k.y, KEY_R * 2);
    }
  }

  drawButton(clearBtn, "Clear", true, color(150));
}

function drawInfo() {
  image(imgs.board, BOARD.x, BOARD.y, BOARD.w * BOARD.sx, BOARD.h * BOARD.sy);

  noStroke();
  fill(20);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(16);
  text("How to spot a scam:", infoR.x, infoR.y);
  textStyle(NORMAL);
  textSize(13);

  // spread the tips evenly down the board (shrinks the gap if you add lots of tips)
  const startY = infoR.y + 27;
  const availH = 217;
  const step = min(38, availH / max(1, TIPS.length));
  for (let i = 0; i < TIPS.length; i++) {
    fill(20);
    text((i + 1) + ".  " + TIPS[i], infoR.x, startY + i * step, infoR.w, step - 2);
  }

  // hotline box (your drawn "infos" PNG, stretched to fit, with the text on top)
  const bx = infoR.x;
  const byy = 444;
  const bh = 90;
  image(imgs.infos, bx, byy, infoR.w, bh);
  noStroke();
  fill(20);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(13);
  text("REPORT A SCAM HOTLINE", bx + infoR.w / 2, byy + 18);
  textSize(24);
  text("555-1472", bx + infoR.w / 2, byy + 34);
  textStyle(NORMAL);
  textSize(11);
  text("Dial it on the phone. Safe emails: SPACE.", bx + infoR.w / 2, byy + 66);
}

function drawImgButton(img, b, enabled) {
  const hover = enabled && inRect(mx, my, b);
  const grow = hover ? 4 : 0;
  push();
  if (enabled) tint(255); else tint(150);
  image(img, b.x - grow / 2, b.y - grow / 2, b.w + grow, b.h + grow);
  pop();
}

function drawFullscreenButton() {
  // your hand-drawn PNG; lights up a touch when you hover over it
  const hover = inRect(mx, my, fsBtn);
  push();
  if (hover) tint(255, 255, 255, 255);
  else tint(255, 255, 255, 225);
  const grow = hover ? 4 : 0;
  image(imgs.fullscreen, fsBtn.x - grow / 2, fsBtn.y - grow / 2, fsBtn.w + grow, fsBtn.h + grow);
  pop();
}

// ---------- fullscreen helpers ----------
function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement) || pseudoFS;
}

function setPseudoFS(on) {
  pseudoFS = on;
  document.getElementById("game-wrap").classList.toggle("pseudo-fs", on);
  lastScaleKey = "";
}

function toggleFullscreen() {
  const wrap = document.getElementById("game-wrap");
  if (isFullscreen()) {
    if (pseudoFS) setPseudoFS(false);
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if ((document.fullscreenElement || document.webkitFullscreenElement) && exit) {
      try { const p = exit.call(document); if (p && p.catch) p.catch(() => {}); } catch (err) {}
    }
    return;
  }
  const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
  if (!req) { setPseudoFS(true); return; }
  try {
    const p = req.call(wrap);
    if (p && p.catch) p.catch(() => setPseudoFS(true)); // blocked (e.g. inside an iframe): fill the window instead
  } catch (err) {
    setPseudoFS(true);
  }
}

// Scales the canvas to fit the screen while fullscreen (letterboxed, mouse input is converted in setMouse)
function applyScale() {
  const wrap = document.getElementById("game-wrap");
  const fs = isFullscreen();
  const sc = fs ? Math.min(wrap.clientWidth / GAME_W, wrap.clientHeight / GAME_H) : 1;
  const k = fs + "|" + sc.toFixed(3) + "|" + wrap.clientWidth + "x" + wrap.clientHeight;
  if (k === lastScaleKey) return;
  lastScaleKey = k;
  cnv.elt.style.width = GAME_W * sc + "px";
  cnv.elt.style.height = GAME_H * sc + "px";
}

function windowResized() {
  lastScaleKey = "";
}

function drawTooltip() {
  if (!tooltipUrl) return;
  textSize(13);
  textStyle(NORMAL);
  const label = "Goes to: " + tooltipUrl;
  const w = textWidth(label) + 16;
  const x = constrain(mx + 12, 5, width - w - 5);
  const y = my + 16;
  stroke(0);
  strokeWeight(1);
  fill(255, 255, 210);
  rect(x, y, w, 26, 4);
  noStroke();
  fill(20);
  textAlign(LEFT, CENTER);
  text(label, x + 8, y + 13);
}

function drawLevelBanner() {
  if (finished || millis() > bannerUntil) return;
  const lvl = currentEmail().level;
  const msgs = [
    "",
    "Start with the obvious ones.",
    "Scams are getting harder to spot!",
    "Sneaky scams. Check EVERYTHING."
  ];
  noStroke();
  fill(0, 200);
  rect(screenR.x, screenR.y + 70, screenR.w, 110, 6);
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(30);
  text("Level " + lvl + ": " + LEVEL_NAMES[lvl], screenR.x + screenR.w / 2, screenR.y + 105);
  textStyle(NORMAL);
  textSize(16);
  text(msgs[lvl], screenR.x + screenR.w / 2, screenR.y + 145);
}

function drawEndScreen() {
  noStroke();
  fill(0, 200);
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(44);
  text("Mini-Game Complete!", width / 2, 210);
  textSize(28);
  text("You got " + score + " out of " + emails.length + " right", width / 2, 275);
  textSize(20);
  text("Friends & family warned: " + warnings, width / 2, 315);
  const msg = score === emails.length ? "Perfect! You're a scam-spotting pro!" :
              score >= emails.length * 0.7 ? "Nice work! Review the info board to get even better." :
              "Keep practicing. Check the info board for tips!";
  text(msg, width / 2, 355);
  drawButton(playBtn, "Play Again", true, color(70, 130, 220));
}

// =====================================================
// GAME LOGIC
// =====================================================
function answer(guessScam) {
  if (answered || finished) return;
  const e = currentEmail();
  lastWasScam = e.scam;
  lastGuessScam = guessScam;
  lastCorrect = e.scam === guessScam;
  if (lastCorrect) score++;
  answered = true;
  answerTime = millis();
  dialed = "";
}

function nextEmail() {
  if (!answered || finished) return;
  if (millis() - answerTime < 250) return; // avoid accidental double presses
  const prevLevel = currentEmail().level;
  idx++;
  answered = false;
  warned = false;
  dialed = "";
  if (idx >= emails.length) {
    finished = true;
    answerTime = millis();
  } else if (currentEmail().level !== prevLevel) {
    bannerUntil = millis() + 2500;
  }
}

function warnFriends() {
  if (!answered || warned || finished) return;
  if (!(lastCorrect && lastWasScam)) return;
  warned = true;
  warnings++;
}

function pressDigit(n) {
  pressedKey = n;
  pressedUntil = millis() + 200;
  if (answered || finished) return;
  if (millis() < wrongNumberUntil) return;
  dialed += n;
  if (dialed.length === HOTLINE.length) {
    if (dialed === HOTLINE) {
      answer(true); // reported as scam
    } else {
      dialed = "";
      wrongNumberUntil = millis() + 1200;
    }
  }
}

function pressSpace() {
  if (finished) {
    if (millis() - answerTime > 600) startGame();
  } else if (!answered) {
    answer(false); // safe
  } else {
    nextEmail();
  }
}

// =====================================================
// INPUT
// =====================================================
function handleClick() {
  if (finished) {
    if (inRect(mx, my, playBtn)) startGame();
    return;
  }
  if (inRect(mx, my, mainBtn)) {
    pressSpace();
    return;
  }
  if (answered && lastCorrect && lastWasScam && inRect(mx, my, warnBtn)) {
    warnFriends();
    return;
  }
  if (inRect(mx, my, clearBtn)) {
    dialed = "";
    return;
  }
  for (let i = 0; i < 9; i++) {
    const k = keyPos(i);
    if (dist(mx, my, k.x, k.y) < 19) pressDigit(i + 1);
  }
}

function keyPressed() {
  if (key === "f" || key === "F") {
    toggleFullscreen();
    return false;
  }
  if (keyCode === ESCAPE && pseudoFS) {
    setPseudoFS(false);
    return false;
  }
  if (key >= "1" && key <= "9") pressDigit(int(key));
  if (key === " " || keyCode === ENTER) {
    pressSpace();
    return false; // stop the page from scrolling
  }
  if (keyCode === BACKSPACE) {
    dialed = dialed.slice(0, -1);
    return false;
  }
}

// Converts the real mouse position into game coordinates, even when the canvas is scaled in fullscreen
function setMouse(e) {
  const r = cnv.elt.getBoundingClientRect();
  mx = (e.clientX - r.left) * (GAME_W / r.width);
  my = (e.clientY - r.top) * (GAME_H / r.height);
}

function inRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}
