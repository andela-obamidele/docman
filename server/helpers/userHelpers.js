import AuthHelpers from './AuthHelpers';
import ErrorConstants from '../constants/ErrorConstants';
import Helpers from './Helpers';

const {
  userAuthErrors,
  errorCodes,
  genericUserUpdateError
} = ErrorConstants;

const userHelpers = {
  /**
   * @description returns a new user object containing
   * id, email, createdAt, updatedAt, and roleId.
   * Helps eleminate noise from user objects
   * 
   * @param {object[]} users - sequelize queried result
   * 
   * @returns {object[]} - New object containing only specified props
   */
  filterUsersResult(users) {
    const filteredUsers = users.map((user) => {
      const { id,
        email,
        createdAt,
        username,
        fullName,
        bio } = user.dataValues;
      return {
        id,
        email,
        createdAt,
        username,
        fullName: !fullName ? 'not set' : fullName,
        bio: !bio ? 'not set' : bio
      };
    });
    return filteredUsers;
  },
  /**
   * @description eleminate all falsy values from user object.
   * gets email, username, password, fullName and bio from object
   * if any of this value is falsy, they are eliminated from the returned
   * object
   * 
   * @param {object} payload user object
   * 
   * @returns {object} new user object containing truthy values only
   */
  getTruthyAttributes(payload) {
    const {
      email,
      username,
      password,
      fullName,
      bio
    } = payload;
    payload = {
      email,
      username,
      password,
      fullName,
      bio
    };
    const fetchKeys = Object.keys;
    const keys = fetchKeys(payload);
    let filteredPayload = {};
    keys.forEach((key) => {
      if (payload[key]) {
        filteredPayload[key] = payload[key];
      }
    });
    filteredPayload = fetchKeys(filteredPayload)[0] ? filteredPayload : null;
    return filteredPayload;
  },

  /**
   * @description helps userController.updateUserInfo to validate
   * payload before updating. Throws error if unexpected payload
   * is found
   * 
   * @param {object} expectedPayload  Payload expected from the user
   * @param {object} providedPayload Payload provided by the users
   * @param {object} user sequelize object queried from User model
   * 
   * @returns {void}
   */
  terminateUserUpdateOnBadPayload(expectedPayload, providedPayload, user) {
    expectedPayload
      .password = !expectedPayload.password ? '' : expectedPayload.password;
    if (!user) {
      throw new Error('unassigned id');
    }
    user = user.dataValues;
    const isPasswordCorrect = AuthHelpers
      .isPasswordCorrect(expectedPayload.password, user.password);
    if (!isPasswordCorrect) {
      throw new Error('hashedPassword and password does not match');
    }
    const { confirmationPassword, newPassword } = providedPayload;
    const isPasswordsMatch = AuthHelpers
      .confirmPassword(newPassword, confirmationPassword);
    if ((newPassword || confirmationPassword) && !isPasswordsMatch) {
      throw new Error('unmatched passwords');
    }
  },
  /**
   * @description help userController.updateUserInfo to handle possible errors
   * which might occur while updating
   * 
   * @param {object} error javascript error object
   * @param {Response} HTTPResponse express HTTP response object
   * 
   * @returns {Promise} from express http response object
   */
  handleUserUpdateError(error, HTTPResponse) {
    const { passwordUpdateError } = ErrorConstants;
    const errors = error.errors;

    if (errors) {
      let errorResponse = this.handleValidationErrors(errors);
      if (errorResponse.length === 1) {
        errorResponse = errorResponse.pop();
      }
      return HTTPResponse
        .status(400)
        .json({ errors: errorResponse });
    } else if (error.toString().indexOf('hashedPassword and password') > -1) {
      return HTTPResponse
        .status(403)
        .json({ error: userAuthErrors.wrongPasswordError });
    } else if (error.toString().indexOf('unmatched passwords') > -1) {
      return HTTPResponse
        .status(409)
        .json({ error: passwordUpdateError });
    } else if (error.toString().indexOf('unassigned id') > -1) {
      return HTTPResponse
        .status(404)
        .json(({ error: ErrorConstants.userNotFound }));
    } else if (error.original && error.original.code === errorCodes.notAnInt) {
      return HTTPResponse
        .status(400)
        .json({ error: ErrorConstants.wrongIdTypeError });
    }
    return HTTPResponse
      .status(500)
      .json({ error: genericUserUpdateError });
  },
};
userHelpers.handleValidationErrors = Helpers.handleValidationErrors;
userHelpers.getPageMetadata = Helpers.getPageMetadata;
export default userHelpers;
