const supertest = require('supertest');
const app = require('../api');
const { connect } = require('./database');
const UserModel = require('../models/user');

describe('User Authentication Test', () => {
  let connection;
  beforeAll(async () => {
    connection = await connect();
  });

  beforeEach(async () => {
    await connection.cleanup();
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  //   test user registration
  it('should register a user successfully', async () => {
    const response = await supertest(app)
      .post('/api/v1/user/signup')
      .set('content-type', 'application/json')
      .send({
        first_name: 'Drew',
        last_name: 'Osei',
        email: 'drew@example.com',
        password: 'password',
      });

    expect(response.status).toEqual(201);
    expect(response.body.user).toMatchObject({
      first_name: 'Drew',
      last_name: 'Osei',
      email: 'drew@example.com',
    });
  });

  // Test login route
  it('should successfully login a user', async () => {
    await UserModel.create({
      first_name: 'Drew',
      last_name: 'Osei',
      email: 'drew@example.com',
      password: 'password',
    });

    const response = await supertest(app)
      .post('/api/v1/user/login')
      .set('content-type', 'application/json')
      .send({
        email: 'drew@example.com',
        password: 'password',
      });

    // expectations
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      message: 'Login successfully',
      token: expect.any(String),
      user: expect.any(Object),
    });

    expect(response.body.user.email).toEqual('drew@example.com');
  });

  //   test when user does not exist
  it('should not successfully login a user, when user does not exist', async () => {
    await UserModel.create({
      first_name: 'Drew',
      last_name: 'Osei',
      email: 'drew@example.com',
      password: 'password',
    });

    const response = await supertest(app)
      .post('/api/v1/user/login')
      .set('content-type', 'application/json')
      .send({
        email: 'payin@example.com',
        password: 'password',
      });

    // expectations
    expect(response.status).toEqual(404);
    expect(response.body).toMatchObject({
      message: 'User does not exist. Try signing up',
    });
  });
});
