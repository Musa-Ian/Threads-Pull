const puppeteer = require('puppeteer');

/**
 * Extract media from a Threads post URL
 * @param {string} url - The Threads post URL
 * @returns {Object} - Object containing media arrays (images, videos)
 */
exports.extractMediaFromThread = async (url) => {
  let browser = null;
  
  try {
    // Launch browser with appropriate options
    const options = process.env.NODE_ENV === 'production' 
      ? { 
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: 'new' 
        }
      : { headless: 'new' };
    
    browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    
    // Set user agent to prevent detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to URL with timeout
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for content to load
    await page.waitForSelector('img, video', { timeout: 10000 }).catch(() => {
      throw new Error('Thread not found');
    });
    
    // Extract all media URLs
    const mediaData = await page.evaluate(() => {
      const images = [];
      const videos = [];
      
      // Extract images (excluding profile pictures, icons, etc.)
      document.querySelectorAll('img').forEach(img => {
        // Filter out small images (likely UI elements)
        const { width, height } = img.getBoundingClientRect();
        if (width > 100 && height > 100 && img.src) {
          // Clean the URL to get the highest quality version
          let src = img.src;
          
          // Remove query parameters that reduce image quality
          if (src.includes('?')) {
            src = src.split('?')[0];
          }
          
          if (!images.includes(src)) {
            images.push(src);
          }
        }
      });
      
      // Extract videos
      document.querySelectorAll('video').forEach(video => {
        if (video.src && !videos.includes(video.src)) {
          videos.push(video.src);
        }
        
        // Some videos are in source elements
        video.querySelectorAll('source').forEach(source => {
          if (source.src && !videos.includes(source.src)) {
            videos.push(source.src);
          }
        });
      });
      
      return { images, videos };
    });
    
    // Check if any media was found
    if (mediaData.images.length === 0 && mediaData.videos.length === 0) {
      throw new Error('No media found in thread');
    }
    
    return {
      url: url,
      timestamp: new Date().toISOString(),
      media: {
        images: mediaData.images,
        videos: mediaData.videos,
        count: {
          images: mediaData.images.length,
          videos: mediaData.videos.length,
          total: mediaData.images.length + mediaData.videos.length
        }
      }
    };
  } catch (error) {
    console.error(`Error in thread service: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}; 