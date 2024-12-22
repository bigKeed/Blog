const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); 
const User = require('../models/user');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

     // Create a test user
     await request(app)
     .post('/api/auth/signup')
     .send({
         first_name: 'Test',
         last_name: 'User ',
         email: 'testusermail',
         password: 'password123',
     });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Authentication Tests', () => {
    beforeEach(async () => {
        // Clear the database
        await User.deleteMany({});
    });

    test('User  registration should succeed', async () => {
        const response = await request(app)
            .post('/api/auth/signup')
            .send({
                first_name: 'test',
                last_name: 'user',
                username: 'testuser',
                email: 'testusermail',
                password: 'password123'
            })
            .expect(201);

        expect(response.body.message).toBe('User  created');
    });

    test('User  login should succeed with valid credentials', async () => {
        // First, register the user
        await request(app)
            .post('/api/auth/signup')
            .send({
                first_name: 'test',
                last_name: 'user',
                username: 'testuser',
                email: 'testusermail',
                password: 'password123'
            });

        // Now, log in
        const response = await request(app)
            .post('/api/auth/signin')
            .send({
                email: 'testusermail',
                password: 'password123',
            })
            .expect(200);

        expect(response.body.token).toBeDefined(); 
    });

    test('User  login should fail with invalid credentials', async () => {
        // Attempt to log in without registering
        const response = await request(app)
            .post('/api/auth/signin')
            .send({
                email: 'nonexistent@example.com',
                password: 'wrongpassword',
            })
            .expect(401);

       
    });

    test('Access protected route without token should fail', async () => {
        const response = await request(app)
            .get('/api/blogs/authors')
            .expect(401); // Expect unauthorized access
    });

    test('should return 401 for invalid token', async () => {
        const response = await request(app)
            .get('/api/blogs/authors')
            .set('Authorization', 'Bearer invalidtoken'); 

        expect(response.status).toBe(401); // Expect a 401 Unauthorized response
    });

});