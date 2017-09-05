import errorConstants from '../constants/errorConstants';
/**
 * @description responds with a generic error message cannot process a
 * request for an unknown reason
 * 
 * @param {Error} error javascript error object
 * 
 * @param {object} request express http request object
 * 
 * @param {object} response express http responsonse object
 * 
 * @param {function} next express middlware next function which passes 
 * control to next middleware
 * 
 * @returns {void | Promise} promise returned from express http response object
 */
const serverErrorHandler = (error, request, response, next) => {
  if (error) {
    return response
      .status(500).json({ error: errorConstants.genericErrorMessage });
  }
  next();
};
export default serverErrorHandler;
