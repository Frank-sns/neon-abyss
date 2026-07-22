Status: DONE

## Task 5 Summary

Added three features to `d:\test\python_1\rhythm_jumper.html`:

### 1. Score Display (Render Section)
Added gold-colored score text (`SCORE: N`) rendered after the ground line, with glow shadow effect, right-aligned near the top-right corner.

### 2. Scoring & Difficulty Scaling (PLAYING State)
- **Time-based scoring**: `score += dt * 10` — continuous points while playing.
- **Obstacle passed bonus**: Each obstacle gets +50 points when the player clears it (tracked via `obs.passed` flag).
- **Difficulty scaling**: `speedMultiplier` increases by 0.15 per 100 points, capped at 3.0. This accelerates obstacle movement, making the game progressively harder.

### 3. Score Reset
`score = 0;` was already present in `initGame()` — no change needed.
