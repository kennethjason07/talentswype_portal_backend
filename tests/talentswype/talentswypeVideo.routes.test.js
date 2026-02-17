import express from 'express';
import request from 'supertest';
import { talentswypeVideoRouter } from '../../src/modules/talentswypeVideo/routes/talentswypeVideo.routes.js';

describe('Talentswype video routes', () => {
  test('POST /candidates/signup returns 422 for invalid payload', async () => {
    const app = express();
    app.use(express.json());
    app.use(talentswypeVideoRouter);

    const response = await request(app).post('/candidates/signup').send({
      email: 'invalid-email',
      firstName: '',
      lastName: 'Doe',
    });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });
});
