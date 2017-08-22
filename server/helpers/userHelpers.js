import authHelpers from './authHelpers';
import errorMessages from '../constants/errors';
import helpers from './helpers';

const { userAuthErrors, errorCodes } = errorMessages;
const userHelpers = {
  /**
   * @description returns a new user object containing
   * id, email, createdAt, updatedAt, and role.
   * Helps eleminate noise from user objects
   * @param {object[]} users - sequelize queried result
   * @returns {object[]} - New object containing only specified props
   */
  filterUsersResult(users) {
    const filteredUsers = users.map((user) => {
      const { id,
        email,
        createdAt,
        updatedAt,
        role,
        username,
        bio } = user.dataValues;
      return {
        id,
        email,
        createdAt,
        updatedAt,
        role,
        username,
        bio
      };
    });
    return filteredUsers;
  },
  /**
   * @description eleminate all falsy values from user object.
   * gets email, username, password, fullName and bio from object
   * if any of this value is falsy, they are eliminated from the returned
   * object
   * @param {object} payload user object
   * @returns {object} new user object containing truthy values only
   */
  getOnlyTruthyAttributes(payload) {
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
   * @param {object} expectedPayload  Payload expected from the user
   * @param {object} providedPayload Payload provided by the users
   * @param {object} user sequelize object queried from User model
   * @returns {void}
   */
  terminateUserUpdateOnBadPayload(expectedPayload, providedPayload, user) {
    if (!user) {
      throw new Error('unassigned id');
    }
    user = user.dataValues;
    const isPasswordCorrect = authHelpers
      .isPasswordCorrect(expectedPayload.password, user.password);
    if (!isPasswordCorrect) {
      throw new Error('hashedPassword and password does not match');
    }
    const { confirmationPassword, newPassword } = providedPayload;
    const isPasswordsMatch = authHelpers
      .isTheTwoPasswordsSame(newPassword, confirmationPassword);
    if ((newPassword || confirmationPassword) && !isPasswordsMatch) {
      throw new Error('unmatched passwords');
    }
  },
  /**
   * @description help userController.updateUserInfo to handle possible errors
   * which might occur while updating
   * @param {object} error javascript error object
   * @param {Response} HTTPResponse express HTTP response object
   * @returns {Promise} from express http response object
   */
  handleUserUpdateError(error, HTTPResponse) {
    const {
      passwordUpdateError,
      genericUserUpdateError
    } = errorMessages;
    const errors = error.errors;

    if (errors) {
      const errorResponse = this.handleValidationErrors(errors);
      return HTTPResponse
        .status(403)
        .json({ errors: errorResponse });
    } else if (error.toString().indexOf('hash') > -1) {
      return HTTPResponse
        .status(403)
        .json({ error: userAuthErrors.wrongPasswordError });
    } else if (error.toString().indexOf('unmatched passwords') > -1) {
      return HTTPResponse
        .status(403)
        .json({ error: passwordUpdateError });
    } else if (error.toString().indexOf('unassigned id') > -1) {
      return HTTPResponse
        .status(404)
        .json(({ error: errorMessages.userNotFound }));
    } else if (error.original && error.original.code === errorCodes.notAnInt) {
      return HTTPResponse
        .status(400)
        .json({ error: errorMessages.wrongIdTypeError });
    }
    return HTTPResponse
      .status(404)
      .json({ error: genericUserUpdateError });
  },
};
userHelpers.handleValidationErrors = helpers.handleValidationErrors;
userHelpers.getPageMetadata = helpers.getPageMetadata;
export default userHelpers;
