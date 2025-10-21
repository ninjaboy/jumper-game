# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
t
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
- `index.html` - Game canvas and HTML structure
- `package.json` - Project dependencies and scripts

## Game Framework
Uses a lightweight HTML5 Canvas-based game framework for simplicity and educational purposes. The game loop handles rendering, input, and physics updates at 60 FPS.

## Key Concepts
- Gravity and physics simulation
- Input handling for multiple control schemes
- Jump mechanics with customizable parameters
- Frame-based animation and movement