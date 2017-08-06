
// eslint-disable-next-line
import bcrypt from 'bcrypt';
import { User } from '../models';
import errorMessages from '../constants/errors';
import successMessages from '../constants/successes';
import authHelpers from '../helpers/authHelpers';
import helpers from '../helpers/helpers';

const { userAuthErrors } = errorMessages;
const { userAuthSuccess } = successMessages;
const { filterUsersResult } = helpers;

export default {
  loginUser: (request, response) => {
    const { email, password } = request.body;
    return User.findOne({ where: { email } })
      .then((user) => {
        const hashedPassword = user.dataValues.password;
        const userCredentials = user.dataValues;
        const successMessage = userAuthSuccess.successfulLogin;
        authHelpers.isPasswordCorrect(password, hashedPassword);
        return authHelpers
          .sendUniqueJWT(userCredentials, response, successMessage);
      })
      .catch(() => {
        response.status(401).json({ error: userAuthErrors.wrongEmailOrPassword });
      });
  },
  signupUser: (request, response) => {
    const {
      email,
      password,
      confirmationPassword
    } = request.body;

    if (authHelpers.isTheTwoPasswordsSame(password,
      confirmationPassword,
      response)) {
      return User.create({ email, password })
        .then(user => authHelpers.sendUniqueJWT(user.dataValues, response))
        .catch(error => authHelpers.handleSignupError(error, response))
        .catch(() => User.findOne({ where: { email } }))
        .then((user) => {
          const { dataValues } = user;
          if (dataValues) {
            return authHelpers.sendUniqueJWT(dataValues, response);
          }
        })
        .catch(() => response
          .status(503)
          .json({
            error: 'your connection is probably slow. Please try again after a while'
          }));
    }
  },
  getUsers: (request, response) => {
    if (Object.keys(request.query).length) {
      return response.send({
        endpoint: '/user/?limit={integer}&offset={integer}',
        explain: 'Pagination for users'
      });
    }
    return User.findAll()
      .then(users => response.json({ users: filterUsersResult(users) }));
  },
  deleteUser: (request, response) => {
    response.send({
      endpoint: '/users/:id',
      explain: 'delete user'
    });
  },
  searchUser: (request, response) => {
    response.send({
      endpoint: '/search/documents/',
      explain: 'search for a user'
    });
  }
};
