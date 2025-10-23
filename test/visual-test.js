#!/usr/bin/env node

/**
 * Visual Regression Testing for GROUNDED
 *
 * This script uses Puppeteer to:
 * 1. Start the game in a headless browser
 * 2. Navigate through different game states
 * 3. Capture screenshots at each state
 * 4. Compare against baseline images to detect visual regressions
 *
 * Usage:
 *   npm run test:visual              # Run comparison test
 *   npm run test:visual -- --update  # Update baseline images
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch').default || require('pixelmatch');

// Configuration
const CONFIG = {
    baseUrl: 'http://localhost:3000',
    screenshotDir: path.join(__dirname, 'screenshots'),
    viewportWidth: 800,
    viewportHeight: 600,
    pixelThreshold: 0.1, // 10% pixel difference tolerance (for animations)
    headless: true, // Set to false for debugging
};

// Test scenarios to capture
const SCENARIOS = [
    {
        name: '01-start-screen',
        description: 'Start screen with logo and menu',
        setup: async (page) => {
            await page.waitForSelector('canvas');
            await wait(1000); // Wait for logo animation to settle
        }
    },
    {
        name: '02-changelog-viewer',
        description: 'Changelog viewer',
        setup: async (page) => {
            // Navigate to changelog
            await page.keyboard.press('ArrowDown'); // Select Changelog
            await wait(200);
            await page.keyboard.press('Enter');
            await wait(500); // Wait for changelog to render
        }
    },
    {
        name: '03-changelog-close',
        description: 'Return to start screen',
        setup: async (page) => {
            await page.keyboard.press('KeyB'); // Close changelog
            await wait(300);
        }
    },
    {
        name: '04-settings-menu',
        description: 'Settings menu',
        setup: async (page) => {
            await page.keyboard.press('ArrowDown'); // Skip Start Game
            await page.keyboard.press('ArrowDown'); // Skip Changelog
            await wait(200);
            await page.keyboard.press('Enter'); // Open Settings
            await wait(500);
        }
    },
    {
        name: '05-settings-close',
        description: 'Return to start screen from settings',
        setup: async (page) => {
            await page.keyboard.press('Escape');
            await wait(300);
        }
    },
    {
        name: '06-gameplay-start',
        description: 'Initial gameplay state',
        setup: async (page) => {
            await page.keyboard.press('Enter'); // Start Game
            await wait(2000); // Wait for level generation
        }
    },
    {
        name: '07-gameplay-movement',
        description: 'Player movement and platforms',
        setup: async (page) => {
            // Move right for a bit
            await page.keyboard.down('KeyD');
            await wait(1000);
            await page.keyboard.up('KeyD');
            await wait(500);
        }
    },
    {
        name: '08-gameplay-jump',
        description: 'Player jumping',
        setup: async (page) => {
            // Jump
            await page.keyboard.press('Space');
            await wait(300); // Capture mid-jump
        }
    },
    {
        name: '09-pause-menu',
        description: 'Pause menu during gameplay',
        setup: async (page) => {
            await wait(500); // Wait to land
            await page.keyboard.press('Escape'); // Open pause menu
            await wait(500);
        }
    },
    {
        name: '10-pause-resume',
        description: 'Resume from pause',
        setup: async (page) => {
            await page.keyboard.press('Enter'); // Resume
            await wait(500);
        }
    }
];

// Helper: Ensure directory exists
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Helper: Wait for a given number of milliseconds
async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: Compare two PNG images
function compareImages(img1Path, img2Path, diffPath) {
    if (!fs.existsSync(img1Path)) {
        return { match: false, reason: 'baseline-missing', diff: 0 };
    }

    const img1 = PNG.sync.read(fs.readFileSync(img1Path));
    const img2 = PNG.sync.read(fs.readFileSync(img2Path));

    if (img1.width !== img2.width || img1.height !== img2.height) {
        return { match: false, reason: 'dimensions-mismatch', diff: 100 };
    }

    const diff = new PNG({ width: img1.width, height: img1.height });
    const numDiffPixels = pixelmatch(
        img1.data,
        img2.data,
        diff.data,
        img1.width,
        img1.height,
        { threshold: 0.1 }
    );

    // Save diff image
    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    const totalPixels = img1.width * img1.height;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;

    return {
        match: diffPercentage <= CONFIG.pixelThreshold,
        diffPixels: numDiffPixels,
        diffPercentage: diffPercentage.toFixed(2),
        reason: diffPercentage > CONFIG.pixelThreshold ? 'visual-regression' : 'match'
    };
}

// Main test runner
async function runVisualTests(updateBaseline = false) {
    console.log('🚀 GROUNDED Visual Regression Testing\n');
    console.log(`Mode: ${updateBaseline ? 'UPDATE BASELINE' : 'COMPARISON TEST'}`);
    console.log(`URL: ${CONFIG.baseUrl}`);
    console.log(`Viewport: ${CONFIG.viewportWidth}x${CONFIG.viewportHeight}`);
    console.log(`Scenarios: ${SCENARIOS.length}\n`);

    // Ensure directories exist
    ensureDir(path.join(CONFIG.screenshotDir, 'baseline'));
    ensureDir(path.join(CONFIG.screenshotDir, 'latest'));
    ensureDir(path.join(CONFIG.screenshotDir, 'diff'));

    // Launch browser
    const browser = await puppeteer.launch({
        headless: CONFIG.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({
        width: CONFIG.viewportWidth,
        height: CONFIG.viewportHeight
    });

    // Enable console logging from page (for debugging)
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Browser error:', msg.text());
        }
    });

    let results = [];
    let passed = 0;
    let failed = 0;

    try {
        // Navigate to game
        console.log('🌐 Loading game...');
        await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle2', timeout: 10000 });
        console.log('✅ Game loaded\n');

        // Run each test scenario
        for (const scenario of SCENARIOS) {
            console.log(`📸 ${scenario.name}: ${scenario.description}`);

            try {
                // Execute setup for this scenario
                await scenario.setup(page);

                // Take screenshot
                const screenshotPath = path.join(CONFIG.screenshotDir, 'latest', `${scenario.name}.png`);
                await page.screenshot({ path: screenshotPath });

                if (updateBaseline) {
                    // Copy to baseline
                    const baselinePath = path.join(CONFIG.screenshotDir, 'baseline', `${scenario.name}.png`);
                    fs.copyFileSync(screenshotPath, baselinePath);
                    console.log(`   ✅ Baseline updated\n`);
                    results.push({ name: scenario.name, status: 'baseline-updated' });
                } else {
                    // Compare with baseline
                    const baselinePath = path.join(CONFIG.screenshotDir, 'baseline', `${scenario.name}.png`);
                    const diffPath = path.join(CONFIG.screenshotDir, 'diff', `${scenario.name}.png`);

                    const comparison = compareImages(baselinePath, screenshotPath, diffPath);

                    if (comparison.match) {
                        console.log(`   ✅ PASS (${comparison.diffPercentage}% diff)\n`);
                        passed++;
                        results.push({ name: scenario.name, status: 'pass', ...comparison });
                    } else {
                        console.log(`   ❌ FAIL: ${comparison.reason} (${comparison.diffPercentage}% diff)\n`);
                        failed++;
                        results.push({ name: scenario.name, status: 'fail', ...comparison });
                    }
                }
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}\n`);
                failed++;
                results.push({ name: scenario.name, status: 'error', error: error.message });
            }
        }

    } catch (error) {
        console.error('💥 Fatal error:', error);
        throw error;
    } finally {
        await browser.close();
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));

    if (updateBaseline) {
        console.log(`✅ ${SCENARIOS.length} baseline screenshots updated`);
    } else {
        console.log(`Total: ${SCENARIOS.length}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`Success Rate: ${((passed / SCENARIOS.length) * 100).toFixed(1)}%`);

        if (failed > 0) {
            console.log('\n❌ FAILED SCENARIOS:');
            results.filter(r => r.status === 'fail' || r.status === 'error').forEach(r => {
                console.log(`   - ${r.name}: ${r.reason || r.error}`);
            });
        }
    }
    console.log('='.repeat(60) + '\n');

    // Save results to JSON
    const resultsPath = path.join(CONFIG.screenshotDir, 'test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        mode: updateBaseline ? 'baseline-update' : 'comparison',
        total: SCENARIOS.length,
        passed,
        failed,
        results
    }, null, 2));

    console.log(`📄 Full results saved to: ${resultsPath}\n`);

    // Exit with appropriate code
    if (!updateBaseline && failed > 0) {
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const updateBaseline = args.includes('--update') || args.includes('-u');

// Run tests
runVisualTests(updateBaseline).catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
});
