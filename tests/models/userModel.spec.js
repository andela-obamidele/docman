import { assert } from 'chai';
import { User } from '../../server/models';

describe('User model', () => {
  before(() => User.destroy({ where: {}, cascade: true, restartIdentity: true })
  );
  it('should throw an error when inserting null into username', () =>
    User
      .create({
        username: null,
        password: 'password',
        email: 'email@email.com'
      })
      .catch((error) => {
        const validationError = error.errors[0];
        assert.equal(validationError.path, 'username');
        assert.equal(validationError.type, 'notNull Violation');
      })
  );
  it('should throw an error when inserting null into email', () => User
    .create({
      username: 'somiething',
      password: 'password',
      email: null
    })
    .catch((error) => {
      const validationError = error.errors[0];
      assert.equal(validationError.path, 'email');
      assert.equal(validationError.type, 'notNull Violation');
    })
  );
  it('should throw an error when inserting null into password', () => User
    .create({
      username: 'somiething',
      password: null,
      email: 'someone@email.com'
    })
    .catch((error) => {
      const validationError = error.errors[0];
      assert.equal(validationError.path, 'password');
      assert.equal(validationError.type, 'notNull Violation');
    })
  );
  it('should create user when all correct data are set', () => User
    .create({
      username: 'username',
      password: 'password',
      email: 'someone@email.com'
    })
    .then((user) => {
      assert.equal(user.username, 'username');
      assert.equal(user.email, 'someone@email.com');
    })
  );
  it('should hash pssword before saving it', () =>
    User.findOne({ where: { email: 'someone@email.com' } })
      .then(user => assert.notEqual(user.password, 'password'))
  );
});
