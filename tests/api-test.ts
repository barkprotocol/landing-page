import { GET, POST } from '../api/v1/endpoint';
import { createMocks } from 'node-mocks-http';

describe('API Tests', () => {
  test('GET /api/your-endpoint should return error if mint is missing', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/your-endpoint',
    });

    await GET(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error', 'Mint address is required');
  });

  test('POST /api/your-endpoint should return error for invalid JSON', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: 'invalid json', // Invalid JSON
    });

    await POST(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toHaveProperty('error', 'Invalid JSON in request body');
  });

  // Add more tests for valid cases and other edge cases...
});
