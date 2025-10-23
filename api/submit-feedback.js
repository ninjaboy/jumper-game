// Vercel Serverless Function to submit player feedback
// Uses Vercel KV (Redis) for simple storage with fallback

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const feedback = req.body;

    // Validate required fields
    if (!feedback.timestamp || !feedback.level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique ID for this feedback entry
    const feedbackId = `feedback:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;

    const feedbackData = {
      ...feedback,
      id: feedbackId,
      submittedAt: new Date().toISOString()
    };

    // Try to use Vercel KV if available
    try {
      const { kv } = await import('@vercel/kv');

      // Store in Vercel KV
      await kv.set(feedbackId, feedbackData);

      // Also add to a sorted set for easy retrieval
      await kv.zadd('feedback:all', {
        score: Date.now(),
        member: feedbackId
      });

      return res.status(200).json({
        success: true,
        message: 'Feedback submitted successfully!',
        id: feedbackId,
        storage: 'kv'
      });
    } catch (kvError) {
      // KV not available - just acknowledge receipt
      console.log('KV not available, feedback logged to console:', feedbackData);

      return res.status(200).json({
        success: true,
        message: 'Feedback received (KV not configured)',
        id: feedbackId,
        storage: 'console',
        note: 'Set up Vercel KV to persist feedback'
      });
    }

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({
      error: 'Failed to submit feedback',
      details: error.message
    });
  }
}
