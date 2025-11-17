import request from 'supertest';
import app from '../app';

describe('Health Checks', () => {
  it('GET /healthz should return 200', async () => {
    const response = await request(app).get('/healthz');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('GET /readyz should return 200', async () => {
    const response = await request(app).get('/readyz');
    expect(response.status).toBe(200);
  });
});
