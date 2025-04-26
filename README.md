# ThreadsPull

ThreadsPull is a simple API service for extracting media (images and videos) from Threads posts. This service allows you to easily retrieve direct CDN links to media content, which can be useful for creating tools that work with Threads content, such as downloaders, aggregators, or integrations with other platforms.

## Features

- 🔗 Extract direct CDN URLs for images and videos from Threads posts
- 🚀 Simple REST API for easy integration
- 📱 Perfect for use with iOS Shortcuts or other automation tools
- 💾 Caching for improved performance and reduced load on Threads
- 🛡️ Comprehensive error handling and rate limiting
- 📄 Full documentation for API usage and deployment

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

1. Create a new Shortcut in the Shortcuts app
2. Add a "URL" action with your deployed ThreadsPull API endpoint
3. Add a "Get Contents of URL" action with the following settings:
   - Method: POST
   - Request Body: JSON
   - URL: The URL from the first action
   - JSON Body: `{"url": "Shortcut Input"}`
4. Add a "Get Dictionary Value" action to extract the media URLs
5. Add a "Download File" or "Quick Look" action to save or preview the media

### Example Shortcut Steps:

1. Accept Threads URL as input
2. Send URL to ThreadsPull API
3. Parse JSON response
4. For each media URL:
   - Download the file
   - Save to Photos or Files

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

3. Create a `.env` file based on the provided `.env.sample`:
   ```bash
   cp .env.sample .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on http://localhost:3000 by default.

## Deployment

ThreadsPull can be easily deployed to various platforms:

### Vercel

1. Fork this repository to your GitHub account
2. Create a new project in Vercel and link it to your repository
3. Configure environment variables in the Vercel dashboard
4. Deploy

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