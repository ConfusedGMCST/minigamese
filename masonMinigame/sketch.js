let money = 0;
let profitPerSec = 0;
let activePasswords = [];
let passwordHistory = new Set(); 

let maxPasswords = 3;
let baseProfitBoost = 0;
let strengthMultiplier = 1.0;

let costCap = 50;
let costFlat = 100;
let costMult = 200;

function setup() {
  noCanvas(); 
  frameRate(30);

  let pwdInput = select('#pwd-input');
  pwdInput.elt.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      addPassword(this.value);
      this.value = '';
    }
  });

  select('#upg-cap').mousePressed(() => buyUpgrade('cap'));
  select('#upg-flat').mousePressed(() => buyUpgrade('flat'));
  select('#upg-mult').mousePressed(() => buyUpgrade('mult'));
}

function draw() {
  money += profitPerSec / 30;
  updateUI();
}

function calculateStrength(pwd) {
  let score = pwd.length;
  
  if (/[a-z]/.test(pwd)) score += 2;
  if (/[A-Z]/.test(pwd)) score += 3;
  if (/[0-9]/.test(pwd)) score += 3;
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 4;

  let longestLetterString = pwd.match(/[a-zA-Z]+/g);
  if (longestLetterString) {
    let maxLen = Math.max(...longestLetterString.map(s => s.length));
    if (maxLen >= 5) score *= 0.3; 
    else if (maxLen === 4) score *= 0.6; 
  }
  
  return score;
}

function addPassword(pwd) {
  pwd = pwd.substring(0, 15); 
  if (pwd.length === 0) return;
  if (activePasswords.length >= maxPasswords) return;

  let isRepeated = passwordHistory.has(pwd);
  passwordHistory.add(pwd);

  let rawStrength = calculateStrength(pwd);
  
  let repeatPenalty = isRepeated ? (Math.random() * 0.4 + 0.1) : 1; 
  let finalValue = (rawStrength + baseProfitBoost) * strengthMultiplier * repeatPenalty;

  let newPwdObj = {
    text: pwd,
    val: finalValue,
    repeated: isRepeated
  };

  activePasswords.push(newPwdObj);
  recalculateTotalProfit();
  renderPasswordList();
}

function removePassword(index) {
  activePasswords.splice(index, 1);
  recalculateTotalProfit();
  renderPasswordList();
}

function recalculateTotalProfit() {
  profitPerSec = 0;
  for (let p of activePasswords) {
    profitPerSec += p.val;
  }
}

function buyUpgrade(type) {
  if (type === 'cap' && money >= costCap) {
    money -= costCap;
    maxPasswords += 1;
    costCap = Math.floor(costCap * 1.8);
  } else if (type === 'flat' && money >= costFlat) {
    money -= costFlat;
    baseProfitBoost += 2;
    costFlat = Math.floor(costFlat * 1.6);
  } else if (type === 'mult' && money >= costMult) {
    money -= costMult;
    strengthMultiplier += 0.5;
    costMult = Math.floor(costMult * 2.0);
  }
  
  for (let p of activePasswords) {
    let rawStr = calculateStrength(p.text);
    let penalty = p.repeated ? 0.3 : 1; 
    p.val = (rawStr + baseProfitBoost) * strengthMultiplier * penalty;
  }
  
  recalculateTotalProfit();
}

function renderPasswordList() {
  let listDiv = select('#pwd-list');
  listDiv.html(''); 

  activePasswords.forEach((p, index) => {
    let item = createDiv().addClass('pwd-item').parent(listDiv);
    
    let row = createDiv().addClass('pwd-row').parent(item);
    createSpan(p.text).addClass('pwd-text').parent(row);
    
    let delBtn = createButton('X').addClass('pwd-delete').parent(row);
    delBtn.mousePressed(() => removePassword(index));
    
    if (p.repeated) {
      createSpan('(Repeated!)').addClass('pwd-repeated').parent(item);
    }
  });
}

function updateUI() {
  select('#money').html(Math.floor(money));
  select('#profit-rate').html(profitPerSec.toFixed(1));
  select('#pwd-count').html(activePasswords.length);
  select('#pwd-max').html(maxPasswords);
  
  select('#cost-cap').html(costCap);
  select('#cost-flat').html(costFlat);
  select('#cost-mult').html(costMult);

  select('#upg-cap').elt.disabled = money < costCap;
  select('#upg-flat').elt.disabled = money < costFlat;
  select('#upg-mult').elt.disabled = money < costMult;
}