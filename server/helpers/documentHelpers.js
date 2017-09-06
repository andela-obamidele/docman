import ErrorConstants from '../constants/ErrorConstants';
import Helpers from './Helpers';

const DocumentHelpers = {
  /**
   * @description  create handle potential errors from createDocuemtn controller
   * 
   * @param {Error} error error from create documents controller 
   * @param {object} response expressjs response object
   * 
   * @returns {Promise} promise from expressjs response
   */
  handleCreateDocumentError(error, response) {
    const errorMessage = ErrorConstants.genericCreateDocErrorMessage;
    if (error.original) {
      const errorCode = error.original.code;
      if (ErrorConstants.errorCodes.erDupEntry === errorCode) {
        return response
          .status(409)
          .json({ error: ErrorConstants.duplicateDocTitleError });
      } else if (ErrorConstants.errorCodes.invalidEnumInput === errorCode) {
        return response
          .status(403)
          .json({ error: ErrorConstants.invalidDocAccessLevelError });
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
      .status(500)
      .json({ error: errorMessage });
  },

  /**
   * @description throws error if current user is trying to update a
   * document which doesn't belong to her or when document user is trying
   * to update does not exist
   * 
   * @param {object} doc Document query result by id
   * @param {number} currentUserId  id for currently logged in user
   * @param {object} updateData 
   * 
   * @returns {void}
   */
  terminateDocumentUpdate(doc, currentUserId, updateData) {
    const error = new Error();
    if (!doc) {
      error.message = ErrorConstants.nullDocumentUpdateError;
      throw error;
    } else if (!updateData) {
      error.message = ErrorConstants.emptyDocUpdateError;
      throw error;
    } else if (doc.dataValues.authorId !== currentUserId) {
      error.message = ErrorConstants.unauthorizedDocumentUpdateError;
      throw error;
    }
  },
  /**
   * @description sends response to the client based on the type of error
   * that occured
   * 
   * @param {Error} error - Error which occured during Document update
   * @param {object} response - Response object from expressjs
   * 
   * @return {Promise} Promise object from expressjs server response
   */
  handleDocumentUpdateErrors(error, response) {
    const {
      nullDocumentUpdateError,
      unauthorizedDocumentUpdateError,
      emptyDocUpdateError } = ErrorConstants;
    let documentUpdateError;
    if (error.errors) {
      const errors = this.handleValidationErrors(error.errors);
      if (errors.length === 1) {
        documentUpdateError = { error: errors.pop() };
      } else {
        documentUpdateError = { errors };
      }
      return response.status(400).json(documentUpdateError);
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
      if (ErrorConstants.errorCodes.invalidEnumInput === errorCode) {
        return response
          .status(403)
          .json({ error: ErrorConstants.invalidDocAccessLevelError });
      }
    }
    return response.status(500)
      .json({ error: ErrorConstants.genericCreateDocErrorMessage });
  },

  /**
   * @description gets needed properties from document update payload
   * and remove falsy data from it
   * 
   * @param {object} payload object containing document update data
   * 
   * @returns {object} new payload data to be used for update
   */
  getTruthyUpdateData(payload) {
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

  /**
   * @description checks if a document is accessible by current
   * user
   * 
   * @param {object} user object containing user detail
   * @param {object} doc document object
   * 
   * @returns {boolean} true if document is accessible by current user.
   * False if otherwise
   */
  checkDocumentAccessibility(user, doc) {
    if (doc.access === 'private' && doc.authorId !== user.id) {
      return false;
    } else if (doc.access === 'role' && user.roleId > doc.roleId) {
      return false;
    }
    return true;
  },

  /**
   * @description removes restricted documents from document
   * query result
   * 
   * @param {object} user object containing user detail
   * @param {object} docs document object
   * 
   * @returns {object} array of unrestricted documents
   */
  removeRestrictedDocuments(user, docs) {
    const newDocuments = [];
    docs.forEach((doc) => {
      if (this.checkDocumentAccessibility(user, doc)) {
        const { roleId, ...otherDocumentData } = doc.dataValues;
        newDocuments.push(otherDocumentData);
      }
    });
    return newDocuments;
  },

  /**
   * @description generates query constraint based on current user
   * used in getDocuments
   * 
   * @param {object}  currentUser currently logged in user data
   * @param {object} paginationQueryStrings optional argument: 
   * it should contain limit and offset
   * 
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
    queryOptions.attributes = { exclude: ['roleId'] };
    return queryOptions;
  },

  /**
   * @description  generates query constraint based on current user
   * used in getUserDocuments controller
   * 
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
    queryOptions.attributes = { exclude: ['roleId'] };
    return queryOptions;
  }
};
DocumentHelpers.handleValidationErrors = Helpers.handleValidationErrors;
DocumentHelpers.getPageMetadata = Helpers.getPageMetadata;
export default DocumentHelpers;
