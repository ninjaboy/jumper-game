// Vercel Serverless Function to retrieve all feedback
// Fetches from Vercel KV and returns as JSON array

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all feedback IDs from sorted set (newest first)
    const feedbackIds = await kv.zrange('feedback:all', 0, -1, { rev: true });

    if (!feedbackIds || feedbackIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        feedback: []
      });
    }

    // Fetch all feedback entries
    const feedbackPromises = feedbackIds.map(id => kv.get(id));
    const feedbackEntries = await Promise.all(feedbackPromises);

    // Filter out any null entries (deleted feedback)
    const validFeedback = feedbackEntries.filter(entry => entry !== null);

    return res.status(200).json({
      success: true,
      count: validFeedback.length,
      feedback: validFeedback
    });

  } catch (error) {
    console.error('Error retrieving feedback:', error);
    return res.status(500).json({
      error: 'Failed to retrieve feedback',
      details: error.message
    });
  }
}
