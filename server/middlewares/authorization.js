import jwt from 'jsonwebtoken';
import { User } from '../models';
import errorConstants from '../constants/errorConstants';

const { userAuthErrors } = errorConstants;
/**
 * @description Uses jason web token to authorize users to access other routes
 * @param {Request} request http request from express
 * @param {Response} response http response from express
 * @param {function} next next function provided by express to middleware
 * @return {Promise | void} Promise from http response or void if payload 
 * passes the middleware without error
 */
const authorization = (request, response, next) => {
  const authorizationError = new Error();
  authorizationError.message = userAuthErrors.unAuthorizedUserError;
  let token = request.headers.authorization || '';
  token = token.split(' ')[1];
  let user = jwt.decode(token);
  if (user && user.data.id) {
    user = user.data;
    User.findById(user.id)
      .then((queryResult) => {
        if (!queryResult) {
          throw authorizationError;
        }
        response.locals.user = user;
        next();
      })
      .catch(error => response.status(401).json({ error: error.message }));
  } else {
    return response
      .status(401)
      .json({ error: userAuthErrors.unAuthorizedUserError });
  }
};
export default authorization;
