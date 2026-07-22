# Task 6: Visual Effects — Complete

Status: **DONE**

## Changes Made

File: `d:\test\python_1\rhythm_jumper.html`

### Added Classes
1. **Particle class** (line 266-291) — spawns small cyan squares on jump that fade out over time with random velocity and spread.
2. **Background class** (line 293-334) — renders 40 twinkling city-light dots (flicker via sine wave) and a moving ground grid that scrolls with game speed.

### Added Globals
- `let particles = []` — particle array
- `let background` — Background instance

### Modified Logic
- **`initGame()`** — now initializes `particles = []` and `background = new Background(W, H)`.
- **PLAYING state** — `player.jump()` wrapped in `if (player.jump())` check; 6 particles spawned on successful jump. `background.update(dt, speedMultiplier)` called each frame.
- **IDLE state** — same wrap on `player.jump()` with particle spawn; `particles` array cleared when starting game.

### Updated Render Order
1. Clear canvas
2. Gradient background
3. **Background lights + ground grid** (`background.draw`)
4. Ground line
5. Score text
6. Obstacles
7. Player
8. **Particles** (each `p.draw(ctx)`)

### Updated Update Loop (before render)
- Particle lifecycle: dead particles are removed from array each frame.
