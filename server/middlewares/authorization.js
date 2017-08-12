import jwt from 'jsonwebtoken';
import { User } from '../models';
import errorMessages from '../constants/errors';

const { userAuthErrors } = errorMessages;

export default (request, response, next) => {
  const authorizationError = new Error();
  authorizationError.message = userAuthErrors.unAuthorizedUserError;
  let token = request.headers.authorization || '';
  token = token.split(' ')[1];
  let user = jwt.decode(token);
  if (user) {
    user = user.data;
    User.findById(user.id)
      .then((queryResult) => {
        if (!queryResult) {
          throw authorizationError;
        }
        next();
      })
      .catch(error => response.status(403).json({ error: error.message }));
  } else {
    return response
      .status(403)
      .json({ error: userAuthErrors.unAuthorizedUserError });
  }
};
