import jwt from 'jsonwebtoken';
import errorMessages from '../constants/errors';
import { User } from '../models';
import constants from '../constants/constants';

const {
  userDeleteUnauthorizedError,
  voidUserDeleteError,
} = errorMessages;
export default (request, response, next) => {
  let token = request.headers.authorization;
  token = token.split(' ')[1];
  const user = jwt.decode(token).data;
  const idToBeDeleted = request.params.id;
  User.findById(idToBeDeleted)
    .then((queryResult) => {
      const error = new Error();
      if (!queryResult) {
        error.message = voidUserDeleteError;
        throw error;
      }
      const expectedUserId = queryResult.dataValues.id;
      if (expectedUserId !== user.id && user.role !== constants.adminRole) {
        error.message = userDeleteUnauthorizedError;
        throw error;
      }
      next();
    })
    .catch(error => response
      .status(403)
      .json({ error: error.message })
    );
};
