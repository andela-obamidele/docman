import supertest from 'supertest';
import { assert } from 'chai';
import { User } from '../../server/models/';
import errorMessages from '../../server/helpers/constants/errors';
import app from '../../server/server';

const request = supertest(app);

describe('POST /api/v1/users/', () => {
  const {
    BAD_EMAIL_ERROR,
    INCOMPLETE_CREDENTIALS_ERROR,
    CONFLICTING_PASSWORDS_ERROR
  } = errorMessages.userAuthErrors;

  beforeEach(() => {
    User.destroy({ where: {}, cascade: true, restartIdentity: true });
  });
  it(`should respond with '${BAD_EMAIL_ERROR}' when provided with malformed email`, () => {
    const supertestPromise = request.post('/api/v1/users/')
      .send({ email: 'andela', password: 'password', confirmationPassword: 'password' })
      .expect(400)
      .expect((response) => {
        assert.equal(response.body.error, BAD_EMAIL_ERROR);
      });
    return supertestPromise;
  });
  it(`should respond with '${INCOMPLETE_CREDENTIALS_ERROR}' when 1 or all fields are omitted`, () => {
    const supertestPromise = request.post('/api/v1/users/')
      .send({ password: 'password', confirmationPassword: 'password' })
      .expect(400)
      .expect((response) => {
        assert.equal(response.body.error, INCOMPLETE_CREDENTIALS_ERROR);
      });
    return supertestPromise;
  });

  it(`shoud respond with '${CONFLICTING_PASSWORDS_ERROR}' when password and cofirmation password conflicts`, () => {
    const supertestPromise = request.post('/api/v1/users')
      .send({ email: 'fizzy@gmail.com', password: 'password', confirmationPassword: 'passwskde' })
      .expect(400)
      .expect((response) => {
        assert.equal(response.body.error, CONFLICTING_PASSWORDS_ERROR);
      });
    return supertestPromise;
  });
  it('should respond with a success message and a token when provided with the right credentials', () => {
    const supertestPromise = request.post('/api/v1/users')
      .send({ email: 'fizzy@gmail.com', password: 'password', confirmationPassword: 'password' })
      .expect(200)
      .expect((response) => {
        const { token } = response.body;
        assert.equal(response.body.message, 'signup successful');
        assert.typeOf(token, 'string');
        assert.equal(!!token, true);
      });
    return supertestPromise;
  });
});
