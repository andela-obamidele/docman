import { assert } from 'chai';
import supertest from 'supertest';
import { User } from '../../server/models';
import errorMessages from '../../server/constants/errors';
import successMessages from '../../server/constants/successes';
import dummyUsers from '../dummyData/dummyUsers';
import dummyAdmins from '../dummyData/dummyAdmins';
import server from '../../server/server';

const request = supertest(server);
const { userDeleteUnauthorizedError } = errorMessages;
const { userDeleteSuccessful } = successMessages;

/**
 * What the before block is meant to do is
 * to initialize the test database with users and
 * two admin users and then log in 2 user and  1
 * admin
 */
describe('DELETE /api/v1/users/:id', () => {
  const usersJwt = [];
  let adminJwt;
  const admin = dummyAdmins[0];
  before(() =>
    User.destroy({ where: {}, cascade: true, restartIdentity: true })
      .then(() => User.bulkCreate(dummyUsers))
      .then(() => User.bulkCreate(dummyAdmins))
      .then(() => request
        .post('/api/v1/users/login')
        .send(dummyUsers[0])
        .expect(200)
        .then((response) => {
          usersJwt.push(response.body.token);
        })
      )
      .then(() => request
        .post('/api/v1/users/login')
        .send(admin)
        .expect(200)
        .then((response) => {
          adminJwt = response.body.token;
        }))
      .catch(error => error)
  );

  after(() =>
    User.destroy({ where: {}, cascade: true, restartIdentity: true })
  );
  it(`should respond with ${userDeleteUnauthorizedError}  when user
  user trying to delete another user `, () => {
      let userToBeDeletedId;
      return User
        .findOne({ where: { email: dummyUsers[2].email } })
        .then((user) => {
          userToBeDeletedId = user.dataValues.id;
        })
        .then(() => request
          .delete(`/api/v1/users/${userToBeDeletedId}`)
          .set('Authorization', usersJwt[0])
          .expect(403)
          .expect((response) => {
            const error = response.body.error;
            assert.equal(error, userDeleteUnauthorizedError);
          })
        );
    });

  it(`should respond with ${userDeleteSuccessful} when user tries
  to delete her own account`, () => {
      let userToBeDeletedId;
      return User.findOne({ where: { email: dummyUsers[0].email } })
        .then((user) => {
          userToBeDeletedId = user.id;
        })
        .then(() => request
          .delete(`/api/v1/users/${userToBeDeletedId}`)
          .set('Authorization', usersJwt[0])
          .expect(200)
          .then((response) => {
            const successMessage = response.body.message;
            assert.equal(successMessage, userDeleteSuccessful);
          })
          .then(() => User.findById(userToBeDeletedId)
            .then((user) => {
              assert.equal(user, null);
            }))
        );
    });
  it(`should respond with with ${userDeleteSuccessful} when an admin
    when an admin tries to delete any user`, () => {
      let userToBeDeletedId;
      return User.findOne({ where: { email: dummyUsers[1].email } })
        .then((user) => {
          userToBeDeletedId = user.id;
        })
        .then(() => request
          .delete(`/api/v1/users/${userToBeDeletedId}`)
          .set('Authorization', adminJwt)
          .expect(200)
          .then((response) => {
            const successMessage = response.body.message;
            assert.equal(successMessage, userDeleteSuccessful);
          })
          .then(() => User.findById(userToBeDeletedId))
          .then((user) => {
            assert.equal(user, null);
          })
        );
    });
});
