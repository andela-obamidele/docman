import errorConstants from '../constants/errorConstants';
import helpers from './helpers';

const documentHelpers = {
  /**
   * @description  create handle potential errors from createDocuemtn controller
   * @param {Error} error error from create documents controller 
   * @param {object} response expressjs response object
   * @returns {Promise} promise from expressjs response
   */
  handleCreateDocumentError(error, response) {
    const errorMessage = errorConstants.genericCreateDocErrorMessage;
    if (error.original) {
      const errorCode = error.original.code;
      if (errorConstants.errorCodes.erDupEntry === errorCode) {
        return response
          .status(409)
          .json({ error: errorConstants.duplicateDocTitleError });
      } else if (errorConstants.errorCodes.invalidEnumInput === errorCode) {
        return response
          .status(403)
          .json({ error: errorConstants.invalidDocAccessLevelError });
      }
    } else if (error.errors) {
      const errors = this.handleValidationErrors(error.errors);
      const errorResponse = {};
      if (errors.length === 1) {
        errorResponse.error = errors.pop();
      } else {
        errorResponse.errors = errors;
      }
      return response
        .status(400)
        .json(errorResponse);
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
      error.message = errorConstants.nullDocumentUpdateError;
      throw error;
    } else if (!updateData) {
      error.message = errorConstants.emptyDocUpdateError;
      throw error;
    } else if (doc.dataValues.authorId !== currentUserId) {
      error.message = errorConstants.unauthorizedDocumentUpdateError;
      throw error;
    }
  },
  handleDocumentUpdateErrors(error, response) {
    const {
      nullDocumentUpdateError,
      unauthorizedDocumentUpdateError,
      emptyDocUpdateError } = errorConstants;
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
      if (errorConstants.errorCodes.invalidEnumInput === errorCode) {
        return response
          .status(403)
          .json({ error: errorConstants.invalidDocAccessLevelError });
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
    if (doc.access === 'private' && doc.authorId !== user.id) {
      return false;
    } else if (doc.access === 'role' && user.roleId > doc.roleId) {
      return false;
    }
    return true;
  },
  removeRestrictedDocuments(user, docs) {
    docs = docs.filter(doc =>
      this.isUserCanAccessDocument(user, doc));
    return docs;
  },
  /**
   * @description generates query constraint based on current user
   * used in getDocuments
   * @param {object}  currentUser currently logged in user data
   * @param {object} paginationQueryStrings optional argument: 
   * it should contain limit and offset
   * @return {object} query options to be used in documents
   */
  generateFindDocumentsOptions(currentUser, paginationQueryStrings) {
    const queryOptions = {};
    if (paginationQueryStrings) {
      queryOptions.limit = paginationQueryStrings.limit;
      queryOptions.offset = paginationQueryStrings.offset;
    }
    queryOptions.where = {
      $or: [{ access: 'public' }, {
        access: 'role',
        $and: { roleId: currentUser.roleId }
      }, {
        access: 'private',
        $and: { authorId: currentUser.id }
      }]
    };
    return queryOptions;
  },
  /**
   * @description  generates query constraint based on current user
   * used in getUserDocuments controller
   * @param {object} currentUser currently logged in user
   * @param {number} userToSearchId id of the user whose documents is to be
   * searched
   * @return {object} query options to be used in getDocumentsController
   */
  generateFindUserDocumentsOptions(currentUser, userToSearchId) {
    userToSearchId = Number.parseInt(userToSearchId, 10);
    const queryOptions = { where: {} };
    queryOptions.where = { authorId: userToSearchId };

    if (currentUser.roleId === 1) {
      queryOptions.where.$or = [
        { access: 'public' },
        {
          access: 'role',
        },
      ];
    } else if (currentUser.roleId === 2 && currentUser.id !== userToSearchId) {
      queryOptions.where.$or = [
        { access: 'public' },
        {
          access: 'role',
        },
      ];
      queryOptions.where.$and = { roleId: 2 };
    }
    return queryOptions;
  }
};
documentHelpers.handleValidationErrors = helpers.handleValidationErrors;
documentHelpers.getPageMetadata = helpers.getPageMetadata;
export default documentHelpers;
