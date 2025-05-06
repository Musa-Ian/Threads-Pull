# iPhone Shortcuts Integration Guide for ThreadsPull

This guide provides detailed instructions for using ThreadsPull API with iPhone Shortcuts, with specific troubleshooting steps for common issues.

## Basic Setup

### 1. Create a New Shortcut

1. Open the Shortcuts app on your iPhone
2. Tap the "+" button to create a new shortcut
3. Name your shortcut (e.g., "Threads Media Downloader")

### 2. Configure the Shortcut

Add these actions in sequence:

#### Input Step
- Add "URL" action
- Set it to accept the Threads post URL as input
- Or use "Ask for Input" with Text type

#### API Request Step
- Add "Get Contents of URL" action
- Set Method to "GET"
- URL should be: `https://your-api-url.com/api/extract?url=` + Shortcut Input
- **Important**: Make sure to URL encode the input if using query parameters

#### Alternative API Request (POST method)
If you prefer using POST:
- Add "Get Contents of URL" action
- Set Method to "POST"
- URL should be: `https://your-api-url.com/api/extract`
- Set "Request Body" to "JSON"
- Add this JSON:
```json
{
  "url": "Shortcut Input"
}
```
- Add Header: `Content-Type: application/json`

#### Process Response
- Add "Get Dictionary Value" action
- Dictionary: Previous Result
- Key Path: `data.media.images` (for images) or `data.media.videos` (for videos)

#### Download Media
- Add "Repeat with Each" action
- For each item:
  - Add "Get Contents of URL" action (to download the media)
  - Add "Save to Photo Album" action

## Troubleshooting

### Common Issues

1. **"Invalid data" error in Shortcuts**
   - Make sure your API is running and accessible
   - Check that you're using the correct URL format
   - Try using the GET method instead of POST (or vice versa)

2. **No media found**
   - Verify the Threads post actually contains media
   - Try opening the post in a browser first
   - Some private accounts may not work

3. **Timeout errors**
   - The API might need more time to process
   - Try again later when server load is lower

4. **"Cannot connect to server" error**
   - Check your internet connection
   - Verify the API server is running
   - Make sure the URL is correct

### Advanced Troubleshooting

If you're still having issues:

1. **Test the API directly**
   - Use a browser to access: `https://your-api-url.com/api/extract?url=https://www.threads.com/@username/post/123456789`
   - Check if you get a valid JSON response

2. **Check URL encoding**
   - Threads URLs contain special characters that need proper encoding
   - Use the "URL Encode" action in Shortcuts before passing the URL

3. **Inspect the full response**
   - Add a "Show Result" action right after the "Get Contents of URL" step
   - This will show you the raw API response for debugging

4. **Try with different posts**
   - Some posts might have special protection or formatting
   - Test with simple, public posts first

## Example Shortcut

Here's a complete example shortcut flow:

1. Get URL from Share Sheet
2. URL Encode the input
3. Get Contents of URL (GET method with query parameter)
4. Get Dictionary Value for "data.media.images"
5. If Result has any value:
   - Repeat with Each image URL
   - Get Contents of URL for each image
   - Save to Photo Album
6. Get Dictionary Value for "data.media.videos"
7. If Result has any value:
   - Repeat with Each video URL
   - Get Contents of URL for each video
   - Save to Photo Album
8. Show Notification with summary

## Need More Help?

If you continue to experience issues:
- Check the GitHub repository for updates
- Open an issue with detailed information about your problem
- Include the Threads post URL you're trying to process
