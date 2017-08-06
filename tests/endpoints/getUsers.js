import supertest from 'supertest';
// eslint-disable-next-line
import { assert } from 'chai';
import { User } from '../../server/models';
import server from '../../server/server';
import dummyUsers from '../dummyData/dummyUsers';

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
      .expect((response) => {
        jwt = response.body.token;
      }))
    .catch(error => error));

  it('should respond with an array of all users', () => request
    .get('/api/v1/users/')
    .set({ Authorization: jwt })
    .expect(200)
    .expect((response) => {
      const { users } = response.body;
      assert.equal(users.length, dummyUsers.length);
    }));
});
