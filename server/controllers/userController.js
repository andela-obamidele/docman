import { User } from '../models';
import errorMessages from '../constants/errors';
import successMessages from '../constants/successes';
import authHelpers from '../helpers/authHelpers';
import helpers from '../helpers/helpers';

const { userAuthErrors } = errorMessages;

const { userAuthSuccess, userDeleteSuccessful } = successMessages;
const { filterUsersResult, getPageMetadata } = helpers;

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
        response.status(401).json({
          error: userAuthErrors.wrongEmailOrPassword
        });
      });
  },
  signupUser: (request, response) => {
    const {
      email,
      password,
      confirmationPassword,
      username
    } = request.body;

    if (authHelpers.isTheTwoPasswordsSame(password,
      confirmationPassword,
      response)) {
      return User.create({ email, password, username })
        .then(user => authHelpers.sendUniqueJWT(user.dataValues, response))
        .catch(error => authHelpers.handleSignupError(error, response))
        .catch(() => User.findOne({ where: { email } }))
        .then((user) => {
          const { dataValues } = user;
          if (dataValues) {
            return authHelpers.sendUniqueJWT(dataValues, response);
          }
        })
        .catch(() => {
          response
            .status(503)
            .json({
              error: `your connection is probably slow.
              Please try again after a while`
            });
        });
    }
  },
  getUsers: (request, response) => {
    let { limit, offset } = request.query;
    if (limit && offset) {
      if (Number.isNaN(Number(limit)) || Number.isNaN(Number(offset))) {
        return response
          .status(406)
          .json({ error: errorMessages.paginationQueryError });
      }
      limit = Number.parseInt(limit, 10);
      offset = Number.parseInt(offset, 10);
      return User.findAndCountAll({ limit, offset })
        .then((queryResult) => {
          const users = filterUsersResult(queryResult.rows);
          const metaData = getPageMetadata(limit, offset, queryResult.count);
          return response.json({ users, metaData });
        });
    }
    return User.findAndCountAll()
      .then(queryResult => response
        .json({
          users: filterUsersResult(queryResult.rows),
          metaData: {
            count: queryResult.count
          }
        }));
  },
  getUserById: (request, response) => {
    const userQueryPromise = User.findById(request.params.id)
      .then((queryResult) => {
        if (!queryResult) {
          return response
            .status(404)
            .json({ error: errorMessages.userNotFound });
        }
        return response.json(queryResult.dataValues);
      })
      .catch(() => response
        .status(400)
        .json({ error: errorMessages.wrongIdTypeError }));
    return userQueryPromise;
  },
  updateUserInfo: (request, response) => {
    const updateData = helpers.getOnlyTruthyAttributes(request.body);
    return User.findById(request.params.id)
      .then((queryResult) => {
        helpers.terminateUserUpdateOnBadPayload(
          updateData,
          request.body,
          queryResult);
        let { userSuccessfullyUpdated } = userAuthSuccess;
        if (request.body.newPassword) {
          updateData.password = request.body.newPassword;
          userSuccessfullyUpdated += ` ${userAuthSuccess.userUpdatedPassword}`;
        }
        return queryResult
          .update(updateData)
          .then((user) => {
            user.dataValues.password = '********';
            return response
              .json({
                user: user.dataValues,
                message: userSuccessfullyUpdated
              });
          });
      })
      .catch(error => helpers.handleUserUpdateError(error, response));
  },
  deleteUser: (request, response) => {
    const userToDelete = request.params.id;
    User.destroy({ where: { id: userToDelete } })
      .then(() => response
        .status(200)
        .json({
          message: userDeleteSuccessful
        })
      );
  },
  searchUser: (request, response) => {
    response.send({
      endpoint: '/search/documents/',
      explain: 'search for a user'
    });
  }
};
