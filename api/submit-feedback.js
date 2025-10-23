// Vercel Serverless Function to submit player feedback
// Uses Vercel Blob for persistent storage

import { put, list } from '@vercel/blob';

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
    const feedbackId = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const feedbackData = {
      ...feedback,
      id: feedbackId,
      submittedAt: new Date().toISOString()
    };

    // Use Vercel Blob for storage
    try {
      // Read existing feedback
      let allFeedback = [];
      try {
        const existingBlobs = await list({ prefix: 'feedback-data' });
        if (existingBlobs.blobs.length > 0) {
          const response = await fetch(existingBlobs.blobs[0].url);
          allFeedback = await response.json();
        }
      } catch (readError) {
        console.log('No existing feedback, starting fresh');
      }

      // Add new feedback
      allFeedback.unshift(feedbackData); // Add to beginning (newest first)

      // Keep only last 1000 entries to manage blob size
      if (allFeedback.length > 1000) {
        allFeedback = allFeedback.slice(0, 1000);
      }

      // Write updated feedback back to blob
      const blob = await put('feedback-data.json', JSON.stringify(allFeedback), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false
      });

      console.log('Blob created successfully:', blob.url);

      return res.status(200).json({
        success: true,
        message: 'Feedback submitted successfully!',
        id: feedbackId,
        storage: 'blob'
      });
    } catch (blobError) {
      // Blob error - log details
      console.error('Blob error:', blobError.message, blobError.stack);
      console.error('BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);

      return res.status(200).json({
        success: true,
        message: 'Feedback received (Blob error)',
        id: feedbackId,
        storage: 'console',
        error: blobError.message,
        hasToken: !!process.env.BLOB_READ_WRITE_TOKEN
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
