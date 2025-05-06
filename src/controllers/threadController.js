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

    // Create a simplified error response that works better with Shortcuts
    const errorResponse = {
      status: 500,
      error: true,
      message: 'Failed to extract media from thread',
      data: {
        url: url || 'unknown',
        timestamp: new Date().toISOString(),
        media: {
          images: [],
          videos: [],
          count: {
            images: 0,
            videos: 0,
            total: 0
          }
        },
        error_details: error.message
      }
    };

    if (error.message === 'Failed to fetch thread' || error.message === 'Thread not found' || error.message === 'Thread not found or page error') {
      errorResponse.status = 404;
      errorResponse.message = 'Thread not found or inaccessible';
      return res.status(404).json(errorResponse);
    }

    if (error.message === 'No media found in thread') {
      errorResponse.status = 404;
      errorResponse.message = 'No media found in the thread';
      return res.status(404).json(errorResponse);
    }

    return res.status(500).json(errorResponse);
  }
};

/**
 * Normalize various Threads URL formats into a standard format
 * @param {string} url - The Threads URL in any supported format
 * @returns {string|null} - Normalized URL or null if invalid
 */
function normalizeThreadsUrl(url) {
  try {
    let parsedUrl = new URL(url);

    // Check if it's a valid Threads domain (only threads.com now)
    if (!['threads.com', 'www.threads.com'].includes(parsedUrl.hostname)) {
      // If it's threads.net, convert to threads.com
      if (['threads.net', 'www.threads.net'].includes(parsedUrl.hostname)) {
        url = url.replace('threads.net', 'threads.com');
        // Create a new URL object with the updated URL
        parsedUrl = new URL(url);
      } else {
        return null;
      }
    }

    // Remove any query parameters as they may interfere with parsing
    const urlWithoutParams = `${parsedUrl.origin}${parsedUrl.pathname}`;

    // Split the pathname into parts
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

    // Handle different URL formats

    // 1. Main post: https://www.threads.com/@username/post/123456789
    // 2. Reply: https://www.threads.com/@username/post/123456789/reply/123456789
    // 3. Comment: https://www.threads.com/@username/post/123456789/comment/123456789
    // 4. Intent URL: https://www.threads.com/intent/post?text=...
    // 5. Short URL format: https://www.threads.com/t/123456789

    // Handle intent URLs separately (we don't process these for extraction)
    if (pathParts[0] === 'intent') {
      return null;
    }

    // Handle short URL format (t/CODE)
    if (pathParts[0] === 't' && pathParts.length > 1) {
      // For short URLs, we keep them as is but ensure they use threads.com
      return `https://www.threads.com/t/${pathParts[1]}`;
    }

    // Check if the URL has the minimum required parts for standard format
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
      return `https://www.threads.com/${username}/post/${postId}`;
    }

    // Standard post URL (always normalize to threads.com domain)
    return `https://www.threads.com/${username}/post/${postId}`;
  } catch (error) {
    console.error('URL normalization error:', error.message);
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