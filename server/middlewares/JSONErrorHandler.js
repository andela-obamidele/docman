import ErrorConstants from '../constants/ErrorConstants';
/**
 * @description returns an error message if bad
 * json object is 
 * 
 * @param {Error} error javascript error object
 * @param {object} request express request promise
 * @param {Promise} response expressjs response Promise
 * @param {function} next express next method which passes control to 
 * the next middleware
 * 
 * @returns {void |Promise} Promise from express http response if
 * a json error occurs
 */
const JSONErrorHandler = (error, request, response, next) => {
  if (error && error.toString().indexOf('JSON') > -1) {
    return response
      .status(400).json({ error: ErrorConstants.badJSONRequest });
  }
  next();
};
export default JSONErrorHandler;

