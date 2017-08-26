import errorConstants from '../constants/errorConstants';

/**
 * @description checks if query sting 'q' is provided
 * @param {object} request expressjs http request object
 * @param {object} response expressjs http response object
 * @param {function} next expressjs next function which passes control
 * the next middleware
 * @returns {void|Promise} Promise object from http response
 */
const searchValidator = (request, response, next) => {
  if (!request.query.q) {
    return response.status(400)
      .json({ error: errorConstants.emptySearchString });
  }
  next();
};
export default searchValidator;
