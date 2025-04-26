// Set test environment
process.env.NODE_ENV = 'test';

// Mock dependencies as needed
jest.mock('../src/services/threadService', () => ({
  extractMediaFromThread: jest.fn().mockImplementation((url) => {
    if (url === 'https://www.threads.net/@validuser/post/123456789') {
      return Promise.resolve({
        url: url,
        timestamp: '2023-07-15T12:34:56.789Z',
        media: {
          images: ['https://cdn.threads-media-files.com/image1.jpg'],
          videos: [],
          count: {
            images: 1,
            videos: 0,
            total: 1
          }
        }
      });
    } else {
      throw new Error('Thread not found');
    }
  })
}));

// Setup global test timeout
jest.setTimeout(30000); 