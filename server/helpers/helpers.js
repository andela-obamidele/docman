import authHelpers from './authHelpers';
import errorMessages from '../constants/errors';

const { userAuthErrors, errorCodes } = errorMessages;
export default {
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
   * @description - Return metadata for pagination
   * @param {number} limit number of data to per page
   * @param {number} offset represents steps away from starting point
   * @param {object} queryResult total number of data
   * @returns {object} object containing metadata for pagination
   */
  getPageMetadata(limit, offset, queryResult) {
    const count = queryResult.count;
    const queryHasNoData = !queryResult.rows[0];
    const metaData = {};
    limit = limit > count ? count : limit;
    offset = offset > count ? count : offset;
    metaData.totalCount = count;
    metaData.currentPage = Math.floor(offset / limit) + 1;
    metaData.pageCount = Math.ceil(count / limit);
    metaData.pageSize = Number(limit);
    if (queryHasNoData) {
      metaData.message = errorMessages.endOfPageReached;
    }
    return metaData;
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
   * @description used by both document and users to
   * routes to handle validation errors
   * @param {Error[]} errors an array of sequelize validation errors
   * @returns {object[]} an array of error messages and fields
   */
  handleValidationErrors(errors) {
    const errorResponse = [];
    errors.forEach((errorObject) => {
      let message = errorObject.message.replace('null', 'empty');
      if (!errorObject.message) {
        message = `it appears that you are not providing
${errorObject.path}`;
        errorObject.message = message;
      }

      errorResponse
        .push({
          message,
          field: errorObject.path,
        });
    });
    return errorResponse;
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
  handleCreateDocumentError(error, response) {
    const errorMessage = errorMessages.genericCreateDocErrorMessage;
    if (error.original) {
      const errorCode = error.original.code;
      if (errorMessages.errorCodes.erDupEntry === errorCode) {
        return response
          .status(403)
          .json({ error: errorMessages.duplicateDocTitleError });
      } else if (errorMessages.errorCodes.invalidEnumInput === errorCode) {
        return response
          .status(403)
          .json({ error: errorMessages.invalidDocAccessLevelError });
      }
    } else if (error.errors) {
      const errors = this.handleValidationErrors(error.errors);
      return response
        .status(403)
        .json({ errors });
    }
    return response
      .status(400)
      .json({ error: errorMessage });
  },
  /**
   * @description throws error if current user is trying to update a
   * document which doesn't belong to her or when document user is trying
   * to update does not exist
   * @param {object} doc Document query result by id
   * @param {number} currentUserId  id for currently logged in user
   * @param {object} updateData 
   * @returns {void}
   */
  terminateDocUpdateOnBadPayload(doc, currentUserId, updateData) {
    const error = new Error();
    if (!doc) {
      error.message = errorMessages.nullDocumentUpdateError;
      throw error;
    } else if (!updateData) {
      error.message = errorMessages.emptyDocUpdateError;
      throw error;
    } else if (doc.dataValues.author !== currentUserId) {
      error.message = errorMessages.unauthorizedDocumentUpdateError;
      throw error;
    }
  },
  handleDocumentUpdateErrors(error, response) {
    const {
      nullDocumentUpdateError,
      unauthorizedDocumentUpdateError,
      emptyDocUpdateError } = errorMessages;
    if (error.errors) {
      const errors = this.handleValidationErrors(error.errors);
      return response.status(400).json({ errors });
    } else if (error.message === nullDocumentUpdateError) {
      return response.status(403).json({ error: nullDocumentUpdateError });
    } else if (error.message === unauthorizedDocumentUpdateError) {
      return response
        .status(403)
        .json({ error: unauthorizedDocumentUpdateError });
    } else if (error.message === emptyDocUpdateError) {
      return response
        .status(400).json({ error: emptyDocUpdateError });
    } else if (error.original) {
      const errorCode = error.original.code;
      if (errorMessages.errorCodes.invalidEnumInput === errorCode) {
        return response
          .status(403)
          .json({ error: errorMessages.invalidDocAccessLevelError });
      }
    }
  },
  getTruthyDocUpdate(payload) {
    const { access, title, content } = payload;
    payload = { access, title, content };
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
  isUserCanAccessDocument(user, doc) {
    if (doc.access === 'private' && doc.author !== user.id) {
      return false;
    } else if (doc.access === 'role' && user.role > doc.role) {
      return false;
    }
    return true;
  },
  removeRestrictedDocuments(user, docs) {
    docs = docs.filter(doc =>
      this.isUserCanAccessDocument(user, doc));
    return docs;
  }
};
