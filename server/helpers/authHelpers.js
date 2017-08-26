import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import errorConstants from '../constants/errorConstants';

const { conflictingPasswordError } = errorConstants.userAuthErrors;
const { errorCodes, userAuthErrors } = errorConstants;

const authHelpers = {
  /**
   * @description compares two passwords. sends  http response if provided
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
        return !HTTPResponse.status(409).json({ error });
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
    const { password, ...otherCredentials } = userCredentials;
    token += jwt.sign({ data: otherCredentials }, secret, { expiresIn: '48h' });
    return token;
  },
  /**
   * @description - sends jwt to client
   * @param {object} userCredentials object containing user credentials
   * @param {Response} HTTPResponse any object capable of sending http response
   * (express preferrably)
   *  @param {boolean} isSignup expected to be true when method is called
   * @param {string} message - response message wished to be displayed
   * from signup controller
   * @returns {Promise} javascript promise from http response
   */
  sendUniqueJWT(userCredentials, HTTPResponse, isSignup) {
    const statusCode = isSignup ? 201 : 200;
    const token = this.generateJWT(userCredentials);
    return HTTPResponse.status(statusCode).json({ token });
  },
  /**
   * @description makes sure server respond with appropriate error message
   * during  signup
   * @param {object} error - signup error
   * @param {Response} HTTPResponse - express http response
   * @returns {Promise} Promise from express http response
   */
  handleSignupError(error, HTTPResponse) {
    let errorMessage = errorConstants.genericErrorMessage;
    let status = 400;
    const { original } = error;
    if (original) {
      if (original.code === errorCodes.errNoDefaultForField) {
        errorMessage = userAuthErrors.incompleteCredentialsError;
      } else if (original.code === errorCodes.erDupEntry) {
        const { constraint } = original;
        if (constraint.indexOf('email') > -1) {
          status = 409;
          errorMessage = userAuthErrors.duplicateEmailError;
        } else {
          status = 409;
          errorMessage = userAuthErrors.duplicateUsernameError;
        }
      }
    } else {
      const { errors } = error;
      const { incompleteCredentialsError } = userAuthErrors;
      const message = errors[0].message;
      errorMessage = message ? message
        .replace('null', 'empty') : incompleteCredentialsError;
    }
    return HTTPResponse.status(status).json({
      error: errorMessage
    });
  },
  /**
   * @description - Compares the password in the database to the one provided
   * @param {string} providedPassword - Password provided by client
   * @param {*} hashedPassword - User password stored in the database
   * @returns {boolean} true if password match. false if they don't
   */
  isPasswordCorrect(providedPassword, hashedPassword) {
    const isPasswordCorrect = bcrypt
      .compareSync(providedPassword, hashedPassword);
    return isPasswordCorrect;
  },
};
export default authHelpers;
