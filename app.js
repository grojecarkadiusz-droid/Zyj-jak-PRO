// -------------------- DATA --------------------
let xp = parseInt(localStorage.getItem("xp") || 0);
let level = parseInt(localStorage.getItem("level") || 1);
let streak = parseInt(localStorage.getItem("streak") || 0);
let lastDay = localStorage.getItem("lastDay");
let achievements = JSON.parse(localStorage.getItem("achievements") || "[]");

// -------------------- SAVE --------------------
function save() {
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
  localStorage.setItem("streak", streak);
  localStorage.setItem("lastDay", new Date().toDateString());
  localStorage.setItem("achievements", JSON.stringify(achievements));
}

// -------------------- UI --------------------
function updateUI() {
  document.getElementById("xp").textContent = xp;
  document.getElementById("level").textContent = level;
  document.getElementById("streak").textContent = streak;
  updateXPBar();
}

function updateXPBar() {
  const percent = (xp / (level * 100)) * 100;
  document.getElementById("xp-fill").style.width = percent + "%";
}

// -------------------- FLOATING XP --------------------
function floatXP(amount) {
  const el = document.getElementById("xp-float");
  el.textContent = `+${amount} XP`;
  el.style.display = "block";
  el.style.opacity = 1;
  el.style.transition = "1s";
  el.style.transform = "translate(-50%, -80%)";

  setTimeout(() => {
    el.style.opacity = 0;
    el.style.transform = "translate(-50%, -120%)";
  }, 50);

  setTimeout(() => {
    el.style.display = "none";
    el.style.transform = "translate(-50%, -50%)";
  }, 1000);
}

// -------------------- POPUP --------------------
function showPopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "block";
  setTimeout(() => popup.style.display = "none", 2000);
}

// -------------------- CONFETTI --------------------
function confettiBurst() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 3 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`
    });
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    requestAnimationFrame(update);
  }

  update();
  setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 2000);
}

// -------------------- ACHIEVEMENTS --------------------
function addAchievement(text) {
  achievements.push(text);
  save();
  renderAchievements();
}

function renderAchievements() {
  const list = document.getElementById("ach-list");
  list.innerHTML = "";
  achievements.forEach(a => {
    const li = document.createElement("li");
    li.textContent = a;
    list.appendChild(li);
  });
}

// -------------------- DAILY COMPLETE --------------------
document.getElementById("complete").addEventListener("click", () => {
  const xpGain = parseInt(document.getElementById("difficulty").value);
  xp += xpGain;
  floatXP(xpGain);

  if (xp >= level * 100) {
    xp = 0;
    level++;
    showPopup();
    confettiBurst();
    document.getElementById("level-sound").play();
    addAchievement(`Wbiłeś level ${level}!`);
  }

  const today = new Date().toDateString();
  if (lastDay !== today) {
    streak++;
  }

  save();
  updateUI();
});

// -------------------- WEEKLY AI --------------------
document.getElementById("generate-weekly").addEventListener("click", () => {
  const tasks = [
    "Zrób 20 pompek",
    "Przeczytaj 10 stron książki",
    "Zrób 15 minut spaceru",
    "Naucz się jednego nowego słowa",
    "Zrób 5 minut medytacji"
  ];
  const task = tasks[Math.floor(Math.random() * tasks.length)];
  document.getElementById("weekly-task").textContent = task;
});

// -------------------- MOOD TRACKER --------------------
document.querySelectorAll(".mood").forEach(btn => {
  btn.addEventListener("click", () => {
    const mood = btn.dataset.m;
    document.getElementById("mood-display").textContent = mood;
    addAchievement(`Zanotowałeś nastrój: ${mood}`);
  });
});

// -------------------- NAVIGATION --------------------
document.querySelectorAll(".nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;

    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(`screen-${target}`).classList.add("active");

    document.querySelectorAll(".nav button").forEach(b => b.classList.remove("active-tab"));
    btn.classList.add("active-tab");
  });
});

// Start on Daily
document.getElementById("screen-daily").classList.add("active");
document.querySelector('.nav button[data-target="daily"]').classList.add("active-tab");

updateUI();
renderAchievements();
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}
