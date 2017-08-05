import supertest from 'supertest';
import { assert } from 'chai';
import { User } from '../../server/models/';
import errorMessages from '../../server/constants/errors';
import successMessages from '../../server/constants/successes';
import server from '../../server/server';

const request = supertest(server);

describe('POST /api/v1/users/', () => {
  const {
    badEmailError,
    incompleteCredentialsError,
    conflictingPasswordError
  } = errorMessages.userAuthErrors;

  const { successfulSignup } = successMessages.userAuthSuccess;

  beforeEach(() => {
    after(() => User.destroy({ where: {}, cascade: true, restartIdentity: true }));
  });
  it(`should respond with '${badEmailError}' when provided with malformed email`, () => {
    const supertestPromise = request.post('/api/v1/users/')
      .send({ email: 'andela', password: 'password', confirmationPassword: 'password' })
      .expect(400)
      .expect((response) => {
        assert.equal(response.body.error, badEmailError);
      });
    return supertestPromise;
  });
  it(`should respond with '${incompleteCredentialsError}' when 1 or all fields are omitted`, () => {
    const supertestPromise = request.post('/api/v1/users/')
      .send({ password: 'password', confirmationPassword: 'password' })
      .expect(400)
      .expect((response) => {
        assert.equal(response.body.error, incompleteCredentialsError);
      });
    return supertestPromise;
  });

  it(`shoud respond with '${conflictingPasswordError}' when password and cofirmation password conflicts`, () => {
    const supertestPromise = request.post('/api/v1/users')
      .send({ email: 'fizzy@gmail.com', password: 'password', confirmationPassword: 'passwskde' })
      .expect(400)
      .expect((response) => {
        assert.equal(response.body.error, conflictingPasswordError);
      });
    return supertestPromise;
  });
  it(`should respond with  ${successfulSignup} and a token when provided with the right credentials`, () => {
    const supertestPromise = request.post('/api/v1/users')
      .send({ email: 'fizzy@gmail.com', password: 'password', confirmationPassword: 'password' })
      .expect(200)
      .expect((response) => {
        const { token } = response.body;
        assert.equal(response.body.message, successfulSignup);
        assert.typeOf(token, 'string');
        assert.equal(!!token, true);
      });
    return supertestPromise;
  });
});
