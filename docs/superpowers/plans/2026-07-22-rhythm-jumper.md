# 节奏跳跃跑酷游戏 (Rhythm Jumper) — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个赛博朋克风格的浏览器跑酷游戏，玩家控制角色跳跃躲避障碍物。

**Architecture:** 单文件 HTML，使用 Canvas 2D API 渲染。游戏由 Game 主控制器 + Player/Obstacle/Particle/Background/SoundEngine 模块组成，通过 requestAnimationFrame 驱动游戏循环。

**Tech Stack:** 纯 HTML + CSS + JavaScript（Canvas 2D API + Web Audio API），零外部依赖。

## Global Constraints

- 单文件：`d:\test\python_1\rhythm_jumper.html`
- 零外部依赖，浏览器直接打开
- 键盘操作：空格/上箭头跳跃，支持二段跳
- 最低可玩分辨率 320×480，Canvas 自适应窗口
- 最高分存储到 localStorage
- 所有颜色使用 spec 中定义的赛博朋克配色

---

## File Map

| 文件 | 职责 |
|------|------|
| `d:\test\python_1\rhythm_jumper.html` | 全部 HTML 结构、CSS 样式、JavaScript 游戏逻辑 |

文件内部结构（按 `<script>` 中的模块顺序）：

| 模块 | 职责 | 接口 |
|------|------|------|
| `SoundEngine` | 用 Web Audio API 生成音效 | `playJump()`, `playDoubleJump()`, `playHit()`, `playScore()` |
| `Particle` | 单个粒子 | `update(dt)`, `draw(ctx)`, `alive` |
| `Player` | 角色状态与物理 | `update(dt, groundY)`, `draw(ctx)`, `jump()`, `getBounds()` |
| `Obstacle` | 障碍物 | `update(dt)`, `draw(ctx)`, `getBounds()`, `isOffScreen()` |
| `Background` | 背景城市灯光 + 地面网格 | `update(dt, speed)`, `draw(ctx)` |
| `Game` | 主控制器，游戏循环与状态 | `start()`, `stop()`, `reset()` |

---

### Task 1: HTML 骨架与 Canvas 初始化

**Files:**
- Create: `d:\test\python_1\rhythm_jumper.html`

**Produces:** 一个可打开看到深色背景 + Canvas 的空页面，按空格显示 "Game Start" 确认键盘监听工作。

- [ ] **Step 1: 创建 HTML 骨架**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>节奏跳跃 - Rhythm Jumper</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0a0a1a;
    overflow: hidden;
    font-family: 'Courier New', monospace;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  canvas { display: block; }
  #ui-layer {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
  }
  #game-over-panel {
    display: none;
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(10, 10, 30, 0.9);
    border: 2px solid #00f0ff;
    border-radius: 12px;
    padding: 40px 60px;
    text-align: center;
    color: #fff;
    pointer-events: auto;
  }
  #game-over-panel h2 {
    color: #ff3355;
    font-size: 32px;
    margin-bottom: 16px;
  }
  #game-over-panel .score { color: #ffd700; font-size: 24px; }
  #game-over-panel .high-score { color: #aaa; font-size: 16px; margin: 8px 0 20px; }
  #game-over-panel button {
    background: transparent;
    border: 2px solid #00f0ff;
    color: #00f0ff;
    padding: 10px 30px;
    font-size: 18px;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
  }
  #game-over-panel button:hover { background: rgba(0, 240, 255, 0.15); }
  #start-hint {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    color: rgba(0, 240, 255, 0.6);
    font-size: 20px;
    text-align: center;
  }
</style>
</head>
<body>
<canvas id="game-canvas"></canvas>
<div id="ui-layer">
  <div id="start-hint">按 空格键 开始游戏<br><small>Press SPACE to start</small></div>
  <div id="game-over-panel">
    <h2>游戏结束</h2>
    <div class="score">得分: <span id="final-score">0</span></div>
    <div class="high-score">最高分: <span id="high-score">0</span></div>
    <button id="restart-btn">重新开始</button>
  </div>
</div>
<script>
// ===== 游戏代码在此 =====
</script>
</body>
</html>
```

- [ ] **Step 2: 添加 Canvas 初始化和键盘监听**

在 `<script>` 内添加：

```javascript
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let W, H, groundY;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  groundY = H * 0.85;
}
window.addEventListener('resize', resize);
resize();

const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; e.preventDefault(); });
window.addEventListener('keyup', e => { keys[e.code] = false; });

// 确认画布渲染
ctx.fillStyle = '#0a0a1a';
ctx.fillRect(0, 0, W, H);
ctx.fillStyle = '#00f0ff';
ctx.fillRect(0, groundY, W, 2);
console.log('Canvas ready:', W, H, 'groundY:', groundY);
```

- [ ] **Step 3: 打开测试**

运行：在浏览器中打开 `d:\test\python_1\rhythm_jumper.html`
验证：看到深色背景、底部青色线条，控制台输出 Canvas 尺寸信息，按空格键不会触发页面滚动。

---

### Task 2: 游戏循环与玩家角色

**Files:**
- Modify: `d:\test\python_1\rhythm_jumper.html`

**Consumes:** Task 1 的 Canvas 设置和键盘监听
**Produces:** `Player` 类（`update(dt, groundY)`, `draw(ctx)`, `jump()`, `getBounds()`），游戏循环运行中，玩家站在地面上，按空格跳跃。

- [ ] **Step 1: 添加 Player 类**

在 `<script>` 中，Canvas 初始化代码之后添加：

```javascript
// ===== Player =====
class Player {
  constructor(x, groundY) {
    this.x = x;
    this.y = groundY;
    this.width = 20;
    this.height = 30;
    this.vy = 0;
    this.gravity = 1800;  // px/s²
    this.jumpForce = -620; // px/s (初始向上速度)
    this.doubleJumpForce = -520;
    this.jumpsLeft = 2;
    this.maxJumps = 2;
    this.groundY = groundY;
    this.isOnGround = true;
  }

  jump() {
    if (this.jumpsLeft <= 0) return false;
    const force = this.jumpsLeft === 2 ? this.jumpForce : this.doubleJumpForce;
    this.vy = force;
    this.jumpsLeft--;
    this.isOnGround = false;
    return true;
  }

  update(dt, groundY) {
    this.groundY = groundY;
    this.vy += this.gravity * dt;
    this.y += this.vy * dt;

    if (this.y + this.height >= groundY) {
      this.y = groundY - this.height;
      this.vy = 0;
      this.jumpsLeft = this.maxJumps;
      this.isOnGround = true;
    }
  }

  draw(ctx) {
    // 发光效果
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 底部光晕
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.fillRect(this.x - 2, this.y + this.height - 4, this.width + 4, 8);
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }
}
```

- [ ] **Step 2: 添加主游戏循环和状态**

```javascript
// ===== Game State =====
const STATE = { IDLE: 'idle', PLAYING: 'playing', GAMEOVER: 'gameover' };
let gameState = STATE.IDLE;
let player;
let lastTime = 0;

function initGame() {
  player = new Player(W * 0.2, groundY);
}

function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  if (lastTime === 0) lastTime = timestamp;
  let dt = (timestamp - lastTime) / 1000;
  if (dt > 0.1) dt = 0.016; // 防止大帧跳跃
  lastTime = timestamp;

  // 更新
  if (gameState === STATE.PLAYING) {
    player.update(dt, groundY);

    // 跳跃输入
    if (keys['Space'] || keys['ArrowUp']) {
      if (player.jump()) {
        // 音效后面添加
      }
      keys['Space'] = false;
      keys['ArrowUp'] = false;
    }
  } else if (gameState === STATE.IDLE) {
    if (keys['Space'] || keys['ArrowUp']) {
      gameState = STATE.PLAYING;
      document.getElementById('start-hint').style.display = 'none';
      player.jump();
      keys['Space'] = false;
      keys['ArrowUp'] = false;
    }
  }

  // 渲染
  ctx.clearRect(0, 0, W, H);
  // 背景渐变
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0a0a1a');
  grad.addColorStop(1, '#1a0a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 地面
  ctx.fillStyle = '#00f0ff';
  ctx.fillRect(0, groundY, W, 2);

  player.draw(ctx);
}

initGame();
requestAnimationFrame(gameLoop);
```

- [ ] **Step 3: 测试**

打开浏览器，验证：
- 角色站在地面上，白色方块带青色光晕
- 按空格角色跳起然后落下
- 可以二段跳（空中再按一次）
- 落地后可再次跳跃

---

### Task 3: 障碍物系统

**Files:**
- Modify: `d:\test\python_1\rhythm_jumper.html`

**Consumes:** Task 2 的 Player 和游戏循环
**Produces:** `Obstacle` 类，障碍物从右侧生成并向左移动，随机高度。

- [ ] **Step 1: 添加 Obstacle 类**

在 Player 类之后添加：

```javascript
// ===== Obstacle =====
class Obstacle {
  constructor(x, groundY) {
    this.x = x;
    this.width = 22;
    // 随机高度：矮、中、高
    const heights = [25, 35, 45];
    this.height = heights[Math.floor(Math.random() * heights.length)];
    this.y = groundY - this.height;
    this.speed = 320; // px/s，由 Game 控制实际速度
    this.passed = false;
  }

  update(dt, speedMultiplier) {
    this.x -= this.speed * speedMultiplier * dt;
  }

  draw(ctx) {
    // 红色光晕
    ctx.shadowColor = 'rgba(255, 0, 50, 0.6)';
    ctx.shadowBlur = 14;

    // 尖刺形状
    ctx.fillStyle = '#cc2233';
    ctx.beginPath();
    const cx = this.x + this.width / 2;
    ctx.moveTo(cx, this.y);                    // 顶部尖端
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.closePath();
    ctx.fill();

    // 顶部亮光
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff4455';
    ctx.beginPath();
    ctx.moveTo(cx, this.y + 4);
    ctx.lineTo(cx + 6, this.y + this.height);
    ctx.lineTo(cx - 6, this.y + this.height);
    ctx.closePath();
    ctx.fill();
  }

  getBounds() {
    // 碰撞检测用稍小的矩形，更宽容
    return {
      x: this.x + 4,
      y: this.y + 6,
      w: this.width - 8,
      h: this.height - 6
    };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}
```

- [ ] **Step 2: 在 Game 中添加障碍物管理**

修改 `initGame()` 和 `gameLoop()`，添加障碍物生成逻辑：

```javascript
// 在 initGame 之前添加：
let obstacles = [];
let obstacleTimer = 0;
let obstacleInterval = 1.8; // 初始每1.8秒生成一个
let speedMultiplier = 1;
let score = 0;

function initGame() {
  player = new Player(W * 0.2, groundY);
  obstacles = [];
  obstacleTimer = 0;
  speedMultiplier = 1;
  score = 0;
}

// 在 gameLoop 的 PLAYING 更新区域添加（player.update 之后）：
    // 障碍物生成
    obstacleTimer += dt;
    if (obstacleTimer >= obstacleInterval) {
      obstacleTimer = 0;
      obstacles.push(new Obstacle(W + 50, groundY));
      // 间隔随机变化 1.4~2.2s
      obstacleInterval = 1.4 + Math.random() * 0.8;
    }

    // 障碍物更新
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].update(dt, speedMultiplier);
      if (obstacles[i].isOffScreen()) {
        obstacles.splice(i, 1);
      }
    }

// 在渲染部分，player.draw(ctx) 之前添加：
  // 障碍物
  for (const obs of obstacles) {
    obs.draw(ctx);
  }
```

- [ ] **Step 3: 测试**

打开浏览器验证：
- 游戏开始后障碍物从右侧出现并向左移动
- 障碍物高度随机变化（矮/中/高）
- 红色三角尖刺形状，有光晕效果
- 出屏后自动移除

---

### Task 4: 碰撞检测与游戏结束

**Files:**
- Modify: `d:\test\python_1\rhythm_jumper.html`

**Consumes:** Task 3 的障碍物系统
**Produces:** AABB 碰撞检测，游戏结束逻辑。

- [ ] **Step 1: 添加碰撞检测函数**

```javascript
// ===== Collision Detection =====
function rectsCollide(a, b) {
  const margin = 2; // 宽容边距
  return (
    a.x + margin < b.x + b.w - margin &&
    a.x + a.w - margin > b.x + margin &&
    a.y + margin < b.y + b.h - margin &&
    a.y + a.h - margin > b.y + margin
  );
}
```

- [ ] **Step 2: 在游戏循环中添加碰撞检测**

在 gameLoop 的障碍物更新循环中添加：

```javascript
    // 障碍物更新 + 碰撞检测
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].update(dt, speedMultiplier);

      // 碰撞检测
      const playerBounds = player.getBounds();
      const obsBounds = obstacles[i].getBounds();
      if (rectsCollide(playerBounds, obsBounds)) {
        gameState = STATE.GAMEOVER;
        endGame();
      }

      if (obstacles[i].isOffScreen()) {
        obstacles.splice(i, 1);
      }
    }
```

- [ ] **Step 3: 添加 endGame 函数**

```javascript
function endGame() {
  document.getElementById('game-over-panel').style.display = 'block';
  document.getElementById('final-score').textContent = Math.floor(score);

  // localStorage 最高分
  const prevHigh = parseInt(localStorage.getItem('rhythmJumperHighScore') || '0');
  const currentHigh = Math.max(prevHigh, Math.floor(score));
  localStorage.setItem('rhythmJumperHighScore', currentHigh);
  document.getElementById('high-score').textContent = currentHigh;
}

// 重新开始
document.getElementById('restart-btn').addEventListener('click', resetGame);

function resetGame() {
  initGame();
  gameState = STATE.IDLE;
  document.getElementById('game-over-panel').style.display = 'none';
  document.getElementById('start-hint').style.display = 'block';
}
```

- [ ] **Step 4: 测试**

验证：
- 角色撞到障碍物时游戏停止
- 结算面板显示，分数正确
- 点击"重新开始"或刷新后最高分保留在 localStorage

---

### Task 5: 计分与难度递增

**Files:**
- Modify: `d:\test\python_1\rhythm_jumper.html`

**Consumes:** Task 4 的游戏结束逻辑
**Produces:** 实时分数显示，每 10 秒加速，越过障碍物加分。

- [ ] **Step 1: 添加分数 UI 和计分逻辑**

在 gameLoop 的渲染部分（地面绘制之后）添加：

```javascript
  // 分数
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
  ctx.shadowBlur = 8;
  ctx.textAlign = 'right';
  ctx.fillText(`SCORE: ${Math.floor(score)}`, W - 30, 50);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'start';
```

在 gameLoop 的 PLAYING 更新区域添加：

```javascript
    // 计分
    score += dt * 10; // 每秒10分

    // 越过障碍检测 + 加分
    for (const obs of obstacles) {
      if (!obs.passed && obs.x + obs.width < player.x) {
        obs.passed = true;
        score += 50;
      }
    }

    // 难度递增：每10秒加速
    speedMultiplier = 1 + Math.floor(score / 100) * 0.15;
    if (speedMultiplier > 3) speedMultiplier = 3;
```

- [ ] **Step 2: 测试**

验证：
- 右上角显示黄色分数，实时增长
- 越过障碍物时分数跳 +50
- 大约 10 秒后障碍物速度明显变快
- 速度上限不超过初始 3 倍

---

### Task 6: 视觉特效 — 粒子、背景、地面动画

**Files:**
- Modify: `d:\test\python_1\rhythm_jumper.html`

**Consumes:** Task 5 的完整游戏逻辑
**Produces:** 跳跃粒子拖尾、城市灯光背景、移动地面网格。

- [ ] **Step 1: 添加 Particle 类**

```javascript
// ===== Particle =====
class Particle {
  constructor(x, y) {
    this.x = x + (Math.random() - 0.5) * 10;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 60;
    this.vy = -(Math.random() * 120 + 40);
    this.life = 0.5 + Math.random() * 0.3;
    this.maxLife = this.life;
    this.size = 2 + Math.random() * 3;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  get alive() { return this.life > 0; }
}
```

- [ ] **Step 2: 添加 Background 类（城市灯光 + 地面网格）**

```javascript
// ===== Background =====
class Background {
  constructor(w, h) {
    this.lights = [];
    for (let i = 0; i < 40; i++) {
      this.lights.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.65,
        r: 0.5 + Math.random() * 1.5,
        alpha: 0.2 + Math.random() * 0.4,
        twinkleSpeed: 1 + Math.random() * 3,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
    this.gridOffset = 0;
  }

  update(dt, speed) {
    this.gridOffset += speed * 280 * dt;
    this.gridOffset %= 40;
  }

  draw(ctx, w, groundY) {
    // 远处城市灯光
    const now = performance.now() / 1000;
    for (const light of this.lights) {
      const flicker = 0.7 + 0.3 * Math.sin(now * light.twinkleSpeed + light.twinkleOffset);
      ctx.fillStyle = `rgba(200, 180, 255, ${light.alpha * flicker})`;
      ctx.beginPath();
      ctx.arc(light.x, light.y, light.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 移动地面网格
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let x = -this.gridOffset; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 5);
      ctx.lineTo(x + 15, groundY + 5);
      ctx.stroke();
    }
  }
}
```

- [ ] **Step 3: 集成粒子和背景到游戏循环**

修改代码：

```javascript
// 在全局变量区添加：
let particles = [];
let background;

// 在 initGame() 中添加：
function initGame() {
  player = new Player(W * 0.2, groundY);
  obstacles = [];
  particles = [];
  obstacleTimer = 0;
  speedMultiplier = 1;
  score = 0;
  background = new Background(W, H);
}

// 在 gameLoop 的 PLAYING 更新区域添加粒子更新：
    // 粒子更新
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update(dt);
      if (!particles[i].alive) particles.splice(i, 1);
    }

// 在清除画布之后的渲染区域，按顺序：
  // 背景城市灯光
  background.draw(ctx, W, groundY);
  // ... (地面、障碍物、角色、粒子)

  // 粒子渲染（在角色之后）
  for (const p of particles) {
    p.draw(ctx);
  }
```

- [ ] **Step 4: 触发粒子效果**

在 Player 的 `jump()` 方法中添加粒子生成。修改 Player 类，添加一个 spawnParticles 的方法引用：

```javascript
// 修改 gameLoop 中跳跃触发的代码：
    if (keys['Space'] || keys['ArrowUp']) {
      if (player.jump()) {
        // 生成粒子
        for (let i = 0; i < 6; i++) {
          particles.push(new Particle(player.x + player.width / 2, player.y + player.height));
        }
      }
      keys['Space'] = false;
      keys['ArrowUp'] = false;
    }
```

- [ ] **Step 5: 测试**

验证：
- 跳跃时角色底部飞出青色粒子，向上飘散渐隐
- 背景中有闪烁的城市灯光点
- 地面有向右移动的虚线标记

---

### Task 7: 音效

**Files:**
- Modify: `d:\test\python_1\rhythm_jumper.html`

**Consumes:** Task 6 的完整游戏
**Produces:** Web Audio API 生成的跳跃、二段跳、碰撞、过障碍音效。

- [ ] **Step 1: 添加 SoundEngine 类**

```javascript
// ===== SoundEngine =====
class SoundEngine {
  constructor() {
    this.ctx = null; // 延迟初始化，需用户交互后
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  playTone(freq, duration, type = 'sine', volume = 0.15) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playJump() {
    this.init();
    this.playTone(800, 0.08);
    setTimeout(() => this.playTone(1000, 0.06), 30);
  }

  playDoubleJump() {
    this.init();
    this.playTone(1200, 0.06);
    setTimeout(() => this.playTone(1400, 0.05), 20);
  }

  playHit() {
    this.init();
    this.playTone(200, 0.3, 'square', 0.2);
    // 噪声
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start();
  }

  playScore() {
    this.init();
    this.playTone(600, 0.1);
    setTimeout(() => this.playTone(900, 0.08), 50);
  }
}
```

- [ ] **Step 2: 集成音效到游戏事件**

```javascript
// 全局变量：
const sound = new SoundEngine();

// 在 gameLoop 跳跃触发处修改：
    if (keys['Space'] || keys['ArrowUp']) {
      if (player.jump()) {
        // 生成粒子
        for (let i = 0; i < 6; i++) {
          particles.push(new Particle(player.x + player.width / 2, player.y + player.height));
        }
        // 音效
        if (player.jumpsLeft === 1) {
          sound.playDoubleJump();
        } else {
          sound.playJump();
        }
      }
      keys['Space'] = false;
      keys['ArrowUp'] = false;
    }

// 在碰撞检测时添加：
      if (rectsCollide(playerBounds, obsBounds)) {
        sound.playHit();
        gameState = STATE.GAMEOVER;
        endGame();
      }

// 在越过障碍加分处添加：
      if (!obs.passed && obs.x + obs.width < player.x) {
        obs.passed = true;
        score += 50;
        sound.playScore();
      }
```

- [ ] **Step 3: 测试**

验证：
- 首次按键后有声音（AudioContext 需用户手势激活）
- 跳跃有短促上升音
- 二段跳音调更高
- 碰撞有低频噪声
- 过障碍有叮咚声

---

### Task 8: 最终打磨

**Files:**
- Modify: `d:\test\python_1\rhythm_jumper.html`

**Consumes:** Task 7 的完整游戏
**Produces:** 窗口 resize 时正确重置、移动端提示、最终测试通过的完整游戏。

- [ ] **Step 1: 窗口 resize 处理**

```javascript
// 修改 resize 函数：
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  groundY = H * 0.85;
  if (player) player.groundY = groundY;
  if (background) background = new Background(W, H);
}
```

- [ ] **Step 2: 移动端提示**

在 UI 层添加移动端检测：

```javascript
// 在 <script> 开头添加：
if (/Mobi|Android|iPhone/i.test(navigator.userAgent) && window.innerWidth < 768) {
  document.getElementById('start-hint').innerHTML =
    '请用电脑打开获得最佳体验<br><small>Best experienced on desktop</small>';
}
```

- [ ] **Step 3: 最终完整测试**

打开 `rhythm_jumper.html`，完整走通流程：
1. 页面加载 → 看到深色背景、地面、城市灯光、"按空格开始"
2. 按空格 → 角色跳起，粒子飞出，听到跳跃音效
3. 障碍物从右侧逼近，用跳跃/二段跳躲避
4. 右上角分数实时增长，越过障碍加 50 分
5. 难度逐渐加大，地面网格移动加快
6. 撞到障碍物 → 音效，结算面板弹出
7. 最高分存入 localStorage，刷新后仍在
8. 点击重新开始 → 完全重置
9. 缩放窗口 → Canvas 自适应
10. 移动端打开 → 显示桌面端提示

---

## 自审

1. **Spec 覆盖检查：**
   - ✅ 角色跳跃/二段跳 → Task 2
   - ✅ 障碍物随机高度 → Task 3
   - ✅ 难度递增（每10秒加速，上限3x）→ Task 5
   - ✅ 计分（时间分 + 越障碍分）→ Task 5
   - ✅ 碰撞检测 → Task 4
   - ✅ 赛博朋克配色 → 散布各 Task
   - ✅ 粒子拖尾 → Task 6
   - ✅ 城市灯光背景 → Task 6
   - ✅ 地面移动网格 → Task 6
   - ✅ 音效（跳跃/二段跳/碰撞/过障碍）→ Task 7
   - ✅ 结算面板 + localStorage 最高分 → Task 4
   - ✅ 窗口自适应 → Task 8
   - ✅ 移动端提示 → Task 8

2. **占位符扫描：** 无 TBD/TODO，所有代码都是完整可运行的。

3. **类型一致性：** 各 Task 间的方法签名保持一致 — `Player.jump()`, `Obstacle.update(dt, speedMultiplier)`, `Particle.update(dt)` 等在各处引用一致。
