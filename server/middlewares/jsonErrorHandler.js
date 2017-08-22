import errorConstants from '../constants/errorConstants';
/**
 * @description returns an error message if bad
 * json object is 
 * @param {Error} error javascript error object
 * @param {object} request express request promise
 * @param {Promise} response expressjs response Promise
 * @param {function} next express next method which passes control to 
 * the next middleware
 * @returns {void|Promise} Promise from http response if
 * a json error occurs
 */
const jsonErrorHandler = (error, request, response, next) => {
  if (error && error.toString().indexOf('JSON') > -1) {
    return response
      .status(400).json({ error: errorConstants.badJSONRequest });
  }
  next();
};
export default jsonErrorHandler;

