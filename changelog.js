// GROUNDED - Game Changelog
// All version history and patch notes

// Use var to ensure global scope in browser
var CHANGELOG = `
═══════════════════════════════════════════════════════════════
                         GROUNDED
                    Version History & Changelog
═══════════════════════════════════════════════════════════════

v2.7.2 - Shrink Mushroom Buff! (Current Version)
─────────────────────────────────────────────────────────────
⚡ Shrink mushrooms now make you FASTER and JUMPIER!

SHRINK MUSHROOM CHANGES:
• Speed boost: +20% movement speed (stacks with each shrink)
• Jump boost: +15% jump power (stacks with each shrink)
• Size reduction: 0.67x (unchanged, still stacks)
• All effects are PERMANENT and persist across levels

GAMEPLAY:
• Smaller = nimbler! Dodge hazards more easily
• Higher jumps compensate for smaller size
• Faster movement makes platforming smoother
• Strategic choice: Go small for agility vs big for power
• Multiple shrink mushrooms = super speed + super jumps!

TECHNICAL:
• baseJumpPower now persists across levels
• Speed multiplier stacks multiplicatively
• Jump power scales with both size AND shrink boosts

─────────────────────────────────────────────────────────────

v2.7.0 - Visual Style Themes!
─────────────────────────────────────────────────────────────
🎨 Every level now has a unique visual style theme!

10 DISTINCT THEMES:
• Classic - Sky blue with brown platforms (Level 1)
• Sunset - Orange sky with dark platforms (Level 2)
• Night - Deep blue atmosphere with moody tones (Level 3)
• Forest - Green sky with nature colors (Level 4)
• Desert - Sandy beige with warm earth tones (Level 5)
• Ice - Light blue with icy platforms (Level 6)
• Volcano - Dark smoky atmosphere with lava tones (Level 7)
• Candy - Pink dreamscape with vibrant colors (Level 8)
• Matrix - Green-on-black cyber aesthetic (Level 9)
• Space - Deep purple cosmic void (Level 10)

TECHNICAL:
• Styles cycle through all 10 themes every 10 levels
• Each theme recolors: sky, platforms, hazards (spikes, saws, lava, poison)
• Style name displayed in HUD
• All rendering updated to use dynamic style system
• Smooth color transitions maintain visual clarity

IMPACT:
• Fresh visual experience every level!
• Helps track progress through color themes
• Makes each level feel unique and memorable
• Better visual variety keeps game interesting
• No two consecutive levels look the same

─────────────────────────────────────────────────────────────

v2.5.6 - Fixed Consumable Persistence!
─────────────────────────────────────────────────────────────
🔧 Major refactor to fix effect persistence bugs!

THE BUGS:
• Size from mushrooms wasn't persisting between levels
• Confusion/reversed controls persisted when they shouldn't
• Incomplete initialization of consumableEffects
• No clear distinction between permanent vs temporary effects

THE FIXES:
• PERMANENT effects (persist across levels, reset on restart):
  - Size changes from mushrooms (sizeMultiplier)
  - Wings of Icarus
• TEMPORARY effects (reset between levels):
  - All other consumables (confusion, speed, shields, etc)

TECHNICAL CHANGES:
• Fully initialized all consumableEffects in player.js constructor
• nextLevel() now properly:
  - Saves ONLY permanent effects (size, wings)
  - Resets ALL temporary effects to defaults
  - Restores permanent effects after reset
• restart() now properly:
  - Resets ALL effects (both permanent and temporary)
  - Clears all charges, timers, and status flags
  - Returns player to completely fresh state

WHAT THIS MEANS:
✅ Mushroom size changes persist across levels as intended
✅ Wings persist across levels (permanent upgrade)
✅ Confusion potion effects properly clear between levels
✅ Shield charges, dash charges reset between levels
✅ Restart (R key) fully resets everything to normal
✅ No more lingering cursed effects!

─────────────────────────────────────────────────────────────

v2.5.5 - Reduced Trap Density!
─────────────────────────────────────────────────────────────
🎮 Significantly reduced hazards for better gameplay balance!

HAZARD COUNT REDUCTIONS:
• Spikes per section: 2-4 → 1-2
• Poison clouds per section: 2-3 → 1
• Saw blades per section: 2-4 → 1-2
• Mixed hazards: 1-3 → 1 (single hazard)

HAZARD SPAWN PROBABILITY REDUCED:
• Normal bias: 0.7 → 0.4 (start) | 1.0 → 0.8 (max)
• Safe Zone: 0.3 → 0.2 (start) | 0.7 → 0.5 (max)
• Hazard Heavy: 0.95 → 0.6 (start) | 1.5 → 0.9 (max)
• Wide Gap: 0.7 → 0.4 (start) | 1.0 → 0.8 (max)
• High Route: 0.6 → 0.35 (start) | 1.0 → 0.7 (max)
• Tight Spaces: 0.7 → 0.4 (start) | 1.0 → 0.8 (max)
• Spike Gauntlet: 0.4 → 0.25 (fixed)
• Toxic Hell: 0.5 → 0.3 (fixed)
• Blade Runner: 0.6 → 0.35 (fixed)
• Vertical Climb: 0.7 → 0.4 (fixed)

WHY:
• Game was too punishing - too many traps per level
• Players couldn't enjoy core mechanics and collectibles
• Now you can pass through several levels and experience gameplay
• Difficulty still scales with level but starts much gentler

IMPACT:
• Much more enjoyable early game experience
• Can actually collect mushrooms and explore mechanics
• Traps are still present but not overwhelming
• Better balance between challenge and fun!

─────────────────────────────────────────────────────────────

v2.5.4 - HTML Feedback Form!
─────────────────────────────────────────────────────────────
📝 Replaced canvas text input with proper HTML textarea!

NEW FEEDBACK FORM:
• Native HTML textarea instead of canvas-based input
• Cmd+A, Cmd+C, Cmd+V all work naturally
• Easy text editing with cursor positioning
• Select, copy, paste text normally
• Backspace, delete, arrow keys work as expected

IMPROVED UX:
• Styled overlay with semi-transparent background
• Auto-focus on textarea when form opens
• ESC key to close form
• Submit and Skip buttons
• Shows "Submitting..." status
• Auto-closes after successful submission
• Clean, professional appearance

FEATURES:
• 200 character limit (enforced by HTML)
• Displays current level, mode, and seed
• Responsive design
• Better visual feedback
• No more awkward canvas text editing!

TECHNICAL:
• HTML overlay with CSS styling
• Event listeners for buttons and ESC key
• Removed old canvas rendering code
• Much cleaner implementation

─────────────────────────────────────────────────────────────

v2.5.3 - Wings Are Now Permanent!
─────────────────────────────────────────────────────────────
🪽 Wings of Icarus are now permanent like mushrooms!

CHANGES:
• Wings effect is now PERMANENT (no duration timer)
• Once you get wings, you keep them for the entire run
• Moved from rare to uncommon (more common now)
• Hold jump in air to glide smoothly downward forever

WHY:
• Makes wings more valuable as a permanent upgrade
• Consistent with mushroom permanent mechanics
• More strategic gameplay - find wings early for easier run
• No more losing wings mid-level

IMPACT:
• Wings are now a powerful permanent upgrade
• Find them once, keep them forever (until restart/death)
• Gliding becomes a core mechanic once acquired
• Much more satisfying to collect

─────────────────────────────────────────────────────────────

v2.5.2 - Smooth Mushroom Transitions
─────────────────────────────────────────────────────────────
✨ Mushroom size changes now animate smoothly instead of instant!

SMOOTH TRANSITIONS:
• Size changes from mushrooms now lerp smoothly over time
• No more jarring instant size jumps
• Transition speed: 10% per frame for natural feel
• Jump power scales smoothly during transition

VISUAL FEEDBACK:
• Gold glow when growing (eating giant mushroom)
• Purple glow when shrinking (eating shrink mushroom)
• Face and features scale proportionally with size
• Eyes and mouth stay properly positioned at any size

TECHNICAL:
• Added targetSizeMultiplier for smooth interpolation
• updateSizeTransition() called every frame
• Smooth lerp formula: current + (target - current) * 0.1
• Snaps to target when within 0.01 difference

IMPACT:
• Much more polished and satisfying mushroom collection
• Size changes feel natural and smooth
• Visual feedback clearly shows what's happening
• No more disorienting instant size changes

─────────────────────────────────────────────────────────────

v2.5.1 - Bug Fix: Music Overlapping
─────────────────────────────────────────────────────────────
🐛 Fixed background music starting multiple times and overlapping!

BUG FIX:
• Music was being restarted multiple times when changing levels
• Multiple overlapping music tracks would play simultaneously
• Eventually music would stop due to too many overlaps
• Root cause: setMusicMood() called rapidly without canceling pending restarts

THE FIX:
• Added musicRestartTimeout to track pending music restarts
• Cancel any pending restart before scheduling a new one
• Increased restart delay to 200ms for full stop
• Now only one music restart can be pending at a time

IMPACT:
• Music now properly stops and restarts cleanly between levels
• No more overlapping tracks or sudden music cutoffs
• Smooth music transitions when changing level biases

─────────────────────────────────────────────────────────────

v2.5.0 - ANIMATED TRAPS & VERTICAL TOWERS!
─────────────────────────────────────────────────────────────
⚡ New Feature: Animated hazards and vertical tower levels!

ANIMATED HAZARDS:
• Spikes now extend/retract in timed cycles (Active → Safe → Active)
• Visual warning glow before spikes extend
• Poison clouds move in patterns (horizontal, vertical, circle, figure-8)
• Toxic rain particles fall from moving poison clouds

VERTICAL TOWER LEVELS:
• New level type: Climb 30 platforms to reach exit door at top
• Exit door appears at top of tower instead of finish flag
• Camera follows player vertically through tall towers
• Hazards increase in difficulty as you climb higher

NEW LEVEL BIASES:
• spike_gauntlet - Levels filled with animated spikes
• toxic_hell - Levels dominated by moving poison clouds
• blade_runner - Levels with mostly saw blades
• vertical_climb - Activates vertical tower generation

Try the new biases to experience focused challenges!

─────────────────────────────────────────────────────────────

v2.4.0 - MUSHROOM POWER!
─────────────────────────────────────────────────────────────
🍄 Major Mushroom Overhaul - Now a core progression mechanic!

NEW MECHANICS:
• Mushrooms are now PERMANENT (no duration - effects last forever!)
• STACKING SYSTEM: Eat multiple mushrooms to grow/shrink further
• Giant Mushroom: 1.5x size multiplier per mushroom (40 → 60 → 90...)
• Shrink Mushroom: 0.67x size multiplier (40 → 27 → 18...)
• Jump power scales with size: Bigger = stronger jumps!
• Size affects: (sqrt scaling for balance)

VISUAL UPGRADE:
• Beautiful mushroom sprites with caps and stems
• Giant Mushroom: Red cap with white spots (Mario-style!)
• Shrink Mushroom: Purple/blue cap
• Mushrooms GROW ON PLATFORMS like real mushrooms!
• 3-6 guaranteed mushrooms per level on platform surfaces

GAMEPLAY CHANGES:
• Mushrooms much more common (uncommon rarity, not rare)
• Strategic choice: Go big for power or small for dodging?
• Size limits: 0.1x to 10x (can't get too tiny or huge)
• Resets to normal size when restarting level

This changes everything! Size is now your primary progression.

─────────────────────────────────────────────────────────────

v2.3.5
─────────────────────────────────────────────────────────────
🐛 Fixed giant mushroom carrying over to next level! Player size
now properly resets when starting new levels or restarting.

─────────────────────────────────────────────────────────────

v2.3.4
─────────────────────────────────────────────────────────────
📝 Moved feedback to main menu! No longer interrupts after death.
Access via 'Submit Feedback' in the main menu. Less intrusive!

─────────────────────────────────────────────────────────────

v2.3.3
─────────────────────────────────────────────────────────────
🐛 Minor bug fixes (keyboard input, audio crashes).

─────────────────────────────────────────────────────────────

v2.3.0 - Player Feedback
─────────────────────────────────────────────────────────────
📝 Optional feedback screen after death. Share your thoughts or
skip with ESC. Dashboard at /feedback.html (Vercel only).

─────────────────────────────────────────────────────────────

v2.1.0 - Narrative: "You Just Want Out"
─────────────────────────────────────────────────────────────
📖 ~100 PKD & Asimov-inspired messages reveal the darker story.
You're trapped in an AI system that predicts your every move.
Terminal-style glitch text. Reality vs simulation. Three Laws.
Psychohistory. The system knows you'll keep jumping.
But you just want out.

─────────────────────────────────────────────────────────────

v2.2.0 - Settings Menu
─────────────────────────────────────────────────────────────
⚙️ Full settings menu with audio controls, retro mode, scanlines,
color palettes. Access from start screen or pause menu (ESC).

─────────────────────────────────────────────────────────────

v2.0.0 - Music Fix
─────────────────────────────────────────────────────────────
🎵 Music stops INSTANTLY between levels. Forcefully killed all
Web Audio oscillators. No more ghostly notes bleeding through!

─────────────────────────────────────────────────────────────

v1.8.3 - Changelog Viewer
─────────────────────────────────────────────────────────────
📜 Scrolling changelog viewer in-game. You're reading it now!

─────────────────────────────────────────────────────────────

v1.8.1 - Consumable Overhaul
─────────────────────────────────────────────────────────────
✨ Fixed ALL broken consumables! Gravity physics, Lucky Clover
rarity boosts, screen flashes color-coded by rarity, particle
explosions, 3x size changes. Everything's functional and dramatic!

─────────────────────────────────────────────────────────────

v1.8.0 - Pause Menu
─────────────────────────────────────────────────────────────
🎮 Press ESC to pause. Resume, Settings, Restart, Quit to Menu.
Finally, you can take a break!

─────────────────────────────────────────────────────────────

v1.7.4 - Elaborate Music
─────────────────────────────────────────────────────────────
🎵 Multi-layered composition: melody, harmony, bass, percussion.
I-V-vi-IV chord progression. Seamless 5.6s loops. Press B to toggle.

─────────────────────────────────────────────────────────────

v1.7.0 - Roguelike Consumables
─────────────────────────────────────────────────────────────
🎲 20+ items with rarity tiers! Common, Uncommon, Rare, Cursed.
Gravity changers, size mods, defensive gear, level chaos, movement
boosts, and cursed effects that make you regret your choices.

─────────────────────────────────────────────────────────────

v1.6.0 - Multi-Floor Design
─────────────────────────────────────────────────────────────
🏢 Vertical platforming! 4 floors per level, smooth camera scrolling,
player-centered at 50% screen height. Go up! Way up!

─────────────────────────────────────────────────────────────

v1.5.0 - Ambient Sound
─────────────────────────────────────────────────────────────
🎧 Proximity-based hazard audio! Saws grind, lava bubbles, poison
hisses. Background music loops. Press M to mute.

─────────────────────────────────────────────────────────────

v1.4.0 - Web Audio
─────────────────────────────────────────────────────────────
🎵 Dynamic sound generation with Web Audio API! Synthesized jump
sounds (200Hz→600Hz), landing thuds (100Hz→40Hz), frequency sweeps.
Pure oscillator magic - no audio files!

─────────────────────────────────────────────────────────────

v1.3.0 - Level Progression
─────────────────────────────────────────────────────────────
🗺️ Multiple levels with 5 unique generation biases: Wide Gap,
Hazard Heavy, Safe Zone, High Route, Tight Spaces. Seed-based
generation. Press N for next level. Powerups persist!

─────────────────────────────────────────────────────────────

v1.2.5 - Particle Effects
─────────────────────────────────────────────────────────────
🎆 Physics-based particles! Jump splashes, landing explosions with
velocity, gravity, drag, and glow. Particles spray opposite to
movement direction for realistic motion!

─────────────────────────────────────────────────────────────

v1.2.0 - Start Screen
─────────────────────────────────────────────────────────────
🎬 Animated "GROUNDED" logo with RGB split, glitch effects,
multi-layer rendering, background particles. Professional intro!

─────────────────────────────────────────────────────────────

v1.1.0 - Consumable Foundation
─────────────────────────────────────────────────────────────
🎁 Basic powerups: Double Jump, Triple Jump, Speed Boost, Extra Life.

─────────────────────────────────────────────────────────────

v1.0.0 - Base Game
─────────────────────────────────────────────────────────────
🎮 Initial release! Rectangle physics, 5 jump modes (Mario, Hollow
Knight, Celeste, Sonic, Mega Man), platforms, hazards (saws, lava,
poison, black holes), lives system, side-scrolling camera.
Built with HTML5 Canvas, custom physics engine, 60 FPS game loop,
seed-based procedural generation. The foundation!


═══════════════════════════════════════════════════════════════
                    Thanks for playing GROUNDED!
           Master the Art of Jumping - One Platform at a Time
═══════════════════════════════════════════════════════════════
`;
