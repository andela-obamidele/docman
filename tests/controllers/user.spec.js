import jwtRunner from 'jsonwebtoken';
import { assert } from 'chai';
import supertest from 'supertest';
import { User } from '../../server/models';
import ErrorConstants from '../../server/constants/ErrorConstants';
import SuccessConstants from '../../server/constants/SuccessConstants';
import dummyUsers from '../dummyData/dummyUsers';
import dummyAdmins from '../dummyData/dummyAdmins';
import server from '../../server/server';


const request = supertest(server);

const { userDeleteUnauthorizedError, userAuthErrors } = ErrorConstants;
const { userDeleteSuccessful } = SuccessConstants;

describe('User controller', () => {
  const sampleUser = dummyUsers[0];
  let userJwt;
  let adminJwt;
  let sampleUserId;
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
          userJwt = response.body.token;
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
  describe('Delete user: DELETE /api/v1/users/:id', () => {
    it(`should respond with an error message when user
    user trying to delete another user `, () => {
        let userToBeDeletedId;
        return User
          .findOne({ where: { email: dummyUsers[2].email } })
          .then((user) => {
            userToBeDeletedId = user.dataValues.id;
          })
          .then(() => request
            .delete(`/api/v1/users/${userToBeDeletedId}`)
            .set('Authorization', userJwt)
            .expect(403)
            .expect((response) => {
              const error = response.body.error;
              assert.equal(error, userDeleteUnauthorizedError);
            })
          );
      });

    it(`should respond with a success message when user tries
    to delete her own account`, () => {
        let userToBeDeletedId;
        return User.findOne({ where: { email: dummyUsers[0].email } })
          .then((user) => {
            userToBeDeletedId = user.id;
          })
          .then(() => request
            .delete(`/api/v1/users/${userToBeDeletedId}`)
            .set('Authorization', userJwt)
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
    it(`should respond with with a success messsage when an admin
     tries to delete any user`, () => {
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

  describe('GET /api/v1/users/:id', () => {
    before(() => User
      .destroy({ where: {}, cascade: true, restartIdentity: true })
      .then(() => User.bulkCreate(dummyUsers))
      .then(() => request
        .post('/api/v1/users/login')
        .send(dummyUsers[0])
        .expect(200)
        .then((response) => {
          userJwt = response.body.token;
          return User.findOne({ where: { email: dummyUsers[0].email } });
        }))
      .then((queryResult) => {
        sampleUserId = queryResult.dataValues.id;
      })
      .catch(error => error));

    it(`should respond with an error message when userId does not 
    exist in the database`, () => {
        const supertestPromise = request
          .get('/api/v1/users/92342343')
          .set('Authorization', userJwt)
          .expect(404)
          .expect((response) => {
            assert.equal(response.body.error, ErrorConstants.userNotFound);
          });
        return supertestPromise;
      });
    it(`should respond with an error message when id 
      provided is not of type number`, () => {
        const supertestPromise = request
          .get('/api/v1/users/onehundred')
          .set('Authorization', userJwt)
          .expect(400)
          .expect((response) => {
            assert.equal(response.body.error, ErrorConstants.wrongIdTypeError);
          });
        return supertestPromise;
      });
    it(`it should respond with a user object with corresponding info
      when the user id provided exist in db`, () => {
        const supertestPromise = request
          .get(`/api/v1/users/${sampleUserId}`)
          .set('Authorization', userJwt)
          .expect(200)
          .expect((response) => {
            const expectedEmail = dummyUsers[0].email;
            assert.equal(response.body.email, expectedEmail);
            assert.equal(response.body.id, sampleUserId);
          });
        return supertestPromise;
      });
  });
  describe('Update user: PUT /ap/v1/users/:id', () => {
    beforeEach(() => User
      .destroy({ where: {}, cascade: true, restartIdentity: true })
      .then(() => User.create(sampleUser))
      .then(() => {
        const userLoginPromise = request
          .post('/api/v1/users/login')
          .send(sampleUser)
          .expect(200)
          .then((response) => {
            userJwt = response.body.token;
            return User.findOne({ where: { email: sampleUser.email } });
          })
          .then((queryResult) => {
            sampleUserId = queryResult.dataValues.id;
          });
        return userLoginPromise;
      })
      .catch(error => error)
    );

    it(`should respond with an error objects when validation
    error occurs`, () => {
        const { password, username } = sampleUser;
        const { badEmailError } = ErrorConstants.userAuthErrors;
        return request
          .put(`/api/v1/users/${sampleUserId}`)
          .send({
            email: 'fff.com',
            password,
            username,
            newPassword: 'password',
            confirmationPassword: 'password'
          })
          .set('Authorization', userJwt)
          .expect(400)
          .expect((response) => {
            const error = response.body.errors;
            assert.equal(error.message, badEmailError);
          });
      });
    it(`should respond with an error message when authorization
     password doesn't belong to the user to be updated`, () => {
        const { username, newPassword, confirmationPassword } = sampleUser;
        return request
          .put(`/api/v1/users/${sampleUserId}`)
          .send({
            username,
            newPassword,
            confirmationPassword,
            password: '2343'
          })
          .set('Authorization', userJwt)
          .expect(403)
          .expect((response) => {
            assert
              .equal(response.body.error, userAuthErrors.wrongPasswordError);
          });
      });
    it(`should respond with an error message when provided route is
      called with a none existing id`, () => request
        .put('/api/v1/users/9999999')
        .set('Authorization', userJwt)
        .send({
          username: 'username',
          password: 'password',
          bio: 'bio'
        })
        .expect(404)
        .expect((response) => {
          assert.equal(response.body.error, ErrorConstants.userNotFound);
        }));
    it(`should respond with an error message when the id 
    provided in the request url is not a number`, () => request
        .put('/api/v1/users/somejargon')
        .set('Authorization', userJwt)
        .send({
          email: 'some@email.com',
          password: 'somepassword',
          bio: 'this is a jargon bio'
        })
        .expect(400)
        .expect((response) => {
          assert.equal(response.body.error, ErrorConstants.wrongIdTypeError);
        }));
    it(`should respond with '${ErrorConstants.passwordUpdateError}' 
    new password and confirmation password doesn't match`, () => {
        const { username, password, email } = sampleUser;
        return request
          .put(`/api/v1/users/${sampleUserId}`)
          .send({
            email,
            password,
            username,
            newPassword: 'password',
            confirmationPassword: 'password1'
          })
          .set('Authorization', userJwt)
          .expect(409)
          .expect((response) => {
            const errorMessage = response.body.error;
            assert.equal(errorMessage, ErrorConstants.passwordUpdateError);
          });
      });
    it(`should respond with a success message and the new user profile when 
    profile is updated successfully`, () => {
        const { username, password, email } = sampleUser;
        return request
          .put(`/api/v1/users/${sampleUserId}`)
          .send({
            username,
            password,
            email,
            bio: 'this is a new bio'
          })
          .set('Authorization', userJwt)
          .expect(200)
          .expect((response) => {
            const { message, user } = response.body;
            const { userSuccessfullyUpdated } = SuccessConstants;
            assert.equal(message, userSuccessfullyUpdated);
            assert.equal(user.bio, 'this is a new bio');
          });
      });
  });
  describe('Search user: GET /api/v1/search', () => {
    before(() => User
      .destroy({ where: {}, cascade: true, restartIdentity: true })
      .then(() => User.bulkCreate(dummyUsers))
      .then(() => request
        .post('/api/v1/users/login')
        .send(dummyUsers[0])
        .expect(200)
        .then((response) => {
          userJwt = response.body.token;
          return User.findOne({ where: { email: dummyUsers[0].email } });
        }))
      .catch(error => error)
    );

    it(`should respond an error message when query(q) does not match
     any email in the database`, () => {
        const { unmatchedUserSearch } = ErrorConstants;
        return request
          .get('/api/v1/search/users/?q=kilimanjaro@mountain.com')
          .set('Authorization', userJwt)
          .expect(404)
          .expect((response) => {
            const expectedResponse = response.body.error;
            assert.equal(expectedResponse, unmatchedUserSearch);
          });
      });
    it(`should respond with an array of users and the number of matches
      when query matches one or more email in the database`, () => request
        .get(`/api/v1/search/users/?q=${dummyUsers[0].email}`)
        .set('Authorization', userJwt)
        .expect(200)
        .expect((response) => {
          const user = response.body.users.pop();
          assert.equal(response.body.matches, 1);
          assert.equal(user.bio, 'not set');
          assert.equal(user.username, dummyUsers[0].username);
          assert.equal(user.fullName, 'not set');
        })
    );
  });

  describe('User login: POST /api/v1/users/login', () => {
    const {
      wrongEmailOrPassword,
      unAuthorizedUserError
    } = userAuthErrors;
    const email = 'test@testDomain.com';
    const password = 'somerandompassword';
    const username = 'theusername';
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
          userJwt = response.body.token;
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
    it(`should respond with an error message when
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

    it(`should respond with a succss message and a jwt token 
    when user logs in successfully`, () => {
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
          .set('Authorization', userJwt)
          .expect(200);
        return supertestPromise;
      });
  });
  describe('GET /api/v1/users', () => {
    before(() => User
      .destroy({ where: {}, cascade: true, restartIdentity: true })
      .then(() => User.bulkCreate(dummyUsers))
      .then(() => request
        .post('/api/v1/users/login')
        .send(dummyUsers[0])
        .expect(200)
        .then((response) => {
          userJwt = response.body.token;
        }))
      .catch(error => error));

    it('should respond with an array of all users', () => request
      .get('/api/v1/users/')
      .set('Authorization', userJwt)
      .expect(200)
      .expect((response) => {
        const { users } = response.body;
        assert.equal(users.length, dummyUsers.length);
      }));

    it(`should respond with n=limit numbers of users when
       limit and offset is provided as query strings`, () => request
        .get('/api/v1/users/?limit=5&offset=0')
        .set('Authorization', userJwt)
        .expect(200)
        .expect((response) => {
          const randomUserIndex = Number
            .parseInt(Math
              .random() * (3), 10);
          const users = response.body.users;
          assert.equal(users.length, 5);
          assert
            .equal(
              dummyUsers[randomUserIndex].username,
              users[randomUserIndex].username);
          const pageMetaData = response.body.metaData;
          assert.equal(pageMetaData.totalCount, dummyUsers.length);
          assert.equal(pageMetaData.currentPage, 1);
          assert.equal(pageMetaData.pageCount, 3);
          assert.equal(pageMetaData.pageSize, 5);
        }));
    it(`should respond with an error message
       limit or query is not number`, () => request
        .get('/api/v1/users/?limit=one&offset=0')
        .set('Authorization', userJwt)
        .expect(406)
        .expect(response => assert
          .equal(ErrorConstants.paginationQueryError, response.body.error))
    );
  });
  describe('POST /api/v1/users/', () => {
    const {
      badEmailError,
      incompleteCredentialsError,
      conflictingPasswordError
    } = ErrorConstants.userAuthErrors;

    beforeEach(() => {
      after(() => User
        .destroy({ where: {}, cascade: true, restartIdentity: true }));
    });
    it(`should respond with an error message when provided with 
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
    it(`shoud respond with an error message when 
    password and cofirmation password conflicts`, () => {
        const supertestPromise = request.post('/api/v1/users')
          .send({
            email: 'fizzy@gmail.com',
            password: 'password',
            confirmationPassword: 'passwskde',
            username: 'andela'
          })
          .expect(400)
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
});
