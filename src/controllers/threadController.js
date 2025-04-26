const { extractMediaFromThread } = require('../services/threadService');
const NodeCache = require('node-cache');

// Setup cache with 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Extract media from a Threads post URL
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.extractMedia = async (req, res) => {
  try {
    // Get URL from request body (POST) or query (GET)
    const url = req.method === 'POST' ? req.body.url : req.query.url;
    
    if (!url) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Missing required parameter: url',
      });
    }

    // Validate URL format
    if (!isValidThreadsUrl(url)) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Invalid Threads URL format',
      });
    }

    // Check cache first
    const cacheKey = `thread:${url}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        status: 200,
        source: 'cache',
        data: cachedResult
      });
    }

    // If not in cache, extract media
    const media = await extractMediaFromThread(url);
    
    // Cache the result
    cache.set(cacheKey, media);
    
    return res.json({
      status: 200,
      source: 'live',
      data: media
    });
  } catch (error) {
    console.error(`Error extracting media: ${error.message}`);
    
    if (error.message === 'Failed to fetch thread' || error.message === 'Thread not found') {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'Thread not found or inaccessible',
      });
    }
    
    if (error.message === 'No media found in thread') {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'No media found in the thread',
      });
    }

    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: 'Failed to extract media from thread',
    });
  }
};

/**
 * Validate if the URL is a valid Threads URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL is valid
 */
function isValidThreadsUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === 'www.threads.net' || 
      parsedUrl.hostname === 'threads.net'
    ) && parsedUrl.pathname.split('/').length >= 3;
  } catch (error) {
    return false;
  }
} 