import { assert } from 'chai';
import supertest from 'supertest';
import server from '../../server/server';
import errorConstants from '../../server/constants/errorConstants';
import successConstants from '../../server/constants/successConstants';
import dummyUsers from '../dummyData/dummyUsers';
import { User } from '../../server/models';

const request = supertest(server);
const { userAuthErrors } = errorConstants;

describe('PUT /ap/v1/users/:id', () => {
  let jwt;
  let sampleUserId;
  const sampleUser = dummyUsers[0];
  beforeEach(() => User
    .destroy({ where: {}, cascade: true, restartIdentity: true })
    .then(() => User.create(sampleUser))
    .then(() => {
      const userLoginPromise = request
        .post('/api/v1/users/login')
        .send(sampleUser)
        .expect(200)
        .then((response) => {
          jwt = response.body.token;
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
      const { badEmailError } = errorConstants.userAuthErrors;
      return request
        .put(`/api/v1/users/${sampleUserId}`)
        .send({
          email: 'fff.com',
          password,
          username,
          newPassword: 'password',
          confirmationPassword: 'password'
        })
        .set('Authorization', jwt)
        .expect(400)
        .expect((response) => {
          const error = response.body.errors;
          assert.equal(error.field, 'email');
          assert.equal(error.message, badEmailError);
        });
    });
  it(`should respond with '${userAuthErrors.wrongEmailOrPassword}' when
  authorization password doesn't belong to the user to be updated`, () => {
      const { username, newPassword, confirmationPassword } = sampleUser;
      return request
        .put(`/api/v1/users/${sampleUserId}`)
        .send({ username, newPassword, confirmationPassword, password: '2343' })
        .set('Authorization', jwt)
        .expect(403)
        .expect((response) => {
          assert.equal(response.body.error, userAuthErrors.wrongPasswordError);
        });
    });
  it(`should respond with '${errorConstants.userNotFound}' when 
  provided route is
    called with a none existing id`, () => request
      .put('/api/v1/users/9999999')
      .set('Authorization', jwt)
      .send({
        username: 'username',
        password: 'password',
        bio: 'bio'
      })
      .expect(404)
      .expect((response) => {
        assert.equal(response.body.error, errorConstants.userNotFound);
      }));

  it(`should respond with '${errorConstants.wrongIdTypeError}' when the id 
  provided in the request url is not a number`, () => request
      .put('/api/v1/users/somejargon')
      .set('Authorization', jwt)
      .send({
        email: 'some@email.com',
        password: 'somepassword',
        bio: 'this is a jargon bio'
      })
      .expect(400)
      .expect((response) => {
        assert.equal(response.body.error, errorConstants.wrongIdTypeError);
      }));
  it(`should respond with '${errorConstants.passwordUpdateError}' 
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
        .set('Authorization', jwt)
        .expect(409)
        .expect((response) => {
          const errorMessage = response.body.error;
          assert.equal(errorMessage, errorConstants.passwordUpdateError);
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
        .set('Authorization', jwt)
        .expect(200)
        .expect((response) => {
          const { message, user } = response.body;
          const { userSuccessfullyUpdated } = successConstants;
          assert.equal(message, userSuccessfullyUpdated);
          assert.equal(user.bio, 'this is a new bio');
        });
    });
});
