import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import errorMessages from '../constants/errors';
import successMessages from '../constants/successes';

const { conflictingPasswordError } = errorMessages.userAuthErrors;
const { errorCodes, userAuthErrors } = errorMessages;

const { successfulSignup } = successMessages.userAuthSuccess;

export default {
  /**
   * @description Checks if two passwords are the same. It takes
   * one optional parameter which is an any object that can create
   * http response
   * @param {string} password1 - first user password to be compared
   * @param {string} password2 - second password to be compared
   * @param {Response} [HTTPResponse] express http response object
   * @returns {boolean} - returns true  if passwords match
   * or false if passwords doesn't match
   */
  isTheTwoPasswordsSame(password1, password2, HTTPResponse) {
    if (password1 !== password2) {
      if (HTTPResponse) {
        const error = conflictingPasswordError;
        return !HTTPResponse.status(400).json({ error });
      }
      return false;
    }
    return true;
  },
  /**
   * @description generates a json web tokien
   * @param {object} userCredentials - an object containing current user detail
   * @returns {string} a json web token for current user
   */
  generateJWT(userCredentials) {
    const secret = process.env.SECRET;
    let token = 'JWT ';
    token += jwt.sign({ data: userCredentials }, secret, { expiresIn: '48h' });
    return token;
  },
  /**
   * @description - sends jwt to client
   * @param {object} userCredentials object containing user credentials
   * @param {Response} HTTPResponse any object capable of sending http response
   * (express preferrably)
   * @param {string} message - response message wished to be displayed
   * @returns {Promise} javascript promise from http response
   */
  sendUniqueJWT(userCredentials, HTTPResponse, message = successfulSignup) {
    const token = this.generateJWT(userCredentials);
    return HTTPResponse.json({ message, token });
  },
  /**
   * @description makes sure server respond with appropriate error message
   * during  signup
   * @param {object} error - signup error
   * @param {Response} HTTPResponse - express http response
   * @returns {Promise} Promise from express http response
   */
  handleSignupError(error, HTTPResponse) {
    let errorMessage = errorMessages.genericErrorMessage;

    if (error.original) {
      if (error.original.errno === errorCodes.errNoDefaultForField) {
        errorMessage = userAuthErrors.incompleteCredentialsError;
      } else if (error.original.errno === errorCodes.erDupEntry) {
        errorMessage = userAuthErrors.duplicateEmailError;
      }
    } else {
      const { errors } = error;
      errorMessage = errors[0].message;
    }
    return HTTPResponse.status(400).json({
      error: errorMessage
    });
  },
  /**
   * @description - Compares the password provided by client to
   * the one stored in database. It returns true if they match and false if not
   * @param {string} providedPassword - Password provided by client
   * @param {*} hashedPassword - User password stored in the database
   * @returns {boolean} true if password match. false if they don't
   */
  isPasswordCorrect(providedPassword, hashedPassword) {
    const isPasswordCorrect = bcrypt
      .compareSync(providedPassword, hashedPassword);
    return isPasswordCorrect;
  },
  verifyAuthToken: (token, isTokenJWT, secret) => new Promise((resolve, reject) => {
    jwt.verify(token, secret, (error, decode) => {
      if (error || !token || !isTokenJWT) {
        error = error || new Error();
        error.message = userAuthErrors.unAuthorizedUserError;
        return reject(error);
      }
      resolve(decode);
    });
  })
};