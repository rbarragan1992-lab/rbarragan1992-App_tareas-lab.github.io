const exprPreview = document.getElementById('exprPreview');
const resultEl = document.getElementById('result');
const panelTitle = document.getElementById('panelTitle');
const panelDesc = document.getElementById('panelDesc');

const massValue = document.getElementById('massValue');
const massFrom = document.getElementById('massFrom');
const massTo = document.getElementById('massTo');
const massResult = document.getElementById('massResult');

const unitCategory = document.getElementById('unitCategory');
const unitValue = document.getElementById('unitValue');
const unitFrom = document.getElementById('unitFrom');
const unitTo = document.getElementById('unitTo');
const unitResult = document.getElementById('unitResult');

const tempValue = document.getElementById('tempValue');
const tempFrom = document.getElementById('tempFrom');
const tempTo = document.getElementById('tempTo');
const tempResult = document.getElementById('tempResult');

const historyList = document.getElementById('historyList');
const favoritesList = document.getElementById('favoritesList');

const degBtn = document.getElementById('degBtn');
const radBtn = document.getElementById('radBtn');
const thousandsToggle = document.getElementById('thousandsToggle');

const saveFavBtn = document.getElementById('saveFavBtn');
const copyBtn = document.getElementById('copyBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const clearFavBtn = document.getElementById('clearFavBtn');
const massConvertBtn = document.getElementById('massConvertBtn');
const unitConvertBtn = document.getElementById('unitConvertBtn');
const tempConvertBtn = document.getElementById('tempConvertBtn');

const navButtons = document.querySelectorAll('.nav-btn');
const views = {
  scientific: document.getElementById('view-scientific'),
  mass: document.getElementById('view-mass'),
  units: document.getElementById('view-units'),
  temperature: document.getElementById('view-temperature'),
  history: document.getElementById('view-history'),
  favorites: document.getElementById('view-favorites'),
  settings: document.getElementById('view-settings'),
  help: document.getElementById('view-help')
};

let expr = '';
let currentMode = 'DEG';
let history = [];
let favorites = [];

const massUnits = {
  kg: { label: 'Kilogramo (kg)', factor: 1000 },
  g: { label: 'Gramo (g)', factor: 1 },
  mg: { label: 'Miligramo (mg)', factor: 0.001 },
  lb: { label: 'Libra (lb)', factor: 453.59237 },
  oz: { label: 'Onza (oz)', factor: 28.349523125 }
};

const unitCategories = {
  longitud: {
    label: 'Longitud',
    units: {
      m: { label: 'Metro (m)', factor: 1 },
      km: { label: 'Kilómetro (km)', factor: 1000 },
      cm: { label: 'Centímetro (cm)', factor: 0.01 },
      mm: { label: 'Milímetro (mm)', factor: 0.001 },
      mi: { label: 'Milla (mi)', factor: 1609.344 },
      ft: { label: 'Pie (ft)', factor: 0.3048 }
    }
  },
  masa: {
    label: 'Masa',
    units: {
      kg: { label: 'Kilogramo (kg)', factor: 1000 },
      g: { label: 'Gramo (g)', factor: 1 },
      mg: { label: 'Miligramo (mg)', factor: 0.001 },
      lb: { label: 'Libra (lb)', factor: 453.59237 },
      oz: { label: 'Onza (oz)', factor: 28.349523125 }
    }
  }
};

function formatNumber(n) {
  if (!Number.isFinite(n)) return 'Error';
  const useThousands = thousandsToggle.checked;
  const rounded = Math.abs(n) >= 1e10 || (Math.abs(n) > 0 && Math.abs(n) < 1e-7)
    ? n.toExponential(8)
    : Number.parseFloat(n.toFixed(8)).toString();
  if (!useThousands) return rounded;
  const [intPart, decPart] = rounded.split('.');
  const formattedInt = Number(intPart).toLocaleString('en-US');
  return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}

function setView(name) {
  Object.values(views).forEach(v => v.classList.remove('active'));
  views[name].classList.add('active');
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === name));

  const titles = {
    scientific: ['🧮 Calculadora Científica', 'Pantalla principal para operaciones matemáticas y científicas.'],
    mass: ['⚖️ Calculadora de Masa', 'Una sola pantalla para convertir entre unidades de masa.'],
    units: ['🔁 Convertidora de Unidades', 'Selecciona categoría, origen y destino.'],
    temperature: ['🌡️ Convertidora de Temperatura', 'Convierte entre Celsius, Fahrenheit y Kelvin.'],
    history: ['🕘 Historial', 'Revisa las últimas operaciones realizadas.'],
    favorites: ['⭐ Favoritos', 'Guarda y reutiliza tus resultados.'],
    settings: ['⚙️ Ajustes', 'Personaliza la experiencia de la calculadora.'],
    help: ['❓ Ayuda', 'Guía rápida de uso y navegación.']
  };
  panelTitle.textContent = titles[name][0];
  panelDesc.textContent = titles[name][1];
}

function updateDisplay() {
  exprPreview.textContent = expr || ' ';
  if (!expr) resultEl.textContent = '0';
}

function appendToken(token) {
  expr += token;
  updateDisplay();
}

function clearExpr() {
  expr = '';
  updateDisplay();
}

function backspace() {
  expr = expr.slice(0, -1);
  updateDisplay();
}

function toRad(x) {
  return currentMode === 'DEG' ? x * Math.PI / 180 : x;
}

function fromRad(x) {
  return currentMode === 'DEG' ? x * 180 / Math.PI : x;
}

function factorial(n) {
  n = Math.floor(Number(n));
  if (!Number.isFinite(n) || n < 0) throw new Error('Factorial inválido');
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function evaluateExpression(raw) {
  let prepared = raw
    .replaceAll('×', '*')
    .replaceAll('÷', '/')
    .replaceAll('π', 'pi')
    .replaceAll('^', '**');
  while (prepared.includes('!')) {
    prepared = prepared.replace(/(\d+(?:\.\d+)?)!/, 'fact($1)');
  }
  const scope = {
    pi: Math.PI,
    e: Math.E,
    sin: x => Math.sin(toRad(x)),
    cos: x => Math.cos(toRad(x)),
    tan: x => Math.tan(toRad(x)),
    asin: x => fromRad(Math.asin(x)),
    acos: x => fromRad(Math.acos(x)),
    atan: x => fromRad(Math.atan(x)),
    sqrt: x => Math.sqrt(x),
    log: x => Math.log10(x),
    ln: x => Math.log(x),
    abs: x => Math.abs(x),
    exp: x => Math.exp(x),
    fact: x => factorial(x)
  };
  const fn = new Function(...Object.keys(scope), `"use strict"; return (${prepared});`);
  return fn(...Object.values(scope));
}

function addHistory(text, value) {
  history.unshift({ text, value });
  history = history.slice(0, 8);
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  if (!history.length) {
    historyList.innerHTML = '<span class="empty">Aún no hay operaciones.</span>';
    return;
  }
  history.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `<div><strong>${item.value}</strong><br><small>${item.text}</small></div><button type="button">↺</button>`;
    row.querySelector('button').addEventListener('click', () => {
      expr = item.text.split('=')[0].trim();
      updateDisplay();
      setView('scientific');
    });
    historyList.appendChild(row);
  });
}

function saveFavorite() {
  if (!expr.trim() && resultEl.textContent === '0') return;
  favorites.unshift({ text: expr || resultEl.textContent, value: resultEl.textContent });
  favorites = favorites.slice(0, 8);
  renderFavorites();
}

function renderFavorites() {
  favoritesList.innerHTML = '';
  if (!favorites.length) {
    favoritesList.innerHTML = '<span class="empty">Sin favoritos guardados.</span>';
    return;
  }
  favorites.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `<div><strong>${item.value}</strong><br><small>${item.text}</small></div><button type="button">×</button>`;
    row.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'button') return;
      expr = item.text;
      updateDisplay();
      setView('scientific');
    });
    row.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      favorites.splice(index, 1);
      renderFavorites();
    });
    favoritesList.appendChild(row);
  });
}

function populateSelect(select, options, selectedValue) {
  select.innerHTML = '';
  Object.entries(options).forEach(([value, opt]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = opt.label;
    if (value === selectedValue) option.selected = true;
    select.appendChild(option);
  });
}

function convertMass() {
  const value = parseFloat(massValue.value);
  if (Number.isNaN(value)) return (massResult.textContent = 'Ingresa un valor');
  const result = (value * massUnits[massFrom.value].factor) / massUnits[massTo.value].factor;
  const formatted = formatNumber(result);
  massResult.textContent = `${formatted} ${massUnits[massTo.value].label}`;
  addHistory(`Masa: ${value} ${massUnits[massFrom.value].label} → ${formatted} ${massUnits[massTo.value].label}`, formatted);
}

function convertUnits() {
  const category = unitCategories[unitCategory.value];
  const value = parseFloat(unitValue.value);
  if (Number.isNaN(value)) return (unitResult.textContent = 'Ingresa un valor');
  const result = (value * category.units[unitFrom.value].factor) / category.units[unitTo.value].factor;
  const targetLabel = category.units[unitTo.value].label;
  const formatted = formatNumber(result);
  unitResult.textContent = `${formatted} ${targetLabel}`;
  addHistory(`Unidades: ${value} ${category.units[unitFrom.value].label} → ${formatted} ${targetLabel}`, formatted);
}

function convertTemperature(value, from, to) {
  let celsius;
  if (from === 'c') celsius = value;
  if (from === 'f') celsius = (value - 32) * 5 / 9;
  if (from === 'k') celsius = value - 273.15;
  if (to === 'c') return celsius;
  if (to === 'f') return (celsius * 9 / 5) + 32;
  if (to === 'k') return celsius + 273.15;
  return value;
}

function convertTemp() {
  const value = parseFloat(tempValue.value);
  if (Number.isNaN(value)) return (tempResult.textContent = 'Ingresa un valor');
  const result = convertTemperature(value, tempFrom.value, tempTo.value);
  const label = tempTo.options[tempTo.selectedIndex].textContent;
  const formatted = formatNumber(result);
  tempResult.textContent = `${formatted} ${label}`;
  addHistory(`Temperatura: ${value} ${tempFrom.options[tempFrom.selectedIndex].textContent} → ${formatted} ${label}`, formatted);
}

function evaluateAndSave() {
  if (!expr.trim()) return;
  try {
    const value = evaluateExpression(expr);
    const displayValue = formatNumber(value);
    resultEl.textContent = displayValue;
    addHistory(`${expr} = ${displayValue}`, displayValue);
    expr = String(value);
    updateDisplay();
  } catch {
    resultEl.textContent = 'Error';
  }
}

document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
document.querySelectorAll('[data-ins]').forEach(btn => btn.addEventListener('click', () => appendToken(btn.dataset.ins)));
document.querySelectorAll('[data-act="clear"]').forEach(btn => btn.addEventListener('click', clearExpr));
document.querySelectorAll('[data-act="back"]').forEach(btn => btn.addEventListener('click', backspace));
document.querySelectorAll('[data-act="eq"]').forEach(btn => btn.addEventListener('click', evaluateAndSave));

degBtn.addEventListener('click', () => {
  currentMode = 'DEG';
  degBtn.classList.add('active');
  radBtn.classList.remove('active');
});

radBtn.addEventListener('click', () => {
  currentMode = 'RAD';
  radBtn.classList.add('active');
  degBtn.classList.remove('active');
});

saveFavBtn.addEventListener('click', saveFavorite);
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(resultEl.textContent);
    copyBtn.textContent = 'Copiado';
    setTimeout(() => copyBtn.textContent = 'Copiar resultado', 1200);
  } catch {
    alert('No se pudo copiar.');
  }
});

clearHistoryBtn.addEventListener('click', () => { history = []; renderHistory(); });
clearFavBtn.addEventListener('click', () => { favorites = []; renderFavorites(); });
massConvertBtn.addEventListener('click', convertMass);
unitConvertBtn.addEventListener('click', convertUnits);
tempConvertBtn.addEventListener('click', convertTemp);

unitCategory.addEventListener('change', () => {
  const category = unitCategories[unitCategory.value];
  populateSelect(unitFrom, category.units, Object.keys(category.units)[0]);
  populateSelect(unitTo, category.units, Object.keys(category.units)[1] || Object.keys(category.units)[0]);
});

thousandsToggle.addEventListener('change', () => {
  if (!expr) updateDisplay();
});

document.addEventListener('keydown', (e) => {
  const allowed = '0123456789.+-*/()^';
  if (allowed.includes(e.key)) appendToken(e.key);
  else if (e.key === 'Enter') { e.preventDefault(); evaluateAndSave(); }
  else if (e.key === 'Backspace') backspace();
  else if (e.key === 'Escape') clearExpr();
});

populateSelect(massFrom, massUnits, 'kg');
populateSelect(massTo, massUnits, 'g');
populateSelect(unitCategory, unitCategories, 'longitud');
const firstCat = unitCategories[unitCategory.value];
populateSelect(unitFrom, firstCat.units, Object.keys(firstCat.units)[0]);
populateSelect(unitTo, firstCat.units, Object.keys(firstCat.units)[1] || Object.keys(firstCat.units)[0]);

updateDisplay();
renderHistory();
renderFavorites();
setView('scientific');



// DINO GAME
views.dino = document.getElementById('view-dino');

const canvas = document.getElementById('dinoCanvas');
const ctx = canvas.getContext('2d');
const startDinoBtn = document.getElementById('startDinoBtn');
const jumpDinoBtn = document.getElementById('jumpDinoBtn');
const pauseDinoBtn = document.getElementById('pauseDinoBtn');
const dinoScore = document.getElementById('dinoScore');
const dinoBest = document.getElementById('dinoBest');
const offlineNotice = document.getElementById('offlineNotice');
const dinoOverlay = document.getElementById('dinoOverlay');

let dinoGameStarted = false;
let dinoPaused = false;
let gameOver = false;
let score = 0;
let best = Number(localStorage.getItem('dinoBest') || 0);
let speed = 6;
let spawnTimer = 0;
let lastFrame = 0;

const groundY = 205;
const gravity = 0.7;

const dino = {
  x: 70,
  y: groundY - 54,
  w: 42,
  h: 54,
  vy: 0,
  jumping: false
};

let obstacles = [];
let clouds = [
  { x: 120, y: 48, w: 42, h: 14, v: 0.4 },
  { x: 410, y: 70, w: 56, h: 16, v: 0.28 },
  { x: 690, y: 42, w: 48, h: 14, v: 0.35 }
];

function setBest(value){
  best = Math.max(best, value);
  localStorage.setItem('dinoBest', String(best));
  dinoBest.textContent = best;
}

function resetDinoGame(){
  score = 0;
  speed = 6;
  spawnTimer = 0;
  gameOver = false;
  obstacles = [];
  dino.y = groundY - dino.h;
  dino.vy = 0;
  dino.jumping = false;
  dinoOverlay.classList.add('hidden');
  dinoScore.textContent = score;
}

function startDinoGame(){
  dinoGameStarted = true;
  dinoPaused = false;
  resetDinoGame();
  requestAnimationFrame(gameLoop);
}

function jump(){
  if (!dinoGameStarted || dinoPaused || gameOver) return;
  if (!dino.jumping) {
    dino.vy = -13;
    dino.jumping = true;
  }
}

function createCactus(){
  const height = 28 + Math.floor(Math.random() * 28);
  const width = 16 + Math.floor(Math.random() * 8);
  obstacles.push({
    x: canvas.width + 20,
    y: groundY - height,
    w: width,
    h: height,
    arms: Math.random() > 0.5 ? 1 : 2
  });
}

function drawSky(){
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#101827');
  grad.addColorStop(1, '#1c1c1c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // stars
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  for (let i = 0; i < 16; i++) {
    const x = (i * 57 + (score % 57)) % canvas.width;
    const y = 18 + (i % 4) * 14;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawClouds(){
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  clouds.forEach(c => {
    c.x -= c.v;
    if (c.x + c.w < 0) c.x = canvas.width + 40;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.w * 0.38, c.h * 0.7, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + c.w * 0.32, c.y - 4, c.w * 0.28, c.h * 0.55, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + c.w * 0.58, c.y, c.w * 0.34, c.h * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawGround(){
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  for (let i = 0; i < 24; i++) {
    const x = (i * 48 + (score * 2) % 48) % canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, groundY + 8);
    ctx.lineTo(x + 20, groundY + 8);
    ctx.stroke();
  }
}

function drawDino(){
  // pixel-art style dinosaur
  const x = dino.x;
  const y = dino.y;
  const s = 3.2;

  const px = (dx, dy, w, h, color = '#83ff49') => {
    ctx.fillStyle = color;
    ctx.fillRect(x + dx * s, y + dy * s, w * s, h * s);
  };

  // body
  px(8, 10, 9, 9);
  px(10, 5, 7, 5);
  px(13, 2, 4, 4);
  px(16, 5, 3, 4);
  // head
  px(15, 7, 8, 7);
  px(20, 9, 2, 1, '#0b1020');
  // tail
  px(3, 13, 6, 3);
  px(0, 15, 4, 2);
  // legs
  px(9, 19, 3, 5);
  px(15, 19, 3, 5);
  // feet
  px(8, 23, 5, 2);
  px(14, 23, 5, 2);
}

function drawCactus(ob){
  ctx.fillStyle = '#ff9d1a';
  const baseX = ob.x;
  const baseY = ob.y;
  ctx.fillRect(baseX, baseY, ob.w, ob.h);

  if (ob.arms === 1) {
    ctx.fillRect(baseX - 8, baseY + 10, 8, 6);
    ctx.fillRect(baseX + ob.w, baseY + 14, 8, 6);
  } else {
    ctx.fillRect(baseX - 8, baseY + 8, 8, 6);
    ctx.fillRect(baseX + ob.w, baseY + 10, 8, 6);
    ctx.fillRect(baseX + 2, baseY + 4, 6, 6);
  }
}

function updateObstacles(){
  if (spawnTimer <= 0) {
    createCactus();
    spawnTimer = 60 + Math.floor(Math.random() * 35);
  }
  spawnTimer--;

  obstacles.forEach(ob => {
    ob.x -= speed;
  });

  obstacles = obstacles.filter(ob => ob.x + ob.w > -20);
}

function collide(a, b){
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function updateDino(){
  dino.vy += gravity;
  dino.y += dino.vy;

  if (dino.y >= groundY - dino.h) {
    dino.y = groundY - dino.h;
    dino.vy = 0;
    dino.jumping = false;
  }
}

function drawGameOver(){
  ctx.fillStyle = 'rgba(6,10,20,.65)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 34px Arial';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = '16px Arial';
  ctx.fillText('Presiona Iniciar / Reiniciar o Enter para jugar otra vez', canvas.width / 2, canvas.height / 2 + 22);
}

function gameLoop(timestamp){
  if (!dinoGameStarted) return;

  if (dinoPaused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  if (!lastFrame) lastFrame = timestamp;
  const delta = timestamp - lastFrame;
  if (delta < 16) {
    requestAnimationFrame(gameLoop);
    return;
  }
  lastFrame = timestamp;

  drawSky();
  drawClouds();
  drawGround();

  if (!gameOver) {
    updateDino();
    updateObstacles();

    obstacles.forEach(ob => {
      drawCactus(ob);
      if (collide({x:dino.x, y:dino.y, w:dino.w, h:dino.h}, ob)) {
        gameOver = true;
        setBest(score);
        dinoOverlay.classList.remove('hidden');
        dinoOverlay.innerHTML = '<strong>GAME OVER</strong><span>Presiona reiniciar para volver a jugar</span>';
      }
    });

    if (!gameOver) {
      score++;
      dinoScore.textContent = score;
      if (score % 500 === 0) speed += 0.4;
      setBest(score);
    }
  }

  drawDino();

  if (gameOver) drawGameOver();

  requestAnimationFrame(gameLoop);
}

startDinoBtn.addEventListener('click', () => {
  if (!dinoGameStarted) {
    dinoGameStarted = true;
    startDinoBtn.textContent = '🔄 Reiniciar';
    dinoOverlay.classList.add('hidden');
    requestAnimationFrame(gameLoop);
    return;
  }
  startDinoGame();
});

jumpDinoBtn.addEventListener('click', jump);

pauseDinoBtn.addEventListener('click', () => {
  if (!dinoGameStarted) return;
  dinoPaused = !dinoPaused;
  pauseDinoBtn.textContent = dinoPaused ? '▶ Reanudar' : '⏸ Pausa';
  if (!dinoPaused) requestAnimationFrame(gameLoop);
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    jump();
  }
  if (e.code === 'Enter' && views.dino.classList.contains('active')) {
    startDinoGame();
  }
});

function checkConnection(){
  if(!navigator.onLine){
    offlineNotice.style.display = 'block';
    setView('dino');
  } else {
    offlineNotice.style.display = 'none';
  }
}

window.addEventListener('offline', checkConnection);
window.addEventListener('online', checkConnection);

setBest(best);
checkConnection();
