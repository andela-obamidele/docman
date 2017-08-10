/* eslint max-len: 0 */

import supertest from 'supertest';
import { assert } from 'chai';
// eslint-disable-next-line
import { User } from '../../server/models';
import server from '../../server/server';
import errorMessages from '../../server/constants/errors';
import successMessages from '../../server/constants/successes';


const request = supertest(server);
const {
  wrongEmailOrPassword,
  // eslint-disable-next-line
  unAuthorizedUserError
} = errorMessages.userAuthErrors;

const { userAuthSuccess } = successMessages;

describe('/api/v1/users/login', () => {
  const email = 'test@testDomain.com';
  const password = 'somerandompassword';
  const username = 'theusername';
  let jwt;
  before(() => {
    const supertestPromise = request
      .post('/api/v1/users/')
      .set({ 'Content-Type': 'application/x-www-form-urlencoded' })
      .send({
        email,
        password,
        confirmationPassword: password,
        username
      })
      .expect(200)
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
  it(`should respond with '${wrongEmailOrPassword}' when trying to signup with wrong password`, () => {
    const supertestPromise = request
      .post('/api/v1/users/login')
      .expect(401)
      .expect((response) => {
        assert.equal(response.body.error, wrongEmailOrPassword);
      });
    return supertestPromise;
  });
  it(`should respond with '${wrongEmailOrPassword}' the email provided is not in database `, (done) => {
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

  it(`should respond with '${userAuthSuccess.successfulLogin}' and a jwt token when user logs in successfully`, () => {
    const supertestPromise = request
      .post('/api/v1/users/login/')
      .send({
        email,
        password,
      })
      .set({ 'Content-Type': 'application/x-www-form-urlencoded' })
      .expect(200)
      .expect((response) => {
        const { token, message } = response.body;
        assert.equal(message, userAuthSuccess.successfulLogin);
        assert.typeOf(token, 'string');
        assert.equal(token.split(' ')[0], 'JWT');
      });
    return supertestPromise;
  });
  it(`should respond with '${unAuthorizedUserError}' when user is not authenticated`, () => {
    const supertestRequest = request
      .get('/api/v1/users/')
      .expect(403)
      .expect((response) => {
        assert.equal(response.body.error, unAuthorizedUserError);
      });
    return supertestRequest;
  });
  it('should be able to access routes on sending valid jason web token to the server', () => {
    const supertestPromise = request
      .get('/api/v1/users/')
      .set('authorization', jwt)
      .expect(200);
    return supertestPromise;
  });
});
