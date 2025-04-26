const request = require('supertest');
const express = require('express');
const routes = require('../src/routes');
const cors = require('cors');
const helmet = require('helmet');

// Create a test app without starting the server
const createTestApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  
  // API routes
  app.use('/api', routes);
  
  // Base route
  app.get('/', (req, res) => {
    res.json({
      name: 'ThreadsPull API',
      description: 'API service to extract media links from Threads posts',
      version: '1.0.0',
      documentation: '/docs',
    });
  });
  
  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    res.status(500).json({
      status: 500,
      error: 'Internal Server Error',
      message: err.message,
    });
  });
  
  // Handle 404 routes
  app.use((req, res) => {
    res.status(404).json({
      status: 404,
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`,
    });
  });
  
  return app;
};

const app = createTestApp();

describe('API Endpoints', () => {
  describe('GET /', () => {
    it('should return API info', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('description');
      expect(res.body).toHaveProperty('version');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('POST /api/extract', () => {
    it('should return 400 if URL is missing', async () => {
      const res = await request(app)
        .post('/api/extract')
        .send({});
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Bad Request');
      expect(res.body).toHaveProperty('message', 'Missing required parameter: url');
    });

    it('should return 400 if URL is invalid', async () => {
      const res = await request(app)
        .post('/api/extract')
        .send({ url: 'https://example.com' });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Bad Request');
      expect(res.body).toHaveProperty('message', 'Invalid Threads URL format');
    });

    it('should return 200 with media data for valid Threads URL', async () => {
      const res = await request(app)
        .post('/api/extract')
        .send({ url: 'https://www.threads.net/@validuser/post/123456789' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('media');
      expect(res.body.data.media).toHaveProperty('images');
    });
  });
}); 