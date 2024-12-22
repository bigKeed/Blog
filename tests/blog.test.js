const request = require('supertest');
const app = require('../Blog-API/app');
const mongoose = require('mongoose');
const User = require('../models/user');
const Blog = require('../models/blog');
const jwt = require('jsonwebtoken');

let token;
let userId;

beforeAll(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
    jest.setTimeout(10000); 
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create a test user
  const user = new User({
    'first_name': 'Test',
    'last_name': 'User ',
    'username':'testuser',
    'email': 'testuser@example',
    'password': 'password123',
  });
  await user.save();
  userId = user._id;

   //create a test blog
   const newBlog = new Blog({
    title: 'Published Blog 1',
    description: 'This is a published blog post.',
    author: user._id,
    body: 'Content of published blog 1.',
    state: 'published',
});
await newBlog.save(); 
   
  // Generate a JWT token
  token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}, 10000 );

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Blog API', () => {
  let blogId;

  it('should create a new blog', async () => {
    const response = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Blog',
        description: 'This is a test blog.',
        tags: ['test', 'blog'],
        state:'published',
        body: 'This is the body of the test blog.',
      });
      

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.title).toBe('Test Blog');
    blogId = response.body._id; // Save the blog ID for later tests
  },10000);

  it('should get a list of published blogs', async () => {
    const response = await request(app)
    .get('/api/blogs/');

    expect(response.status).toBe(200);
    
  }, 10000);

  it('should get a single blog by ID', async () => {
    const response = await request(app).get(`/api/blogs/${blogId}`);

    expect(response.status).toBe(200);
    
  }, 10000);

  it('should update a blog', async () => {
    const response = await request(app)
      .put(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Test Blog',
        description: 'This is an updated test blog.',
        tags: ['updated', 'blog'],
        body: 'This is the updated body of the test blog.',
      });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Test Blog');
  }, 10000);

  it('should delete a blog', async () => {
    const response = await request(app)
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204); // No content
  }, 10000);

  it('should return 404 for a deleted blog', async () => {
    const response = await request(app).get(`/api/blogs/${blogId}`);
    expect(response.status).toBe(404);
  }, 10000);

  it('should get a list of the users blogs', async () => {
    const response = await request(app)
      .get('/api/blogs/authors')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  }, 10000);
});