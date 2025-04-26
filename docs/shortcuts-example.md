# iOS Shortcuts Integration Guide

This guide shows you how to create an iOS Shortcut that uses the ThreadsPull API to download media from Threads posts.

## Basic Shortcut Structure

Here's a step-by-step guide to create a basic Shortcut:

1. Open the Shortcuts app on your iOS device
2. Create a new Shortcut
3. Add the following actions in order:

### 1. Get Input (Text)
- Configure to accept URLs as input

### 2. URL
- Set value to your deployed API endpoint, e.g., `https://your-threadspull-api.vercel.app/api/extract`

### 3. Get Contents of URL
- Method: POST
- Headers: 
  - Key: `Content-Type`
  - Value: `application/json`
- Request Body: JSON
- JSON:
```json
{
  "url": "Shortcut Input"
}
```

### 4. Get Dictionary Value
- Dictionary: Previous Result
- Get value for key: `data.media.images` (or `data.media.videos` for videos)

### 5. Repeat with Each Item
- For each media URL:
  - Add "Get Contents of URL" to download the media
  - Add "Save to Photo Album" or use "Quick Look" to preview

## Advanced Example: Combined Image and Video Downloader

For a more advanced shortcut that handles both images and videos:

1. After getting the API response, split the flow into two paths:
   - One for handling images
   - One for handling videos

2. Use "If" conditions to check if there are any images or videos in the response

3. Process each type of media appropriately

## Example JSON Response Structure

Remember that the API returns data in this format:

```json
{
  "status": 200,
  "source": "live",
  "data": {
    "url": "https://www.threads.net/@username/post/123456789",
    "timestamp": "2023-07-15T12:34:56.789Z",
    "media": {
      "images": [
        "https://cdn.threads-media-files.com/image1.jpg",
        "https://cdn.threads-media-files.com/image2.jpg"
      ],
      "videos": [
        "https://cdn.threads-media-files.com/video1.mp4"
      ],
      "count": {
        "images": 2,
        "videos": 1,
        "total": 3
      }
    }
  }
}
```

## Tips for Shortcut Creation

- Test your shortcut with different types of Threads posts (single image, multiple images, video)
- Add error handling using "If" conditions to check for error responses
- Consider adding a notification to show the number of media files downloaded
- For large videos, you might want to add a confirmation step before downloading 