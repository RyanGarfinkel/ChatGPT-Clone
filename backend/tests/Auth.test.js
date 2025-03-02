const request = require('supertest');
const { app, server } = require('../server');

const User = require('../Models/User');
const mongoose = require('mongoose');

jest.setTimeout(10000);

describe('Auth', () => {

    afterEach(() => jest.clearAllMocks());

    const testUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'email@example.com',
        password: 'password'
    };

    let accessToken = '';
    let refreshToken = '';

    // Signup endpoint

    it('Should create a new user', async () => {
        
        const res = await request(app)
            .post('/api/signup')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('firstName');
        expect(res.body.firstName).toEqual(testUser.firstName);
        expect(res.body).toHaveProperty('lastName');
        expect(res.body.lastName).toEqual(testUser.lastName);
        expect(res.body).toHaveProperty('email');
        expect(res.body.email).toEqual(testUser.email);

        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeTruthy();
        
        accessToken = cookies.find(cookie => cookie.startsWith('accessToken'));
        expect(accessToken).toBeTruthy();

        refreshToken = cookies.find(cookie => cookie.startsWith('refreshToken'));
        expect(refreshToken).toBeTruthy();
    });

    it('Should try creating a user with the same email', async () => {
        
        const res = await request(app)
            .post('/api/signup')
            .send(testUser);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Email already in use.');
    });

    it('Should try creating a user without a first name', async () => {

        const res = await request(app)
            .post('/api/signup')
            .send({ ...testUser, firstName: '' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('First name is required.');
    });

    it('Should try creating a user without a last name', async () => {
        
        const res = await request(app)
            .post('/api/signup')
            .send({ ...testUser, lastName: '' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Last name is required.');
    });

    it('Should try creating a user without an email', async () => {
        
        const res = await request(app)
            .post('/api/signup')
            .send({ ...testUser, email: '' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Email is required.');
    });

    it('Should try creating a user without a password', async () => {

        const res = await request(app)
            .post('/api/signup')
            .send({ ...testUser, password: '' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Password is required.');
    });

    // Login endpoint
    it('Should login a user', async () => {

        const res = await request(app)
            .post('/api/login')
            .send({ email: testUser.email, password: testUser.password });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('firstName');
        expect(res.body.firstName).toEqual(testUser.firstName);
        expect(res.body).toHaveProperty('lastName');
        expect(res.body.lastName).toEqual(testUser.lastName);
        expect(res.body).toHaveProperty('email');
        expect(res.body.email).toEqual(testUser.email);

        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeTruthy();
        
        accessToken = cookies.find(cookie => cookie.startsWith('accessToken'));
        expect(accessToken).toBeTruthy();

        refreshToken = cookies.find(cookie => cookie.startsWith('refreshToken'));
        expect(refreshToken).toBeTruthy();
    });

    it('Should try logging in with an invalid email', async () => {
        
        const res = await request(app)
            .post('/api/login')
            .send({ email: 'wrong-email@example.com', password: testUser.password });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Invalid email.');
    });

    it('Should try logging in with an invalid password', async () => {

        const res = await request(app)
            .post('/api/login')
            .send({ email: testUser.email, password: 'wrong-password' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Invalid password.');
    });

    it('Should try logging in with an invalid email and password', async () => {

        const res = await request(app)
            .post('/api/login')
            .send({ email: 'wrong-email@example.com', password: 'wrong-password' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Invalid email.');
    });

    it('Should try logging in without an email', async () => {

        const res = await request(app)
            .post('/api/login')
            .send({ email: '', password: testUser.password });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Email is required.');
    });

    it('Should try logging in without a password', async () => {

        const res = await request(app)
            .post('/api/login')
            .send({ email: testUser.email, password: '' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Password is required.');
    });
    
    // Token endpoint

    it('Should refresh access token', async () => {

        const res = await request(app)
            .post('/api/token')
            .set('Cookie', `refreshToken=${refreshToken.split('=')[1]}`);

        expect(res.statusCode).toEqual(204);
        expect(res.body).toEqual({});
    });

    it('Should try refreshing access token with an invalid refresh token', async () => {

        const res = await request(app)
            .post('/api/token')
            .set('Cookie', 'refreshToken=invalid-refresh-token');

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Invalid refresh token');
    });

    it('Should try refreshing access token without a refresh token', async () => {

        const res = await request(app)
            .post('/api/token');

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toEqual('Refresh token not found');
    });
    
    afterAll(async () => {

        await User.deleteOne({ email: testUser.email });
        await mongoose.connection.close();
        server.close();
    });
})