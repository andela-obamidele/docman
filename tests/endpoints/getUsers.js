/* eslint max-len: 0 */

import supertest from 'supertest';
import { assert } from 'chai';
import { User } from '../../server/models';
import server from '../../server/server';
import dummyUsers from '../dummyData/dummyUsers';
import errorMessages from '../../server/constants/errors';

const request = supertest(server);

describe('GET /api/v1/users', () => {
  let jwt;
  before(() => User
    .destroy({ where: {}, cascade: true, restartIdentity: true })
    .then(() => User.bulkCreate(dummyUsers))
    .then(() => request
      .post('/api/v1/users/login')
      .send(dummyUsers[0])
      .expect(200)
      .then((response) => {
        jwt = response.body.token;
      }))
    .catch(error => error));

  it('should respond with an array of all users', () => request
    .get('/api/v1/users/')
    .set('Authorization', jwt)
    .expect(200)
    .expect((response) => {
      const { users } = response.body;
      assert.equal(users.length, dummyUsers.length);
    }));

  it(`should respond with n=limit numbers of users when
     limit and offset is provided as query strings`, () => request
      .get('/api/v1/users/?limit=5&offset=0')
      .set('Authorization', jwt)
      .expect(200)
      .expect((response) => {
        assert.equal(response.body.users.length, 5);
      }));

  it(`should respond with '${errorMessages.paginationQueryError}'
     limit or query is not number`, () => request
      .get('/api/v1/users/?limit=one&offset=0')
      .set('Authorization', jwt)
      .expect(406)
      .expect(response => assert
        .equal(errorMessages.paginationQueryError, response.body.error))
  );
});
