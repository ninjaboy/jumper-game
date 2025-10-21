# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a simple Node.js game project for learning different jump mechanics. The game features a controllable rectangle character that can move and jump using WASD, arrow keys, or spacebar controls.

## Development Commands
- `npm install` - Install dependencies
- `npm start` - Start the game development server
- `npm run dev` - Start with auto-reload for development

## Project Structure
- `game.js` - Main game logic and engine
- `player.js` - Player character implementation
- `physics.js` - Physics and movement mechanics
- `platforms.js` - Platform and hazard management
- `consumables.js` - Consumable/powerup system
- `index.html` - Game canvas and HTML structure
- `package.json` - Project dependencies and scripts
- `VERSION_PROTOCOL.md` - Version update guidelines

## Game Framework
Uses a lightweight HTML5 Canvas-based game framework for simplicity and educational purposes. The game loop handles rendering, input, and physics updates at 60 FPS.

## Key Concepts
- Gravity and physics simulation
- Input handling for multiple control schemes
- Jump mechanics with customizable parameters
- Frame-based animation and movement
- Consumable system for powerups and abilities

## ⚠️ IMPORTANT: Version Management
**When making ANY code changes to game features:**
1. Update version number in `game.js` constructor (line 4)
2. Add version note to `this.versionNotes` array (lines 5-8)
3. Follow semantic versioning (see VERSION_PROTOCOL.md)
4. Include version in commit message

**Quick Reference:**
- New feature → Bump MINOR (1.1.0 → 1.2.0)
- Bug fix → Bump PATCH (1.1.0 → 1.1.1)
- Major overhaul → Bump MAJOR (1.1.0 → 2.0.0)

See `VERSION_PROTOCOL.md` for complete guidelines.

      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.
