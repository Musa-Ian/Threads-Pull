# ThreadsPull

ThreadsPull is a simple API service for extracting media (images and videos) from Threads posts. This service allows you to easily retrieve direct CDN links to media content, which can be useful for creating tools that work with Threads content, such as downloaders, aggregators, or integrations with other platforms.

## Features

- 🔗 Extract direct CDN URLs for images and videos from Threads posts
- 🚀 Simple REST API for easy integration
- 📱 Perfect for use with iOS Shortcuts or other automation tools
- 💾 Caching for improved performance and reduced load on Threads
- 🛡️ Comprehensive error handling and rate limiting
- 📄 Full documentation for API usage and deployment
- 🚀 Ready for serverless deployment on Vercel
- 🧩 Supports all Threads URL formats (posts, replies, comments)

## API Usage

### Extract Media from a Threads Post

#### `GET /api/extract`

Extract media from a Threads post using a GET request with a URL query parameter.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| url | string | Yes | The URL of the Threads post |

**Example Request:**

```
GET /api/extract?url=https://www.threads.net/@username/post/123456789
```

#### `POST /api/extract`

Extract media from a Threads post using a POST request with a JSON body.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| url | string | Yes | The URL of the Threads post |

**Example Request:**

```json
POST /api/extract
Content-Type: application/json

{
  "url": "https://www.threads.net/@username/post/123456789"
}
```

### Supported Threads URL Formats

ThreadsPull intelligently handles various Threads URL formats:

- **Main Posts:** `https://www.threads.net/@username/post/123456789` or `https://www.threads.com/@username/post/123456789`
- **Replies:** `https://www.threads.net/@username/post/123456789/reply/987654321` or `https://www.threads.com/@username/post/123456789/reply/987654321`
- **Comments:** `https://www.threads.net/@username/post/123456789/comment/987654321` or `https://www.threads.com/@username/post/123456789/comment/987654321`

The API automatically extracts media from the parent post when you provide a reply or comment URL.

### Response Format

The API returns a JSON response with the following structure:

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

### Error Responses

The API returns appropriate error responses for various scenarios:

**Invalid URL Format:**

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid Threads URL format"
}
```

**Missing URL Parameter:**

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Missing required parameter: url"
}
```

**Thread Not Found:**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Thread not found or inaccessible"
}
```

**No Media Found:**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "No media found in the thread"
}
```

**Rate Limit Exceeded:**

```json
{
  "status": 429,
  "error": "Too many requests, please try again later."
}
```

## iPhone Shortcuts Integration

ThreadsPull is designed to work seamlessly with iOS Shortcuts. Here's how to create a simple shortcut for downloading media from Threads:

### Basic Shortcut for iOS 18

1. Create a new Shortcut in the Shortcuts app
2. Add a "URL" action with your deployed ThreadsPull API endpoint (e.g., `https://your-threadspull-api.vercel.app/api/extract`)
3. Add a "Get Contents of URL" action with the following settings:
   - Method: POST
   - Headers: Add a new header with key `Content-Type` and value `application/json`
   - Request Body: JSON
   - JSON Key-Value: Key: `url`, Value: `Shortcut Input`
4. Add a "Get Dictionary Value" action to extract the media URLs from the response:
   - Dictionary: Output from previous action
   - Key Path: `data.media.images` or `data.media.videos` (depending on what you want to extract)
5. Add a "Repeat with Each" action to process each media URL
6. Within the Repeat loop, add a "Download File" action and set the destination to "Save to Photos"

### Advanced Shortcut for iOS 18

For a more robust experience, you can create an advanced shortcut that:

1. Accepts a Threads URL from the share sheet
2. Verifies the URL is from Threads
3. Shows a loading indicator while processing
4. Handles both image and video media types
5. Provides error handling with friendly messages
6. Offers options to save to Photos or Files

Here's a complete shortcut structure:

1. Accept Input (URL from share sheet)
2. If (Input contains "threads.net")
   - Show Notification "Processing Threads post..."
   - URL (your API endpoint)
   - Get Contents of URL
     - Method: POST
     - Headers: Content-Type: application/json
     - Request Body: JSON with {"url": Shortcut Input}
   - Parse JSON from result
   - Get Dictionary Value (data.media)
   - If (Result has any value)
     - Get Dictionary Value (images)
     - Get Dictionary Value (videos)
     - If (images count > 0 AND videos count > 0)
       - Choose from Menu: "Download Images" or "Download Videos"
       - Based on choice, process appropriate media type
     - Else
       - Process whichever media type exists
     - Show Success Notification
   - Else
     - Show Error "No media found in this post"
3. Else
   - Show Error "Not a valid Threads URL"

### Sample Shortcut Template

```json
{
  "input": "{{Shortcut Input}}",
  "url": "https://your-threadspull-api.vercel.app/api/extract",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "url": "{{Shortcut Input}}"
  }
}
```

## Local Development

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ThreadsPull.git
   cd ThreadsPull
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the provided `env-example`:
   ```bash
   cp env-example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on http://localhost:3000 by default.

## Deployment

ThreadsPull can be easily deployed to various platforms:

### Vercel (Recommended)

The project is configured for optimal deployment on Vercel with serverless functions:

1. Fork this repository to your GitHub account
2. Create a new project in Vercel and link it to your repository
3. Configure environment variables in the Vercel dashboard:
   - `NODE_ENV` = `production`
   - `PORT` = `3000` (optional, as Vercel handles ports automatically)
   - `RATE_LIMIT_WINDOW_MS` = `900000`
   - `RATE_LIMIT_MAX` = `100`
   - `CACHE_TTL` = `3600`
   - `CACHE_CHECK_PERIOD` = `600`
4. Deploy your project
5. Your API will be available at `https://your-project.vercel.app`

The included `vercel.json` file configures:
- Functions with 1GB memory allocation
- 60-second max duration for web scraping operations
- Proper routing for the API endpoints

### Railway

1. Fork this repository to your GitHub account
2. Create a new project in Railway and connect your repository
3. Configure environment variables
4. Deploy

### Render

1. Fork this repository to your GitHub account
2. Create a new Web Service in Render
3. Connect your repository
4. Set the build command to `npm install`
5. Set the start command to `npm start`
6. Configure environment variables
7. Deploy

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool is intended for personal use and educational purposes only. Please respect Meta's terms of service and copyright laws when using media from Threads posts. Always obtain proper permissions before using others' content.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 