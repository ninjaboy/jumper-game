# Version Update Protocol

## 📋 Overview
This document defines the standard process for updating the game version and documenting new features.

## 🔢 Version Numbering (Semantic Versioning)
Use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.x.x): Breaking changes, major game overhauls
- **MINOR** (x.1.x): New features, significant additions
- **PATCH** (x.x.1): Bug fixes, small tweaks, balance changes

## ✅ Update Checklist

### 1. Update Version Number
**File:** `game.js` (lines 4-8)

```javascript
constructor() {
    // Version tracking
    this.version = '1.2.0';  // ← UPDATE THIS
    this.versionNotes = [
        'v1.2.0 - New Feature: Brief description',  // ← ADD THIS
        'v1.1.0 - Consumable System: Double/Triple Jump, Speed Boost, Extra Life',
        'v1.0.0 - Base Game: Multiple jump mechanics, hazards, lives system'
    ];
```

### 2. Write Version Note
Format: `v{VERSION} - {Category}: {Brief Description}`

**IMPORTANT: Keep changelog entries concise and user-focused**
- Focus on WHAT changed, not HOW or WHY
- Avoid technical implementation details
- Technical explanations belong in git commit messages
- Think: "What does the player experience?"

**Categories:**
- `New Feature` - Brand new gameplay element
- `Enhancement` - Improvement to existing feature
- `Bug Fix` - Fixed issues
- `Balance` - Gameplay balance changes
- `UI/UX` - Interface improvements
- `Performance` - Optimization
- `Content` - New levels, assets, etc.

**Good Examples (Concise, User-Focused):**
```
v1.2.0 - New Feature: Wall jumping mechanic
v1.1.5 - Bug Fix: Consumables now spawn correctly
v1.1.4 - Balance: Reduced double jump cooldown
v1.1.3 - UI/UX: Added consumable counter to HUD
```

**Bad Examples (Too Technical):**
```
❌ v1.1.5 - Bug Fix: Fixed race condition in consumable spawn system initialization
❌ v1.1.4 - Balance: Adjusted cooldownTime constant from 2000ms to 1500ms
❌ v1.1.3 - UI/UX: Refactored HUD rendering to use new consumable state manager
```

**Where to put technical details:**
- Git commit messages
- Code comments
- Documentation files
- NOT in user-facing changelogs

### 3. Commit Message Format
Use descriptive commit messages that reference the version:

```bash
git commit -m "v{VERSION}: {Feature Summary}

{Detailed description of changes}

Changes:
- Specific change 1
- Specific change 2
- Specific change 3

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## 📍 Version Display Locations

The version number appears in:
1. **Main HUD** (top-left corner, small gray text)
2. **Victory Screen** (bottom center)
3. **Game Over Screen** (bottom center)

## 🔄 Quick Reference: When to Bump Version

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| New consumable type | MINOR | 1.1.0 → 1.2.0 |
| New jump mechanic | MINOR | 1.1.0 → 1.2.0 |
| New hazard type | MINOR | 1.1.0 → 1.2.0 |
| Bug fix | PATCH | 1.1.0 → 1.1.1 |
| UI tweak | PATCH | 1.1.0 → 1.1.1 |
| Complete redesign | MAJOR | 1.1.0 → 2.0.0 |

## 🤖 Claude Code Default Action

**When making ANY update to the game, Claude should automatically:**

1. ✅ Increment the version number appropriately
2. ✅ Add a version note to `this.versionNotes` array
3. ✅ Include version in commit message
4. ✅ Ensure version displays correctly in UI

**Example Workflow:**
```
User: "Add a dash ability"

Claude:
1. Implements dash ability
2. Updates version: 1.1.0 → 1.2.0
3. Adds note: 'v1.2.0 - New Feature: Dash ability with cooldown'
4. Commits: "v1.2.0: Add dash ability with cooldown"
5. Informs user: "Updated to v1.2.0 with dash ability"
```

## 📝 Version History Template

Maintain this in `VERSION_PROTOCOL.md`:

### Version History
- **v1.1.0** (2025-10-21)
  - Consumable System: Double/Triple Jump, Speed Boost, Extra Life
  - Multi-jump support for all jump modes
  - Active effects UI panel
  - Pickup notifications with animations

- **v1.0.0** (2025-10-21)
  - Initial release
  - Multiple jump mechanics (Mario, Hollow Knight, Celeste, Sonic, Mega Man)
  - Hazards: Spikes, saw blades, lava pits, poison clouds
  - Lives system with death animations
  - Procedurally generated levels

---

## 🎯 Current Version
**v1.1.0** - Consumable System (2025-10-21)
