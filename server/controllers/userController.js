
import jwt from 'jsonwebtoken';
import { User } from '../models';
import errorMessages from '../helpers/constants/errors';

const { userAuthErrors, errorCodes } = errorMessages;

const secret = process.env.SECRET;
export default {
  loginUser: (request, response) => {
    response.send({
      endpoint: '/users/login',
      explain: 'logs user in'
    });
  },
  signupUser: (request, response) => {
    const { email, password, confirmationPassword } = request.body;
    let errorMessage = errorMessages.GENERIC_ERROR_MESSAGE;
    if (password !== confirmationPassword) {
      errorMessage = userAuthErrors.CONFLICTING_PASSWORDS_ERROR;
      return response.status(400).send({
        error: errorMessage
      });
    }
    return User.findOrCreate({ where: { email, password } })
      .spread(() => {
        const token = jwt.sign({
          data: { email, password }
        }, secret, { expiresIn: '48h' });
        response.json({
          message: 'signup successful',
          token
        });
      }).catch((error) => {
        if (error.original) {
          if (error.original.errno === errorCodes.ER_NO_DEFAULT_FOR_FIELD) {
            errorMessage = userAuthErrors.INCOMPLETE_CREDENTIALS_ERROR;
          } else if (error.original.errno === errorCodes.ER_DUP_ENTRY) {
            errorMessage = userAuthErrors.DUPLICATE_EMAIL_ERROR;
          }
        } else {
          const { errors } = error;
          errorMessage = errors[0].message;
        }
        return response.status(400).json({
          error: errorMessage
        });
      });
  },
  getUser: (request, response) => {
    if (Object.keys(request.query).length) {
      return response.send({
        endpoint: '/user/?limit={integer}&offset={integer}',
        explain: 'Pagination for users'
      });
    }
    response.send({
      endpoint: '/users/',
      explain: 'get matching instances of user'
    });
  },
  deleteUser: (request, response) => {
    response.send({
      endpoint: '/users/:id',
      explain: 'delete user'
    });
  },
  searchUser: (request, response) => {
    response.send({
      endpoint: '/search/documents/',
      explain: 'search for a user'
    });
  }
};
