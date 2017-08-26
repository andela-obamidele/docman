import supertest from 'supertest';
import { assert } from 'chai';
import jwtRunner from 'jsonwebtoken';
import { User } from '../../server/models/';
import errorConstants from '../../server/constants/errorConstants';
import server from '../../server/server';

const request = supertest(server);

describe('POST /api/v1/users/', () => {
  const {
    badEmailError,
    incompleteCredentialsError,
    conflictingPasswordError
  } = errorConstants.userAuthErrors;


  beforeEach(() => {
    after(() => User
      .destroy({ where: {}, cascade: true, restartIdentity: true }));
  });
  it(`should respond with '${badEmailError}' when provided with 
  malformed email`, () => {
      const supertestPromise = request.post('/api/v1/users/')
        .send({
          email: 'andela',
          password: 'password',
          confirmationPassword: 'password',
          username: 'andela'
        })
        .expect(400)
        .expect((response) => {
          assert.equal(response.body.error, badEmailError);
        });
      return supertestPromise;
    });
  it(`should respond with '${incompleteCredentialsError}' 
  when 1 or all fields are omitted`, () => {
      const supertestPromise = request.post('/api/v1/users/')
        .send({ password: 'password', confirmationPassword: 'password' })
        .expect(400)
        .expect((response) => {
          const error = response.body.error;
          assert(error === incompleteCredentialsError ||
            error === 'email cannot be empty');
        });
      return supertestPromise;
    });

  it(`shoud respond with '${conflictingPasswordError}' when 
  password and cofirmation password conflicts`, () => {
      const supertestPromise = request.post('/api/v1/users')
        .send({
          email: 'fizzy@gmail.com',
          password: 'password',
          confirmationPassword: 'passwskde',
          username: 'andela'
        })
        .expect(409)
        .expect((response) => {
          assert.equal(response.body.error, conflictingPasswordError);
        });
      return supertestPromise;
    });
  it(`should respond with  a token when provided 
  with the right credentials`, () => {
      const supertestPromise = request.post('/api/v1/users')
        .send({
          email: 'fizzy@gmail.com',
          password: 'password',
          confirmationPassword: 'password',
          username: 'andela1'
        })
        .expect(201)
        .expect((response) => {
          const { token } = response.body;
          assert.typeOf(token, 'string');
          assert.equal(!!token, true);
          const user = jwtRunner.decode(token.split(' ')[1]).data;
          assert.equal(user.email, 'fizzy@gmail.com');
          assert.equal(user.username, 'andela1');
        });
      return supertestPromise;
    });
});