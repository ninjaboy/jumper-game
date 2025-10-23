const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(__dirname));

// Local in-memory feedback storage for development
let localFeedback = [];

// Mock API endpoint for local testing
app.post('/api/submit-feedback', (req, res) => {
    console.log('📝 Feedback received (LOCAL):', req.body);

    const feedbackData = {
        ...req.body,
        id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        submittedAt: new Date().toISOString()
    };

    localFeedback.unshift(feedbackData);

    // Keep only last 100 for local testing
    if (localFeedback.length > 100) {
        localFeedback = localFeedback.slice(0, 100);
    }

    console.log(`✅ Feedback stored locally (Total: ${localFeedback.length})`);
    console.log('   Level:', feedbackData.level, '| Mode:', feedbackData.jumpMode, '| Comment:', feedbackData.comment || '(none)');

    res.status(200).json({
        success: true,
        message: 'Feedback submitted successfully (LOCAL)',
        id: feedbackData.id,
        storage: 'local-memory',
        totalFeedback: localFeedback.length
    });
});

// Mock API endpoint to get feedback for local testing
app.get('/api/get-feedback', (req, res) => {
    console.log('📊 Feedback requested (LOCAL)');
    res.status(200).json({
        feedback: localFeedback,
        storage: 'local-memory',
        count: localFeedback.length
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎮 Game server running at http://localhost:${PORT}`);
    console.log('📝 Local feedback API available at /api/submit-feedback');
    console.log('📊 View feedback at /api/get-feedback');
    console.log('⚠️  Note: This uses in-memory storage (not Vercel Blob)');
    console.log('Press Ctrl+C to stop the server');
});