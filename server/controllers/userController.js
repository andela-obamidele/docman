import { User } from '../models';
import ErrorConstants from '../constants/ErrorConstants';
import SuccessConstants from '../constants/SuccessConstants';
import AuthHelpers from '../helpers/AuthHelpers';
import UserHelpers from '../helpers/UserHelpers';

const {
  userAuthErrors,
  unmatchedUserSearch,
  genericErrorMessage } = ErrorConstants;

const { userDeleteSuccessful } = SuccessConstants;
const { filterUsersResult, getPageMetadata } = UserHelpers;

const UserController = {
  /**
   * @description responds with a json web token to be used for authorization
   * on providing email and password. or an error message if an error occurs 
   * in when using this method
   * 
   * @param {object} request Express http request object
   * 
   * @param {object} response Express http response object
   * 
   * @returns {Promise} Promise object from express HTTP response
   */
  loginUser: (request, response) => {
    const { email, password } = request.body;
    return User.findOne({ where: { email } })
      .then((user) => {
        const hashedPassword = user.dataValues.password;
        const userCredentials = user.dataValues;
        AuthHelpers.isPasswordCorrect(password, hashedPassword);
        return AuthHelpers
          .sendUniqueJWT(userCredentials, response, false);
      })
      .catch((error) => {
        const errorMessage = error.toString();
        if (errorMessage.indexOf('null') > -1 ||
          error.indexOf('password') > -1) {
          return response.status(401).json({
            error: userAuthErrors.wrongEmailOrPassword
          });
        }
        return response
          .status(500)
          .json(ErrorConstants.genericErrorMessage);
      });
  },

  /**
   * @description responds with a json web token to be used for authorization
   * on providing email and password and username or an error message 
   * when an error occur while using this endpoint
   * 
   * @param {object} request Express http request object
   * 
   * @param {object} response Express http response object
   * 
   * @returns {Promise} Promise object from express HTTP response
   */
  signupUser: (request, response) => {
    const {
      email,
      password,
      confirmationPassword,
      username
    } = request.body;

    if (AuthHelpers.confirmPassword(password,
      confirmationPassword,
      response)) {
      return User.create({ email, password, username })
        .then((user) => {
          AuthHelpers.sendUniqueJWT(user.dataValues, response, true);
        })
        .catch((error) => {
          AuthHelpers.handleSignupError(error, response);
        })
        .catch(() => User.findOne({ where: { email } }))
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
  *
  * @param {object} request Express http request object
  *
  * @param {object} response Express http response object
  *
  * @returns {Promise} Promise object from express HTTP response
  */
  getUsers: (request, response) => {
    const options = {};
    if (response.locals.paginationQueryStrings) {
      const { limit, offset } = response.locals.paginationQueryStrings;
      options.limit = limit;
      options.offset = offset;
    }
    options.attributes = { exclude: ['roleId', 'updatedAt', 'email'] };
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
      })
      .catch(() => response
        .status(500).json({ error: ErrorConstants.genericErrorMessage }));
  },

  /**
  * @description responds with a simgle user object from the
  *
  * @param {object} request Express http request object
  *
  * @param {object} response Express http response object
  *
  * @returns {Promise} Promise object from express HTTP response
  */
  getUserById: (request, response) => User.findById(request.params.id)
    .then((user) => {
      if (!user) {
        return response
          .status(404)
          .json({ error: ErrorConstants.userNotFound });
      }
      const { password,
        bio,
        updatedAt,
        fullName,
        roleId,
        email,
        ...userData
      } = user.dataValues;
      const currentUserId = response.locals.user.id;
      const isUserIdOwner = currentUserId === Number
        .parseInt(request.params.id, 10);
      if (isUserIdOwner) {
        userData.email = email;
      }
      return response.json({
        ...userData,
        fullName: !fullName ? 'not set' : fullName,
        bio: !bio ? 'not set' : bio
      });
    })
    .catch(() => response
      .status(500)
      .json({ error: ErrorConstants.genericErrorMessage })),

  /**
  * @description updates any user data apart from id. reponds
  * with new user object or error message if any error occurs in 
  * the process. It is only going to get needed payload and ignore
  * other payloads
  *
  * @param {object} request Express http request object
  *
  * @param {object} response Express http response object
  *
  * @returns {Promise} Promise object from express HTTP response
  */
  updateUserInfo: (request, response) => {
    const updateData = UserHelpers.getTruthyAttributes(request.body);
    return User.findById(request.params.id)
      .then((user) => {
        UserHelpers.terminateUserUpdateOnBadPayload(
          updateData,
          request.body,
          user);
        let { userSuccessfullyUpdated } = SuccessConstants;
        if (request.body.newPassword) {
          updateData.password = request.body.newPassword;
          userSuccessfullyUpdated += ` ${SuccessConstants.userUpdatedPassword}`;
        }
        return user
          .update(updateData)
          .then((updatedUser) => {
            const {
              password,
              bio,
              fullName,
              ...otherUserData } = updatedUser.dataValues;
            return response
              .json({
                user: {
                  ...otherUserData,
                  bio: !bio ? 'not set' : bio,
                  fullName: !fullName ? 'not set' : fullName
                },
                message: userSuccessfullyUpdated
              });
          });
      })
      .catch(error => UserHelpers.handleUserUpdateError(error, response));
  },

  /**
  * @description deletes a user from the database. responds with a success
  * message. there is no error handling in this method as all error handling
  * is expected to be done by a middleware
  *
  * @param {object} request Express http request object
  *
  * @param {object} response Express http response object
  *
  * @returns {Promise} Promise object from express HTTP response
  */
  deleteUser: (request, response) => {
    const userToDelete = request.params.id;
    return User.destroy({ where: { id: userToDelete } })
      .then(() => response
        .status(200)
        .json({
          message: userDeleteSuccessful
        })
      ).catch(() => response
        .status(500).json(ErrorConstants.genericErrorMessage));
  },

  /**
  * @description searches user by email. respoonds with all
  * matching instances or an error message if search term does
  * not match any email in the database
  *
  * @param {object} request Express http request object
  *
  * @param {object} response Express http response object
  *
  * @returns {Promise} Promise object from express HTTP response
  */
  searchUser: (request, response) => {
    const query = request.query.q;
    User.findAndCountAll({
      where: { email: { $ilike: `%${query}%` } },
      attributes: { exclude: ['password', 'email'] }
    })
      .then((users) => {
        if (!users.count) {
          return response
            .status(404)
            .json({ error: unmatchedUserSearch });
        }
        return response
          .json({ matches: users.count, users: filterUsersResult(users.rows) });
      })
      .catch(() => response.status(500).json({ error: genericErrorMessage }));
  }
};
export default UserController;
