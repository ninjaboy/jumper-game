// Vercel Serverless Function to retrieve all feedback
// Fetches from Vercel Blob and returns as JSON array

import { list } from '@vercel/blob';

export default async function handler(req, res) {
  // Allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use Vercel Blob for storage
    try {
      // Get the feedback blob
      const existingBlobs = await list({ prefix: 'feedback-data' });

      if (existingBlobs.blobs.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          feedback: [],
          storage: 'blob'
        });
      }

      // Fetch the feedback data
      const response = await fetch(existingBlobs.blobs[0].url);
      const allFeedback = await response.json();

      return res.status(200).json({
        success: true,
        count: allFeedback.length,
        feedback: allFeedback,
        storage: 'blob'
      });
    } catch (blobError) {
      // Blob not available - return empty array
      return res.status(200).json({
        success: true,
        count: 0,
        feedback: [],
        storage: 'console',
        note: 'Set up Vercel Blob to persist feedback. Check Vercel logs for console output.'
      });
    }

  } catch (error) {
    console.error('Error retrieving feedback:', error);
    return res.status(500).json({
      error: 'Failed to retrieve feedback',
      details: error.message
    });
  }
}
