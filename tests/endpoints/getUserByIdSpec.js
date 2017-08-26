import { assert } from 'chai';
import supertest from 'supertest';
import { User } from '../../server/models';
import dummyUsers from '../dummyData/dummyUsers';
import server from '../../server/server';
import errorConstants from '../../server/constants/errorConstants';

const request = supertest(server);

describe('GET /api/v1/users/:id', () => {
  let jwt;
  let sampleUserId;

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
    .then((queryResult) => {
      sampleUserId = queryResult.dataValues.id;
    })
    .catch(error => error));

  it(`should respond with '${errorConstants.userNotFound}' 
    userId is used`, () => {
      const supertestPromise = request
        .get('/api/v1/users/92342343')
        .set('Authorization', jwt)
        .expect(404)
        .expect((response) => {
          assert.equal(response.body.error, errorConstants.userNotFound);
        });
      return supertestPromise;
    });
  it(`should respond with '${errorConstants.wrongIdTypeError}' when id 
    provided is not of type number`, () => {
      const supertestPromise = request
        .get('/api/v1/users/onehundred')
        .set('Authorization', jwt)
        .expect(400)
        .expect((response) => {
          assert.equal(response.body.error, errorConstants.wrongIdTypeError);
        });
      return supertestPromise;
    });
  it(`it should respond with a user object with corresponding info
    when the user id provided exist in db`, () => {
      const supertestPromise = request
        .get(`/api/v1/users/${sampleUserId}`)
        .set('Authorization', jwt)
        .expect(200)
        .expect((response) => {
          const expectedEmail = dummyUsers[0].email;
          assert.equal(response.body.email, expectedEmail);
          assert.equal(response.body.id, sampleUserId);
        });
      return supertestPromise;
    });
});
