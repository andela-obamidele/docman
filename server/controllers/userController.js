import { User } from '../models';
import errorConstants from '../constants/errorConstants';
import successConstants from '../constants/successConstants';
import authHelpers from '../helpers/authHelpers';
import userHelpers from '../helpers/userHelpers';

const { userAuthErrors, unmatchedUserSearch } = errorConstants;

const { userDeleteSuccessful } = successConstants;
const { filterUsersResult, getPageMetadata } = userHelpers;

export default {
  /**
   * @description responds with a json web token to be used for authorization
   * on providing email and password. or an error message if an error occurs 
   * in when using this method
   * @param {object} request Express http request object
   * @param {object} response Express http response object
   * @returns {Promise} Promise object from express HTTP response
   */
  loginUser: (request, response) => {
    const { email, password } = request.body;
    return User.findOne({ where: { email } })
      .then((user) => {
        const hashedPassword = user.dataValues.password;
        const userCredentials = user.dataValues;
        authHelpers.isPasswordCorrect(password, hashedPassword);
        return authHelpers
          .sendUniqueJWT(userCredentials, response, false);
      })
      .catch(() => {
        response.status(401).json({
          error: userAuthErrors.wrongEmailOrPassword
        });
      });
  },
  /**
   * @description responds with a json web token to be used for authorization
   * on providing email and password and username or an error message 
   * when an error occur while using this endpoint
   * @param {object} request Express http request object
   * @param {object} response Express http response object
   * @returns {Promise} Promise object from express HTTP response
   */
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
        .then(user =>
          authHelpers.sendUniqueJWT(user.dataValues, response, true))
        .catch(error => authHelpers.handleSignupError(error, response))
        .catch(() => User.findOne({ where: { email } }))
        .then((user) => {
          const { dataValues } = user;
          if (dataValues) {
            return authHelpers.sendUniqueJWT(dataValues, response, true);
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
  /**
  * @description responds with list of all users when error when
  * request parameters does not contain limit and offset query
  * responds with list of users with pagination metadata
  * when request paramiters contains limit and offset query.
  *  or an error message if an error occurs 
  * in when using this method
  * @param {object} request Express http request object
  * @param {object} response Express http response object
  * @returns {Promise} Promise object from express HTTP response
  */
  getUsers: (request, response) => {
    const options = {};
    if (response.locals.paginationQueryStrings) {
      const { limit, offset } = response.locals.paginationQueryStrings;
      options.limit = limit;
      options.offset = offset;
    }
    return User.findAndCountAll(options)
      .then((queryResult) => {
        let metaData;
        if (response.locals.paginationQueryStrings) {
          metaData = getPageMetadata(options.limit,
            options.offset,
            queryResult);
        }
        return response
          .json({
            metaData,
            users: filterUsersResult(queryResult.rows)
          });
      });
  },
  /**
  * @description responds with a simgle user object from the
  * @param {object} request Express http request object
  * @param {object} response Express http response object
  * @returns {Promise} Promise object from express HTTP response
  */
  getUserById: (request, response) => {
    const userQueryPromise = User.findById(request.params.id)
      .then((user) => {
        if (!user) {
          return response
            .status(404)
            .json({ error: errorConstants.userNotFound });
        }
        const { password, ...userData } = user.dataValues;
        return response.json(userData);
      })
      .catch(() => response
        .status(400)
        .json({ error: errorConstants.wrongIdTypeError }));
    return userQueryPromise;
  },
  /**
  * @description updates any user data apart from id. reponds
  * with new user object or error message if any error occurs in 
  * the process. It is only going to get needed payload and ignore
  * other payloads
  * @param {object} request Express http request object
  * @param {object} response Express http response object
  * @returns {Promise} Promise object from express HTTP response
  */
  updateUserInfo: (request, response) => {
    const updateData = userHelpers.getOnlyTruthyAttributes(request.body);
    return User.findById(request.params.id)
      .then((user) => {
        userHelpers.terminateUserUpdateOnBadPayload(
          updateData,
          request.body,
          user);
        let { userSuccessfullyUpdated } = successConstants;
        if (request.body.newPassword) {
          updateData.password = request.body.newPassword;
          userSuccessfullyUpdated += ` ${successConstants.userUpdatedPassword}`;
        }
        return user
          .update(updateData)
          .then((updatedUser) => {
            user.dataValues.password = '********';
            return response
              .json({
                user: updatedUser.dataValues,
                message: userSuccessfullyUpdated
              });
          });
      })
      .catch(error => userHelpers.handleUserUpdateError(error, response));
  },
  /**
  * @description deletes a user from the database. responds with a success
  * message. there is no error handling in this method as all error handling
  * is expected to be done by a middleware
  * @param {object} request Express http request object
  * @param {object} response Express http response object
  * @returns {Promise} Promise object from express HTTP response
  */
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
  /**
  * @description searches user by email. respoonds with all
  * matching instances or an error message if search term does
  * not match any email in the database
  * @param {object} request Express http request object
  * @param {object} response Express http response object
  * @returns {Promise} Promise object from express HTTP response
  */
  searchUser: (request, response) => {
    const query = request.query.q;
    User.findAndCountAll({
      where: { email: { $ilike: `%${query}%` } },
      attributes: { exclude: ['password'] }
    })
      .then((users) => {
        if (!users.count) {
          return response
            .status(404)
            .json({ error: unmatchedUserSearch });
        }
        return response.json({ matches: users.count, users: users.rows });
      });
  }
};
