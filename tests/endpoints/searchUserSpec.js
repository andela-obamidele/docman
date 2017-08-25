import supertest from 'supertest';
import { assert } from 'chai';
import errorConstants from '../../server/constants/errorConstants';
import server from '../../server/server';
import { User } from '../../server/models';
import dummyUsers from '../dummyData/dummyUsers';

const request = supertest(server);

describe('GET /api/v1/search', () => {
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
        return User.findOne({ where: { email: dummyUsers[0].email } });
      }))
    .catch(error => error)
  );

  it(`should respond with error '${errorConstants.unmatchedUserSearch}'
  query(q) does not match any email in the database`, () => {
      const { unmatchedUserSearch } = errorConstants;
      return request
        .get('/api/v1/search/users/?q=kilimanjaro@mountain.com')
        .set('Authorization', jwt)
        .expect(404)
        .expect((response) => {
          const expectedResponse = response.body.error;
          assert.equal(expectedResponse, unmatchedUserSearch);
        });
    });
  it(`should respond with an array of users and the number of matches
    when query matches one or more email in the database`, () => request
      .get(`/api/v1/search/users/?q=${dummyUsers[0].email}`)
      .set('Authorization', jwt)
      .expect(200)
      .expect((response) => {
        const user = response.body.users.pop();
        assert.equal(response.body.matches, 1);
        assert.equal(user.email, dummyUsers[0].email);
        assert.equal(user.bio, 'not set');
        assert.equal(user.username, dummyUsers[0].username);
        assert.equal(user.fullName, 'not set');
      })
  );
});
