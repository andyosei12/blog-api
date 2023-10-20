const supertest = require('supertest');
const app = require('../api');
const { connect } = require('./database');
const UserModel = require('../models/user');

describe('blog route', () => {
  let connection;
  beforeAll(async () => {
    connection = await connect();
  });

  beforeEach(async () => {
    const user = await UserModel.create({
      first_name: 'Drew',
      last_name: 'Osei',
      email: 'nana@example.com',
      password: 'password',
    });
    // user login
    const response = await supertest(app)
      .post('/api/v1/user/login')
      .set('content-type', 'application/json')
      .send({
        email: 'nana@example.com',
        password: 'password',
      });
    token = response.body.token;
  });

  afterEach(async () => {
    await connection.cleanup();
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  //   Create a blog
  it('should create a blog successfully', async () => {
    console.log(token);
    const response = await supertest(app)
      .post('/api/v1/blogs')
      .set('authorization', `Bearer ${token}`)
      .set('content-type', 'application/json')
      .send({
        title: 'My first blog',
        description: 'This is my first blog',
        body: 'This is the body of my first blog',
        tags: ['first', 'blog'],
      });

    expect(response.status).toEqual(201);
    expect(response.body).toMatchObject({
      blog: expect.any(Object),
    });
  });

  //   Get all published blogs

  it('should return a list of published blogs', async () => {
    const response = await supertest(app)
      .get('/api/v1/blogs')
      .set('content-type', 'application/json');

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      blogs: expect.any(Array),
    });
  });

  //  Get an auth user blogs
  it('should return a list of auth user blogs', async () => {
    const response = await supertest(app)
      .get('/api/v1/user/blogs')
      .set('authorization', `Bearer ${token}`)
      .set('content-type', 'application/json');

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      blogs: expect.any(Array),
    });
  });

  //   Get a single blog
  it('should return a single blog', async () => {
    const response = await supertest(app)
      .get('/api/v1/blogs/5f0b6b9a2b5e6b2f4c5f1c4c')
      .set('content-type', 'application/json');

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      blog: expect.any(Object),
    });
  });

  //   Update a blog
  it('should update a blog successfully', async () => {
    const blog = await supertest(app)
      .post('/api/v1/blogs')
      .set('authorization', `Bearer ${token}`)
      .set('content-type', 'application/json')
      .send({
        title: 'My first blog',
        description: 'This is my first blog',
        body: 'This is the body of my first blog',
        tags: ['first', 'blog'],
      });

    const response = await supertest(app)
      .patch(`/api/v1/blogs/${blog.body.blog._id}`)
      .set('authorization', `Bearer ${token}`)
      .set('content-type', 'application/json')
      .send({
        description: 'This is my first blog and I am excited',
      });

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      message: 'Blog updated successfully',
      blog: expect.any(Object),
    });
  });

  //   It should update a blog status
  it('should update a task', async () => {
    const blog = await supertest(app)
      .post('/api/v1/blogs')
      .set('authorization', `Bearer ${token}`)
      .set('content-type', 'application/json')
      .send({
        title: 'My first blog',
        description: 'This is my first blog',
        body: 'This is the body of my first blog',
        tags: ['first', 'blog'],
      });

    const response = await supertest(app)
      .patch(`/api/v1/blogs/${blog.body.blog._id}/status`)
      .set('authorization', `Bearer ${token}`)
      .set('content-type', 'application/json')
      .send({
        status: 'published',
      });

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      message: 'Blog state updated successfully',
      blog: expect.any(Object),
    });
  });

  //   delete a blog

  it('should delete a task', async () => {
    const blog = await supertest(app)
      .post('/api/v1/blogs')
      .set('authorization', `Bearer ${token}`)
      .set('content-type', 'application/json')
      .send({
        title: 'My first blog',
        description: 'This is my first blog',
        body: 'This is the body of my first blog',
        tags: ['first', 'blog'],
      });

    const response = await supertest(app)
      .delete(`/api/v1/blogs/${blog.body.blog._id}`)
      .set('authorization', `Bearer ${token}`)
      .set('content-type', 'application/json');

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      message: 'Blog deleted successfully',
    });
  });
});
