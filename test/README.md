# Visual Regression Testing for GROUNDED

Automated screenshot-based testing to catch visual breakages before they reach production.

## 🎯 What This Does

This test suite:
1. Launches the game in a headless browser (Puppeteer)
2. Navigates through 10 critical game states
3. Takes screenshots at each state
4. Compares them against baseline "golden" images
5. Reports any visual regressions

## 🚀 Quick Start

### First Time Setup
```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Start the game server in one terminal
npm start

# 3. In another terminal, create baseline screenshots
npm run test:visual:update
```

### Running Tests
```bash
# Make sure the server is running (npm start)

# Run visual regression tests
npm run test:visual

# Update baseline images (after intentional UI changes)
npm run test:visual:update

# Run with visible browser (for debugging)
npm run test:visual:headful
```

## 📸 Test Scenarios

The test captures these game states:

1. **Start Screen** - Logo, menu items
2. **Changelog Viewer** - Scrolling changelog display
3. **Changelog Close** - Return to menu
4. **Settings Menu** - Settings UI
5. **Settings Close** - Return to menu
6. **Gameplay Start** - Initial level generation
7. **Gameplay Movement** - Player movement, platforms
8. **Gameplay Jump** - Player jumping with particles
9. **Pause Menu** - In-game pause overlay
10. **Pause Resume** - Return to gameplay

## 📊 Understanding Results

### ✅ Test Passes When:
- Visual difference is ≤ 10% (accounts for animation variance)
- All UI elements are in correct positions
- No missing or broken assets

### ❌ Test Fails When:
- Baseline image is missing
- Visual difference > 10% threshold
- Dimensions don't match
- Layout breakage detected

### Output Files:
- `screenshots/baseline/` - Golden reference images (committed to git)
- `screenshots/latest/` - Current test run (ignored by git)
- `screenshots/diff/` - Visual diff highlighting changes (ignored by git)
- `test-results.json` - Detailed test results (ignored by git)

## 🔧 Configuration

Edit `test/visual-test.js` to customize:

```javascript
const CONFIG = {
    baseUrl: 'http://localhost:3000',  // Game server URL
    viewportWidth: 800,                 // Browser viewport
    viewportHeight: 600,
    pixelThreshold: 0.1,               // 10% tolerance
    headless: true                      // Headless mode
};
```

## 🐛 Debugging Failed Tests

1. **View the diff images:**
   ```bash
   open test/screenshots/diff/
   ```
   Red pixels show differences from baseline.

2. **Run with visible browser:**
   ```bash
   npm run test:visual:headful
   ```
   Watch the test execute in a real browser.

3. **Check test results JSON:**
   ```bash
   cat test/screenshots/test-results.json
   ```

4. **Compare side-by-side:**
   - Baseline: `test/screenshots/baseline/XX-name.png`
   - Latest: `test/screenshots/latest/XX-name.png`
   - Diff: `test/screenshots/diff/XX-name.png`

## 📝 When to Update Baselines

Update baselines when you:
- ✅ Intentionally change UI/UX
- ✅ Add new visual features
- ✅ Modify colors, fonts, or layouts
- ✅ Change game assets or sprites

Don't update baselines for:
- ❌ Accidental visual regressions
- ❌ Broken layouts
- ❌ Missing assets
- ❌ Rendering bugs

## 🚨 CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Start game server
  run: npm start &

- name: Wait for server
  run: npx wait-on http://localhost:3000

- name: Run visual tests
  run: npm run test:visual

- name: Upload diff images on failure
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: visual-diff
    path: test/screenshots/diff/
```

## 🎯 Best Practices

1. **Always run tests before pushing** to catch visual breakages early
2. **Review diff images carefully** before updating baselines
3. **Keep baseline images up to date** after intentional UI changes
4. **Add new test scenarios** when adding new game states/screens
5. **Use descriptive scenario names** for easy debugging

## 🛠️ Troubleshooting

### "Browser not found" error
```bash
# Puppeteer may need manual Chrome installation
npx puppeteer browsers install chrome
```

### "Connection refused" error
```bash
# Make sure server is running
npm start
```

### Tests timeout
```bash
# Check if server is responding
curl http://localhost:3000
```

### Flaky tests (random failures)
- Increase wait times in scenario setup
- Adjust pixelThreshold (0.1 = 10%)
- Disable animations temporarily for testing

## 📚 Learn More

- [Puppeteer Documentation](https://pptr.dev/)
- [Pixelmatch](https://github.com/mapbox/pixelmatch) - Visual diff library
- [Visual Regression Testing Guide](https://www.browserstack.com/guide/visual-regression-testing)

---

**Remember:** You're like Yury Gagarin - first to catch bugs before they reach orbit! 🚀
