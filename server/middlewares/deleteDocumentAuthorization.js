import ErrorConstants from '../constants/ErrorConstants';
import { Document } from '../models';
import Constants from '../constants/Constants';

const {
  docDeleteUnauthorizedError,
  voidDocumentDeleteError,
} = ErrorConstants;
/**
 * @description allows users to delete only his document. 
 * Allows admin to delete all documents
 * 
 * @param {Request} request Http request object from express
 * @param {Response} response HTTP response object from express 
 * @param {function} next next function provided by the express. 
 * it passes control to the next middleware
 * 
 * @returns {Promise | void} Promise from express HTTP response
 */
const deleteDocumentAuthorization = (request, response, next) => {
  const user = response.locals.user;
  const idToBeDeleted = request.params.id;
  let statusCode = 400;
  Document.findById(idToBeDeleted)
    .then((queryResult) => {
      const error = new Error();
      if (!queryResult) {
        error.message = voidDocumentDeleteError;
        statusCode = 404;
        throw error;
      }
      const expectedUserId = queryResult.dataValues.authorId;
      if (expectedUserId !== user.id && user.roleId !== Constants.adminRole) {
        error.message = docDeleteUnauthorizedError;
        statusCode = 403;
        throw error;
      }
      next();
    })
    .catch(error => response
      .status(statusCode)
      .json({ error: error.message })
    );
};
export default deleteDocumentAuthorization;
