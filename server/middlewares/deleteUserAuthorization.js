import jwt from 'jsonwebtoken';
import errorConstants from '../constants/errorConstants';
import { User } from '../models';
import constants from '../constants/constants';

const {
  userDeleteUnauthorizedError,
  voidUserDeleteError,
} = errorConstants;
/**
 * @description allows users to delete only his account. 
 * Allows admin to delete all accounts
 * @param {Request} request Http request object from express
 * @param {Response} response HTTP response object from express 
 * @param {function} next next function provided by the express. 
 * it passes control to the next middleware
 * @returns {Promise | void} Promise from express HTTP response
 */
const deleteUserAuthorization = (request, response, next) => {
  let token = request.headers.authorization;
  token = token.split(' ')[1];
  const user = jwt.decode(token).data;
  let statusCode = 400;
  const idToBeDeleted = request.params.id;
  User.findById(idToBeDeleted)
    .then((queryResult) => {
      const error = new Error();
      if (!queryResult) {
        statusCode = 404;
        error.message = voidUserDeleteError;
        throw error;
      }
      const expectedUserId = queryResult.dataValues.id;
      if (expectedUserId !== user.id && user.roleId !== constants.adminRole) {
        error.message = userDeleteUnauthorizedError;
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
export default deleteUserAuthorization;
