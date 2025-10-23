// Vercel Serverless Function to increment global play counter
// Uses Vercel Blob for persistent storage

import * as blob from '@vercel/blob';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify token exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN not found in environment');
    }

    // Read current play count
    let playCount = 0;
    try {
      const existingBlobs = await blob.list({
        prefix: 'play-count',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      if (existingBlobs.blobs.length > 0) {
        const response = await fetch(existingBlobs.blobs[0].url);
        const data = await response.json();
        playCount = data.count || 0;
      }
    } catch (readError) {
      console.log('No existing play count, starting at 0');
    }

    // Increment
    playCount++;

    // Write updated count back to blob
    const blobResult = await blob.put('play-count.json', JSON.stringify({
      count: playCount,
      lastUpdated: new Date().toISOString()
    }), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    console.log('Play count incremented:', playCount);

    return res.status(200).json({
      success: true,
      count: playCount
    });

  } catch (error) {
    console.error('Error incrementing play count:', error);
    return res.status(500).json({
      error: 'Failed to increment play count',
      details: error.message
    });
  }
}
