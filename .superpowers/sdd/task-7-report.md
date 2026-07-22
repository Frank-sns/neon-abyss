# Task 7 Report: Add Sound Effects to Rhythm Jumper

**Status:** DONE

**File modified:** `d:\test\python_1\rhythm_jumper.html`

**Changes made:**

1. **Added `SoundEngine` class** at the top of the `<script>` tag (line 130), before all other game code. The class uses the Web Audio API to generate tones and noise-based effects.

2. **Created global `sound` instance** (line 196) right after the class definition.

3. **Added sound calls at four game events:**
   - **Jump (PLAYING)** -- Lines 504-508: `playDoubleJump()` when `jumpsLeft === 1` (second jump), `playJump()` otherwise. Placed after the particle spawning loop.
   - **Jump (IDLE)** -- Line 523: `playJump()` after the particle loop, when starting the game from idle.
   - **Collision** -- Line 473: `playHit()` after `gameState = STATE.GAMEOVER` and before `endGame()`.
   - **Obstacle passed** -- Line 491: `playScore()` after `obs.passed = true;` in the scoring section.

All original game code is preserved. The SoundEngine uses an oscillator-based approach with `AudioContext` for tone generation and a `BufferSource` for noise on the hit effect.
