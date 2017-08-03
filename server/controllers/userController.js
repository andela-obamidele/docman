
// eslint-disable-next-line
import bcrypt from 'bcrypt';
import { User } from '../models';
import errorMessages from '../constants/errors';
import successMessages from '../constants/successes';
import authHelpers from '../helpers/authHelpers';

const { userAuthErrors } = errorMessages;
const { userAuthSuccess } = successMessages;

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
      return User.findOrCreate({ where: { email, password } })
        .spread((user) => {
          authHelpers.sendUniqueJWT(user.dataValues, response);
        }).catch((error) => {
          authHelpers.handleSignupError(error, response);
        });
    }
  },
  getUser: (request, response) => {
    if (Object.keys(request.query).length) {
      return response.send({
        endpoint: '/user/?limit={integer}&offset={integer}',
        explain: 'Pagination for users'
      });
    }
    response.send({
      endpoint: '/users/',
      explain: 'get matching instances of user'
    });
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
