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

    // Validate URL format and normalize it
    const normalizedUrl = normalizeThreadsUrl(url);
    
    if (!normalizedUrl) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Invalid Threads URL format',
      });
    }

    // Check cache first (using normalized URL as key)
    const cacheKey = `thread:${normalizedUrl}`;
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      return res.json({
        status: 200,
        source: 'cache',
        data: cachedResult
      });
    }

    // If not in cache, extract media
    const media = await extractMediaFromThread(normalizedUrl);
    
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
 * Normalize various Threads URL formats into a standard format
 * @param {string} url - The Threads URL in any supported format
 * @returns {string|null} - Normalized URL or null if invalid
 */
function normalizeThreadsUrl(url) {
  try {
    const parsedUrl = new URL(url);
    
    // Check if it's a valid Threads domain
    if (!['threads.net', 'www.threads.net', 'threads.com', 'www.threads.com'].includes(parsedUrl.hostname)) {
      return null;
    }
    
    // Split the pathname into parts
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    
    // Handle different URL formats
    
    // 1. Main post: https://www.threads.net/@username/post/123456789
    // 2. Reply: https://www.threads.net/@username/post/123456789/reply/123456789
    // 3. Comment: https://www.threads.net/@username/post/123456789/comment/123456789
    // 4. Intent URL: https://www.threads.net/intent/post?text=...
    
    // Handle intent URLs separately (we don't process these for extraction)
    if (pathParts[0] === 'intent') {
      return null;
    }
    
    // Check if the URL has the minimum required parts
    if (pathParts.length < 3) {
      return null;
    }
    
    const username = pathParts[0];
    
    // Check if username starts with @
    if (!username.startsWith('@')) {
      return null;
    }
    
    // Check if second part is 'post'
    if (pathParts[1] !== 'post') {
      return null;
    }
    
    // Get the post ID
    const postId = pathParts[2];
    
    // For replies and comments, we need to go back to the original post
    // as that's where the media will be
    if (pathParts.length > 3 && ['reply', 'comment'].includes(pathParts[3])) {
      // Main post contains the media, so we get that URL
      return `https://www.threads.net/${username}/post/${postId}`;
    }
    
    // Standard post URL
    return `https://www.threads.net/${username}/post/${postId}`;
  } catch (error) {
    return null;
  }
}

/**
 * Validate if the URL is a valid Threads URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL is valid
 */
function isValidThreadsUrl(url) {
  return normalizeThreadsUrl(url) !== null;
} 