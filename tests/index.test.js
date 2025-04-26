const request = require('supertest');
const app = require('../src/index');

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

    // Note: We're not testing the actual extraction here as it requires a live connection
    // and Puppeteer instance. This would be better tested with a mock or integration test.
  });
}); 