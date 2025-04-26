const puppeteer = require('puppeteer');

/**
 * Extract media from a Threads post URL
 * @param {string} url - The Threads post URL
 * @returns {Object} - Object containing media arrays (images, videos)
 */
exports.extractMediaFromThread = async (url) => {
  let browser = null;
  
  try {
    // Convert any threads.net URL to threads.com
    url = url.replace('threads.net', 'threads.com');
    
    // Launch browser with improved options for avoiding detection
    const options = {
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-features=IsolateOrigins,site-per-process', // Helps with iframe access
        '--disable-web-security', // For cross-origin media
        '--disable-features=BlockInsecurePrivateNetworkRequests' // May help with media loading
      ],
      headless: 'new',
      ignoreHTTPSErrors: true,
      defaultViewport: null // Let the viewport adapt to the page
    };
    
    browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    
    // Set modern Chrome user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    
    // Set extra HTTP headers to appear more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'sec-ch-ua': '"Google Chrome";v="124", "Not;A=Brand";v="8", "Chromium";v="124"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Referer': 'https://www.threads.com/'
    });
    
    // Set viewport to standard desktop size
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log(`Navigating to: ${url}`);
    
    // Navigate to URL with extended timeout and wait options
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Add a delay to let the page fully render (dynamic content)
    await page.waitForTimeout(3000);
    
    // Take a screenshot for debugging purposes
    const screenshotPath = `debug-threads-${new Date().getTime()}.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved debug screenshot to ${screenshotPath}`);
    
    // Check if we hit any known error pages or redirects
    const pageTitle = await page.title();
    if (pageTitle.includes('Page not found') || 
        pageTitle.includes('Error') || 
        pageTitle.includes('Content not available')) {
      throw new Error('Thread not found or page error');
    }
    
    // Wait for content to load with multiple selector strategies
    const contentSelectors = [
      // Primary content selectors
      '[data-visualcompletion="media-vc-image"]', // Modern Threads image selector
      'div[role="button"] img', // Images in interactive containers
      'video source', // Direct video sources
      
      // Additional selectors for the latest Threads.com structure
      'div[aria-label*="photo"] img', // Photos with aria labels
      'div[aria-label*="image"] img', // Images with aria labels
      'div[aria-label*="video"]', // Video containers
      'div[style*="transform"] img', // Styled image containers
      
      // Fallback selectors
      'article img', // Article images
      'div[style*="background-image"]', // Background images
      '[data-visualcompletion="ignore-dynamic"]', // Dynamic content containers
      'div[role="progressbar"] ~ img', // Images near loading indicators
      'video', // Video elements
      'img[style*="width: 100%"]', // Full-width images
      'div._acss img', // Common Threads class-based selectors
      'div._aagu img' // Another common Threads image container class
    ];
    
    // Try each selector until one works
    let contentFound = false;
    for (const selector of contentSelectors) {
      try {
        await page.waitForSelector(selector, { 
          timeout: 5000,
          visible: true 
        });
        console.log(`Found content with selector: ${selector}`);
        contentFound = true;
        break;
      } catch (error) {
        console.log(`Selector ${selector} not found, trying next...`);
      }
    }
    
    if (!contentFound) {
      console.log('Could not find content with primary selectors, using fallback approach');
      // Try a more aggressive approach - look for ANY large images
      try {
        await page.waitForFunction(() => {
          return document.querySelectorAll('img').length > 0;
        }, { timeout: 5000 });
        console.log('Found images using fallback approach');
        contentFound = true;
      } catch (error) {
        console.log('No images found even with fallback approach');
      }
    }
    
    // Perform multiple scrolls to ensure all content is loaded
    console.log('Scrolling to reveal all content...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await page.waitForTimeout(800); // Increased wait between scrolls
    }
    
    // Extract all media URLs with improved selectors targeting current Threads.com structure
    const mediaData = await page.evaluate(() => {
      const images = [];
      const videos = [];
      
      // Function to add unique URLs to our arrays
      const addUniqueUrl = (url, array) => {
        if (!url) return false;
        
        // Clean the URL to get the highest quality version
        let cleanUrl = url;
        
        // Handle URLs that are not absolute
        if (cleanUrl.startsWith('/')) {
          cleanUrl = 'https://www.threads.com' + cleanUrl;
        }
        
        // Handle data URLs - skip these
        if (cleanUrl.startsWith('data:')) {
          return false;
        }
        
        // Remove query parameters that might reduce quality
        if (cleanUrl.includes('?')) {
          // For CDN images, keep parameters that might specify size/quality
          if (!cleanUrl.includes('cdn') && !cleanUrl.includes('fbcdn')) {
            cleanUrl = cleanUrl.split('?')[0];
          }
        }
        
        // Add only if not already present
        if (!array.includes(cleanUrl)) {
          array.push(cleanUrl);
          return true;
        }
        
        return false;
      };
      
      // IMAGES EXTRACTION
      
      // 1. Primary image extraction method - data attributes (modern Threads)
      document.querySelectorAll('[data-visualcompletion="media-vc-image"]').forEach(img => {
        if (img.src) addUniqueUrl(img.src, images);
      });
      
      // 2. Image containers with specific roles or aria-labels
      document.querySelectorAll('div[role="button"][aria-label*="photo"], div[aria-label*="image"]').forEach(container => {
        const img = container.querySelector('img');
        if (img && img.src) addUniqueUrl(img.src, images);
      });
      
      // 3. Standard img tags with size filtering
      document.querySelectorAll('img').forEach(img => {
        // Get actual rendered size
        const { width, height } = img.getBoundingClientRect();
        
        // Check if image is likely a post image (larger size, visible, and not profile)
        if (width > 200 && height > 200 && img.src && 
            !img.src.includes('profile_pic') && 
            !img.src.includes('avatar') &&
            !img.src.includes('icon') &&
            !img.src.toLowerCase().includes('emoji') &&
            img.style.display !== 'none' && 
            img.style.visibility !== 'hidden') {
          addUniqueUrl(img.src, images);
        }
      });
      
      // 4. Check for background images that might contain media
      document.querySelectorAll('div[style*="background-image"]').forEach(div => {
        const style = div.getAttribute('style');
        if (style) {
          const match = style.match(/url\(['"]?(.*?)['"]?\)/);
          if (match && match[1]) {
            const bgUrl = match[1];
            // Filter out small background images that are likely UI elements
            const { width, height } = div.getBoundingClientRect();
            if (width > 200 && height > 200 && 
                !bgUrl.includes('profile_pic') && 
                !bgUrl.includes('avatar')) {
              addUniqueUrl(bgUrl, images);
            }
          }
        }
      });
      
      // 5. Check for images inside media containers
      document.querySelectorAll('div[role="presentation"] img, article img').forEach(img => {
        if (img.src) {
          const { width, height } = img.getBoundingClientRect();
          if (width > 150 && height > 150) {
            addUniqueUrl(img.src, images);
          }
        }
      });
      
      // 6. Images in carousel items
      document.querySelectorAll('div[role="tabpanel"] img').forEach(img => {
        if (img.src) addUniqueUrl(img.src, images);
      });
      
      // 7. Class-based selectors (may change but worth trying)
      document.querySelectorAll('div._acss img, div._aagu img, div._aagv img').forEach(img => {
        if (img.src) addUniqueUrl(img.src, images);
      });
      
      // VIDEO EXTRACTION
      
      // 1. Direct video elements
      document.querySelectorAll('video').forEach(video => {
        if (video.src) addUniqueUrl(video.src, videos);
        
        // Check poster attribute as fallback image if video can't be extracted
        if (video.poster) addUniqueUrl(video.poster, images);
        
        // Check sources within video tags
        video.querySelectorAll('source').forEach(source => {
          if (source.src) addUniqueUrl(source.src, videos);
        });
      });
      
      // 2. Look for video sources directly
      document.querySelectorAll('source[type^="video/"]').forEach(source => {
        if (source.src) addUniqueUrl(source.src, videos);
      });
      
      // 3. Check for video links in attributes
      document.querySelectorAll('[data-video-url], [data-video-id]').forEach(el => {
        const videoUrl = el.getAttribute('data-video-url');
        if (videoUrl) addUniqueUrl(videoUrl, videos);
      });
      
      // 4. Check for modern Threads video containers
      document.querySelectorAll('[role="button"][aria-label*="video"], [aria-label*="Play"]').forEach(button => {
        // Try to find video URL in child elements
        const videoEl = button.querySelector('video');
        if (videoEl && videoEl.src) addUniqueUrl(videoEl.src, videos);
        
        // Also check for data-media attributes
        const dataMedia = button.getAttribute('data-media');
        if (dataMedia) {
          try {
            const mediaData = JSON.parse(dataMedia);
            if (mediaData.src) addUniqueUrl(mediaData.src, videos);
          } catch (e) {
            // Ignore JSON parsing errors
          }
        }
      });
      
      // 5. Look for background containers that might have video controls
      document.querySelectorAll('div[role="progressbar"]').forEach(progressbar => {
        const container = progressbar.parentElement;
        if (container) {
          const video = container.querySelector('video');
          if (video && video.src) addUniqueUrl(video.src, videos);
        }
      });
      
      // 6. Look for video URLs in script tags (as a last resort)
      document.querySelectorAll('script').forEach(script => {
        if (script.textContent) {
          // Look for video URLs in the script content
          const videoMatches = script.textContent.match(/"video_url":"([^"]+)"/g);
          if (videoMatches) {
            videoMatches.forEach(match => {
              const url = match.replace('"video_url":"', '').replace('"', '');
              if (url) addUniqueUrl(url, videos);
            });
          }
        }
      });
      
      // For debugging: record our findings
      console.log(`Found ${images.length} images and ${videos.length} videos on the page`);
      
      return { images, videos };
    });
    
    // Log what we found to help with debugging
    console.log(`Extracted ${mediaData.images.length} images and ${mediaData.videos.length} videos`);
    
    // Check if any media was found
    if (mediaData.images.length === 0 && mediaData.videos.length === 0) {
      throw new Error('No media found in thread');
    }
    
    // Ensure all URLs use threads.com domain
    const normalizeUrl = (url) => {
      return url.replace('threads.net', 'threads.com');
    };
    
    // Create the response object
    const result = {
      url: normalizeUrl(url),
      timestamp: new Date().toISOString(),
      media: {
        images: mediaData.images.map(normalizeUrl),
        videos: mediaData.videos.map(normalizeUrl),
        count: {
          images: mediaData.images.length,
          videos: mediaData.videos.length,
          total: mediaData.images.length + mediaData.videos.length
        }
      }
    };
    
    console.log(`Successfully extracted media from thread: ${url}`);
    return result;
  } catch (error) {
    console.error(`Error in thread service: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}; 