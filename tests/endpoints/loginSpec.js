
import supertest from 'supertest';
import jwtRunner from 'jsonwebtoken';
import { assert } from 'chai';
import { User } from '../../server/models';
import server from '../../server/server';
import errorConstants from '../../server/constants/errorConstants';
import successConstants from '../../server/constants/successConstants';


const request = supertest(server);
const {
  wrongEmailOrPassword,
  unAuthorizedUserError
} = errorConstants.userAuthErrors;


describe('/api/v1/users/login', () => {
  const email = 'test@testDomain.com';
  const password = 'somerandompassword';
  const username = 'theusername';
  let jwt;
  before(() => {
    const supertestPromise = request
      .post('/api/v1/users/')
      .send({
        email,
        password,
        confirmationPassword: password,
        username
      })
      .expect(201)
      .then((response) => {
        jwt = response.body.token;
      })
      .catch((error) => {
        throw error;
      });
    return supertestPromise;
  });
  after(() => User.destroy({
    where: {},
    cascade: true,
    restartIdentity: true
  }));
  it(`should respond with '${wrongEmailOrPassword}' when trying 
  to signup with wrong password`, () => {
      const supertestPromise = request
        .post('/api/v1/users/login')
        .expect(401)
        .expect((response) => {
          assert.equal(response.body.error, wrongEmailOrPassword);
        });
      return supertestPromise;
    });
  it(`should respond with '${wrongEmailOrPassword}' 
  the email provided is not in database `, (done) => {
      request
        .post('/api/v1/users/login')
        .send({
          email: 'randomEmail@random.com',
          password: 'somerandompassword'
        })
        .expect(401)
        .end((error, response) => {
          if (error) {
            done(error);
          }
          assert.equal(response.body.error, wrongEmailOrPassword);
          done();
        });
    });

  it(`should respond with '${successConstants.successfulLogin}' 
  and a jwt token when user logs in successfully`, () => {
      const supertestPromise = request
        .post('/api/v1/users/login/')
        .send({
          email,
          password,
        })
        .expect(200)
        .expect((response) => {
          const { token } = response.body;
          assert.typeOf(token, 'string');
          assert.equal(token.split(' ')[0], 'JWT');
          const user = jwtRunner.decode(token.split(' ')[1]).data;
          assert.equal(user.username, username);
          assert.equal(user.email, email);
          assert.equal(user.password, null);
        });
      return supertestPromise;
    });
  it(`should respond with '${unAuthorizedUserError}' when 
  user is not authenticated`, () => {
      const supertestRequest = request
        .get('/api/v1/users/')
        .expect(401)
        .expect((response) => {
          assert.equal(response.body.error, unAuthorizedUserError);
        });
      return supertestRequest;
    });
  it(`should be able to access routes on sending valid json web token to
   the server`, () => {
      const supertestPromise = request
        .get('/api/v1/users/')
        .set('Authorization', jwt)
        .expect(200);
      return supertestPromise;
    });
});
