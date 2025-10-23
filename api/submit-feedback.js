// Vercel Serverless Function to submit player feedback
// Uses Vercel KV (Redis) for simple storage

import { kv } from '@vercel/kv';

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

    // Store in Vercel KV
    await kv.set(feedbackId, {
      ...feedback,
      id: feedbackId,
      submittedAt: new Date().toISOString()
    });

    // Also add to a sorted set for easy retrieval
    await kv.zadd('feedback:all', {
      score: Date.now(),
      member: feedbackId
    });

    return res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully!',
      id: feedbackId
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({
      error: 'Failed to submit feedback',
      details: error.message
    });
  }
}
