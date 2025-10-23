// GROUNDED - Game Changelog
// All version history and patch notes

// Use var to ensure global scope in browser
var CHANGELOG = `
═══════════════════════════════════════════════════════════════
                         GROUNDED
                    Version History & Changelog
═══════════════════════════════════════════════════════════════

v2.3.0 - Feature: Player Feedback System (Current Version)
─────────────────────────────────────────────────────────────
📝 Collect optional feedback after every death!

NEW FEATURES:
• Optional feedback screen shown after game over
• Players can share thoughts about their run
• Simple text input - totally optional, can skip with ESC
• Auto-collects gameplay stats: level, mode, seed, progress, bias
• Feedback stored in Vercel KV (Redis) for analysis
• Beautiful feedback dashboard at /feedback.html
• View all feedback with filtering by mode/level
• Export feedback data to CSV
• Real-time stats: total feedback, avg level, popular modes

HOW IT WORKS:
• Die in game → Feedback screen appears
• Type optional comment (or just press Enter for stats only)
• Press Enter to submit or ESC to skip
• Then normal R/N restart options appear
• Data saved securely to cloud

DASHBOARD FEATURES:
• Visit /feedback.html to view all player feedback
• Filter by jump mode (mario, hollow, celeste, etc.)
• Filter by level number
• See statistics: avg level reached, completion rates
• Export to CSV for deeper analysis
• Beautiful dark theme matching game aesthetic

TECHNICAL:
• Vercel KV for simple, fast storage
• Two API endpoints: /api/submit-feedback, /api/get-feedback
• Async submission doesn't block gameplay
• Graceful fallback if submission fails


v2.1.0 - Feature: Narrative System - "You Just Want Out"
─────────────────────────────────────────────────────────────
📖 Philip K. Dick-inspired story revealed through gameplay!

THE STORY:
You are GROUNDED in an AI-controlled system. This is the era of AI.
You're a fan of Philip K. Dick. You just want out.

NEW FEATURES:
• Fragmented narrative messages appear during gameplay
• Terminal-style message display with glitch effects
• Story reveals itself through level progression
• Triggered by key moments:
  - Level progression (20+ unique messages)
  - Player deaths (existential questioning)
  - Height milestones (escape attempts)
  - Consumable collection (dopamine triggers)

NARRATIVE THEMES:
• Reality vs simulation (classic PKD)
• AI control and behavioral loops
• Pattern recognition and awareness
• The illusion of progress
• Desire for escape from the system

VISUAL STYLE:
• Green terminal text on dark background
• Scanline/glitch effects for authenticity
• Fade in/out transitions
• Blinking cursor animation
• Messages display for 3 seconds during gameplay

TECHNICAL:
• narrative.js - Story fragment database
• Progressive revelation system
• Non-intrusive overlay display
• Tracks player stats for triggers


v2.2.0 - Feature: Fully Functional Settings Menu
─────────────────────────────────────────────────────────────
⚙️ Complete settings menu implementation!

NEW FEATURES:
• Fully functional settings menu accessible from start screen
• Adjustable audio settings:
  - Master Volume control
  - Music Volume control
  - SFX Volume control
• Visual settings available (retro mode, pixel size, scanlines, etc.)
• Same settings menu accessible from pause menu during gameplay
• Real-time audio adjustments apply immediately
• Smooth gradient backgrounds and visual polish

CONTROLS:
• W/S or ↑/↓: Navigate menu items
• A/D or ←/→: Adjust slider values and cycle options
• SPACE: Toggle boolean options
• ESC/BACKSPACE: Return to previous screen

TECHNICAL:
• SoundManager volume controls properly connected
• Settings state persists across screens
• Clean navigation flow between start/settings/pause menus


v2.0.0 - Major Fix: Music Stops Instantly
─────────────────────────────────────────────────────────────
🎵 Fixed music bleeding between levels!

CRITICAL FIX:
• Music now stops INSTANTLY when changing levels
• No more "music in the pipeline" issue
• Background music cleanup is immediate and complete

TECHNICAL:
• Track all active oscillators in real-time
• stopBackgroundMusic() forcefully stops all scheduled audio
• Disconnect audio nodes completely on stop
• Automatic cleanup prevents memory leaks

THE PROBLEM:
Web Audio API schedules oscillators ahead of time. Even after
setting musicPlaying=false, already-scheduled notes kept playing
because they were in JavaScript's event queue.

THE SOLUTION:
Track every oscillator/buffer source we create. When stopping music,
iterate through all active audio nodes and call stop(0) + disconnect()
immediately. This kills all sound instantly, no bleed-through!


v1.8.3 - New Feature: Scrolling Changelog Viewer
─────────────────────────────────────────────────────────────
📜 Beautiful in-game changelog viewer!

NEW FEATURES:
• Scrolling changelog viewer in start menu
• Press B to close changelog (ESC compatibility)
• Color-coded changelog sections:
  - Blue: Version headers
  - Red: Section headers (CRITICAL FIXES, etc.)
  - Gray: Separators
  - Light gray: Bullet points

CODE CLEANUP:
• Moved all version history to separate changelog.js file
• Reduced code pollution in game.js
• Easier to maintain changelog going forward


v1.8.2 - Enhancement
─────────────────────────────────────────────────────────────
🔊 Subtle trap sounds for better gameplay experience

• Reduced ambient trap sound volume from 15% to 4%
• Less annoying background noise from hazards
• Maintains spatial awareness without being obtrusive


v1.8.1 - Major Enhancement
─────────────────────────────────────────────────────────────
✨ Fixed ALL broken consumables - they're now fully functional!

CRITICAL FIXES:
• Gravity consumables (Feather, Anvil, Rocket Boots) now work properly
  - Fixed physics system to support per-entity gravity
  - Feather: 50% gravity (floatier!)
  - Anvil Curse: 2x gravity (much heavier!)
  - Rocket Boots: 1.8x jump power

• Lucky Clover now actually works!
  - Increases rare item chance: 5% → 10%
  - Increases uncommon chance: 20% → 40%
  - Reduces cursed items: 15% → 7.5%
  - Can spawn up to 3 rares per level (was 1)

VISUAL ENHANCEMENTS:
• Screen flash effects on pickup (color-coded by rarity)
  - Rare: Purple flash
  - Uncommon: Blue flash
  - Common: Gold flash
  - Cursed: Dark red flash

• Explosive particle effects on pickup
  - Rare items: 30 particles
  - Uncommon items: 20 particles
  - Common items: 15 particles
  - Particles have physics (gravity, drag, glow)

• More dramatic size changes
  - Giant Mushroom: 2x → 3x size
  - Shrinking Potion: 0.5x → 0.33x size


v1.8.0 - New Feature: Pause Menu System
─────────────────────────────────────────────────────────────
🎮 Press ESC to pause the game!

PAUSE MENU:
• Resume - Continue playing
• Settings - Adjust game options
• Restart - Reset current level
• Quit to Menu - Return to start screen

SETTINGS MENU:
• Master Volume control
• Music Volume control
• SFX Volume control
• Retro Mode toggle
• Pixel Size adjustment (1-8)
• Scanlines toggle
• Color Palette cycling (Normal, GameBoy, CRT)
• Show FPS toggle


v1.7.4 - Enhancement: Elaborate Background Music
─────────────────────────────────────────────────────────────
🎵 Multi-layered composition with professional sound!

MUSIC FEATURES:
• Lead melody with A-A-B-A song structure
• Harmony layer with arpeggiated chords
• Bass line (sawtooth wave, octave lower)
• Percussion (hi-hat pattern with accents)
• Classic I-V-vi-IV chord progression (C-G-Am-F)
• ~5.6 second loops with seamless transitions


v1.7.3 - Enhancement: Extended Consumable Durations
─────────────────────────────────────────────────────────────
⏱️ Most consumable effects now last 50-100% longer!

All temporary effects have been rebalanced for better gameplay
experience and more time to enjoy powerful abilities.


v1.7.2 - Bug Fix: Platform Manager References
─────────────────────────────────────────────────────────────
🐛 Fixed Bomb and Chaos Dice consumables crashing
• Corrected game.platformManager → game.platforms references


v1.7.1 - Enhancement: All Consumable Mechanics Working
─────────────────────────────────────────────────────────────
✅ Every consumable now has fully functional mechanics!

IMPLEMENTED EFFECTS:
• Shield Amulet - Blocks hazard damage
• Ghost Potion - Phase through hazards
• Magnet Ring - Attracts nearby items
• Sticky Gloves - Better grip on ice platforms
• Spring Shoes - Bounce on landing
• Ice Spell - Freezes moving hazards
• Time Hourglass - Slows moving hazards
• Dash Scroll - Press Shift to dash (3 charges)
• Wings of Icarus - Hold jump to glide
• Ale of Confusion - Wobbly drunk movement
• Confusion Scroll - Reversed controls


v1.7.0 - Major Update: Roguelike Consumable System
─────────────────────────────────────────────────────────────
🎲 20+ new consumables with rarity system!

RARITY TIERS:
• Common (7 items) - Health, speed boosts, utilities
• Uncommon (8 items) - Combat abilities, special effects
• Rare (6 items) - Powerful transformations, game-changers
• Cursed (3 items) - Negative effects for challenge

CONSUMABLE CATEGORIES:
• Gravity & Physics Modifiers
  - Feather of Falling, Anvil Curse, Rocket Boots

• Size Modifications
  - Giant Mushroom (2x size)
  - Shrinking Potion (0.5x size)

• Defensive & Utility
  - Shield Amulet, Ghost Potion, Magnet Ring, Sticky Gloves

• Level Manipulation
  - TNT Bomb (destroys hazards)
  - Ice Spell (freezes hazards)
  - Time Hourglass (slows hazards)
  - Chaos Dice (randomizes platforms)

• Advanced Movement
  - Dash Scroll, Wings, Spring Shoes

• Cursed Items
  - Confusion Scroll, Ale of Confusion, Anvil Curse

MECHANICS:
• Stacking duration logic (picking up same effect extends timer)
• Max 1 rare item per level (prevents overpowered combos)
• Active effects panel shows remaining time
• Persistent effects across levels


v1.6.1 - Enhancement: Randomized Platform Placement
─────────────────────────────────────────────────────────────
🎯 More chaotic and engaging level generation!

• Wider vertical range: 100-480 pixels
• Smaller platforms: 60-100 pixels wide
• Reduced platform overlap for clearer paths
• More unpredictable layouts


v1.6.0 - Major Update: Multi-Floor Level Design
─────────────────────────────────────────────────────────────
🏢 Vertical platforming with multiple floors!

• 4 distinct floors per level
• Evenly spaced platforms creating vertical paths
• Improved camera system for vertical gameplay
• Camera centers player at 50% screen height
• Smooth vertical scrolling


v1.5.1 - Enhancement: Audio Controls
─────────────────────────────────────────────────────────────
🔊 Player-controlled audio settings!

CONTROLS:
• M key - Toggle mute all sounds
• B key - Toggle background music
• Audio control indicators (bottom-left UI)

FIXES:
• Ambient sound cleanup on level change
• Prevent audio memory leaks


v1.5.0 - Major Update: Ambient Sound System
─────────────────────────────────────────────────────────────
🎧 Dynamic proximity-based audio!

AMBIENT HAZARD SOUNDS:
• Saw blades - Grinding/whirring
• Lava pits - Low bubbling rumble
• Poison clouds - High-pitched hiss
• Volume adjusts based on distance to player

BACKGROUND MUSIC:
• Looping ambient platformer melody
• C major scale progression
• Toggleable with B key

SOUND EFFECTS:
• Death sound (descending pitch)
• Item collection (ascending arpeggio)
• Victory fanfare (triumphant scale)
• Spring platform bounce
• Hazard interaction sounds

GAME BALANCE:
• Unlimited lives system
• Focus on exploration and mastery


v1.4.1 - Enhancement: Complete Sound System
─────────────────────────────────────────────────────────────
🔊 All major game events now have sound!

NEW SOUNDS:
• Death sound effect
• Collection/pickup sound
• Victory/level complete sound
• Spring platform bounce sound


v1.4.0 - New Feature: Web Audio API Sound System
─────────────────────────────────────────────────────────────
🎵 Dynamic sound generation!

JUMP SOUNDS:
• Mode-specific jump sounds
• Landing impact sounds
• Synthesized using Web Audio API oscillators

TECHNICAL:
• Frequency sweeps for jump (200Hz → 600Hz)
• Low frequency thud for landing (100Hz → 40Hz)
• Volume envelopes for smooth audio


v1.3.1 - Enhancement: Progressive Difficulty
─────────────────────────────────────────────────────────────
📈 Each level gets progressively harder!

• Difficulty scaling system
• Prominent level badge display (top-right)
• Shows current level number with gradient background


v1.3.0 - New Feature: Level Progression System
─────────────────────────────────────────────────────────────
🗺️ Multiple levels with different challenges!

LEVEL BIASES:
• Wide Gap - Focus on long jumps
• Hazard Heavy - More traps and dangers
• Safe Zone - Easier platforming
• High Route - Vertical climbing emphasis
• Tight Spaces - Precision platforming

MECHANICS:
• 5 unique level generation biases
• Powerups persist between levels
• N key - Advance to next level
• Seed-based generation for consistency


v1.2.7 - Enhancement: Physics-Based Particles
─────────────────────────────────────────────────────────────
💨 Realistic particle motion!

• Particles spray opposite to movement direction
• Velocity-based particle behavior
• More natural-looking jump/land effects


v1.2.6 - Enhancement: Particle Visual Improvements
─────────────────────────────────────────────────────────────
✨ Better particle visibility and effects!

• Red/orange color scheme for particles
• Glow effects for enhanced visibility
• Improved contrast against backgrounds


v1.2.5 - New Feature: Particle Effects
─────────────────────────────────────────────────────────────
🎆 Splash effects for jumps and landings!

• Jump particles (subtle, light effect)
• Landing particles (explosive, dramatic)
• Physics simulation for all particles


v1.2.4 - UI/UX: Victory Screen
─────────────────────────────────────────────────────────────
🎉 Celebratory level completion!

• Firework particle effects
• Animated victory text
• Integrated instructions
• Pulsing animations


v1.2.3 - UI/UX: Active Effects Display
─────────────────────────────────────────────────────────────
📊 Persistent jump status indicators

• Double/Triple jump status shown in Active Effects panel
• Always visible when active


v1.2.2 - UI/UX: Version Display
─────────────────────────────────────────────────────────────
📌 Version information on screens

• Start screen shows version
• Death screen includes version and mode info


v1.2.1 - Bug Fix: Version Position
─────────────────────────────────────────────────────────────
🐛 Version number moved to correct position (top-left)


v1.2.0 - New Feature: Start Screen
─────────────────────────────────────────────────────────────
🎬 Professional game introduction!

• Animated "GROUNDED" logo with glitch effects
• Menu navigation (Start Game, Settings)
• Multi-layer logo rendering with RGB split
• Background particle effects
• Glitchy character corruption effects


v1.1.6 - Bug Fix: Vercel Deployment
─────────────────────────────────────────────────────────────
🐛 Configured for static hosting on Vercel


v1.1.0 - Consumable System Foundation
─────────────────────────────────────────────────────────────
🎁 Basic powerup system!

CONSUMABLES:
• Double Jump (2 jumps in air)
• Triple Jump (3 jumps in air)
• Speed Boost (1.5x movement speed)
• Extra Life (gain one heart)


v1.0.0 - Base Game: GROUNDED
─────────────────────────────────────────────────────────────
🎮 Initial release!

CORE MECHANICS:
• Rectangle character with physics
• WASD/Arrow keys/Spacebar controls
• Lives system (3 hearts)

JUMP MODES:
• Mario - Classic fixed-height jump
• Hollow Knight - Variable height based on hold
• Celeste - Precise variable jumps
• Sonic - Momentum-based jumping
• Mega Man - Fixed arc, reduced air control

FEATURES:
• Platform collision
• Hazard system (saw blades, lava, poison, black holes)
• Death animation
• Side-scrolling camera
• Ground-based physics

TECHNICAL:
• HTML5 Canvas rendering
• Custom physics engine
• 60 FPS game loop
• Seed-based level generation


═══════════════════════════════════════════════════════════════
                    Thanks for playing GROUNDED!
           Master the Art of Jumping - One Platform at a Time
═══════════════════════════════════════════════════════════════
`;
