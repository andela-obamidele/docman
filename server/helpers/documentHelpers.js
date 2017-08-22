import errorConstants from '../constants/errorConstants';
import helpers from './helpers';

const documentHelpers = {
  handleCreateDocumentError(error, response) {
    const errorMessage = errorConstants.genericCreateDocErrorMessage;
    if (error.original) {
      const errorCode = error.original.code;
      if (errorConstants.errorCodes.erDupEntry === errorCode) {
        return response
          .status(403)
          .json({ error: errorConstants.duplicateDocTitleError });
      } else if (errorConstants.errorCodes.invalidEnumInput === errorCode) {
        return response
          .status(403)
          .json({ error: errorConstants.invalidDocAccessLevelError });
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
      error.message = errorConstants.nullDocumentUpdateError;
      throw error;
    } else if (!updateData) {
      error.message = errorConstants.emptyDocUpdateError;
      throw error;
    } else if (doc.dataValues.author !== currentUserId) {
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
documentHelpers.handleValidationErrors = helpers.handleValidationErrors;
documentHelpers.getPageMetadata = helpers.getPageMetadata;
export default documentHelpers;
