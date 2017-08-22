import errorConstants from '../constants/errorConstants';
import { Document } from '../models';
import constants from '../constants/constants';

const {
  docDeleteUnauthorizedError,
  voidDocumentDeleteError,
} = errorConstants;
/**
 * @description allows users to delete only his document. 
 * Allows admin to delete all documents
 * @param {Request} request Http request object from express
 * @param {Response} response HTTP response object from express 
 * @param {function} next next function provided by the express. 
 * it passes control to the next middleware
 * @returns {Promise | void} Promise from express HTTP response
 */
const deleteDocumentAuthorization = (request, response, next) => {
  const user = response.locals.user;
  const idToBeDeleted = request.params.id;
  Document.findById(idToBeDeleted)
    .then((queryResult) => {
      const error = new Error();
      if (!queryResult) {
        error.message = voidDocumentDeleteError;
        throw error;
      }
      const expectedUserId = queryResult.dataValues.author;
      if (expectedUserId !== user.id && user.role !== constants.adminRole) {
        error.message = docDeleteUnauthorizedError;
        throw error;
      }
      next();
    })
    .catch(error => response
      .status(403)
      .json({ error: error.message })
    );
};
export default deleteDocumentAuthorization;
