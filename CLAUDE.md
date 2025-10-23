# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a simple Node.js game project for learning different jump mechanics. The game features a controllable rectangle character that can move and jump using WASD, arrow keys, or spacebar controls.

## Development Commands
- `npm install` - Install dependencies
- `npm start` - Start the game development server
- `npm run dev` - Start with auto-reload for development

## Project Structure
**All files in ROOT directory:**
- `game.js` - Main game logic and engine
- `player.js` - Player character implementation
- `physics.js` - Physics and movement mechanics
- `platforms.js` - Platform and hazard management
- `consumables.js` - Consumable/powerup system
- `index.html` - Game canvas and HTML structure
- `server.js` - Local development server (Express)
- `package.json` - Project dependencies and scripts
- `vercel.json` - Vercel deployment config
- `CLAUDE.md` - This file
- `VERSION_PROTOCOL.md` - Version update guidelines

**Important:** All game code lives in ROOT. No public/ directory. Keep it simple.

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
2. Add version note to `this.versionNotes` array (lines 5-10)
3. Follow semantic versioning (see VERSION_PROTOCOL.md)
4. Include version in commit message

**Quick Reference:**
- New feature → Bump MINOR (1.1.0 → 1.2.0)
- Bug fix → Bump PATCH (1.1.0 → 1.1.1)
- Major overhaul → Bump MAJOR (1.1.0 → 2.0.0)

See `VERSION_PROTOCOL.md` for complete guidelines.

## 🚨 CRITICAL: Deployment Rules

### Git Push Policy
**ALWAYS push commits to GitHub master automatically:**
- After making changes: `git add -A && git commit -m "..." && git push`
- Push immediately after each commit
- Keep GitHub repository up to date
- This pushes to `master` branch only (development)

### Production Deployment Policy
**Production deploys from `prod` branch via Vercel auto-deployment:**
- Vercel is configured to auto-deploy from the `prod` branch
- `master` branch = development (no auto-deploy)
- `prod` branch = production (auto-deploys to live site)

### Pushing to Production (User Request Only)
**When user explicitly requests production deployment:**
```bash
git push origin master:prod
```

**What this does:**
- Pushes current `master` branch to remote `prod` branch
- Triggers Vercel auto-deployment (prod branch is configured for production)
- Deploys latest code to live site at jumper-game.vercel.app
- Takes 30-60 seconds to build and deploy

**Check deployment status:**
```bash
vercel ls
```

**When to push to prod:**
- User explicitly says "push to prod" or "deploy to production"
- Major feature is complete and user wants it live
- Bug fix is ready and needs to go live
- User asks to see changes on the production site

**NEVER:**
- Push to prod without explicit user request
- Assume user wants immediate production deployment
- Deploy after every commit or change
- Use `vercel --prod` or `vercel deploy` commands manually

**After pushing to prod:**
- Wait 30-60 seconds for Vercel build to complete
- Run `vercel ls` to check deployment status
- Verify deployment shows "Ready" status
- Check: https://vercel.com/alexeystolybkos-projects/jumper/deployments
- Inform user deployment is complete with production URL

## 🔄 CRITICAL: Concurrent Session Management
**Multiple Claude Code sessions may be running simultaneously. Follow these rules to prevent conflicts:**

1. **ALWAYS check git status FIRST** before making ANY changes
   - Run `git status` to see what files have been modified by other sessions
   - Run `git log -1` to see the latest commit and version number
   - If files are modified or version is newer than expected, STOP and inform the user

2. **ALWAYS pull latest changes BEFORE making edits**
   - Run `git pull` before starting any work
   - Read files fresh after pulling to ensure you have latest content
   - Never assume file contents are current from previous reads

3. **COORDINATE version numbers**
   - Check current version in game.js BEFORE suggesting next version
   - If another session incremented version, use the NEXT available version
   - Never reuse or overwrite a version number that's already committed

4. **AVOID simultaneous file edits**
   - If git status shows uncommitted changes to files you need to edit, WARN the user
   - Ask user which session should handle the changes
   - Consider using different files or coordinating with user about which session does what

5. **READ files immediately before editing**
   - Always Read tool right before Edit tool to get latest content
   - File may have been modified by other session between your last read and now
   - If Edit tool fails due to file modification, inform user about conflict

6. **Commit frequently to reduce conflict window**
   - Smaller, focused commits reduce chance of conflicts
   - Push immediately after committing
   - This makes your changes visible to other sessions faster

7. **If conflicts occur:**
   - STOP immediately and inform the user
   - Show what files are in conflict
   - Let user decide how to resolve (merge, discard, coordinate sessions)
   - NEVER force-push or resolve conflicts automatically

**Example workflow:**
```bash
# 1. Check status first
git status
git log -1

# 2. Pull latest
git pull

# 3. Read file fresh
Read game.js

# 4. Make your changes
Edit game.js

# 5. Commit and push quickly
git add .
git commit -m "..."
git push
```

      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.
