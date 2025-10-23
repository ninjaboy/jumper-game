// Vercel Serverless Function to get global play counter
// Uses Vercel Blob for persistent storage

import * as blob from '@vercel/blob';

export default async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify token exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN not found in environment');
    }

    // Read current play count
    let playCount = 0;
    let lastUpdated = null;
    try {
      const existingBlobs = await blob.list({
        prefix: 'play-count',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      if (existingBlobs.blobs.length > 0) {
        const response = await fetch(existingBlobs.blobs[0].url);
        const data = await response.json();
        playCount = data.count || 0;
        lastUpdated = data.lastUpdated || null;
      }
    } catch (readError) {
      console.log('No existing play count found');
    }

    return res.status(200).json({
      success: true,
      count: playCount,
      lastUpdated: lastUpdated
    });

  } catch (error) {
    console.error('Error getting play count:', error);
    return res.status(500).json({
      error: 'Failed to get play count',
      details: error.message
    });
  }
}
