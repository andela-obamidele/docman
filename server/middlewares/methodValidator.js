import errorConstants from '../constants/errorConstants';


/**
 * @description validates the method that is called on the api
 * @param {object} request http request object from expressjs
 * @param {object} response http response object from expressjs
 * @param {funcntion} next next method from express js used to pass control
 * to the next middleware
 * @returns {void | Promise} Promise object from express http response object
 */
const methodValidator = (request, response, next) => {
  const acceptedMethods = ['post', 'put', 'delete', 'get'];
  if (acceptedMethods.indexOf(request.method.toLowerCase()) < 0) {
    return response.status(400).json({ error: errorConstants.badMethodError });
  }
  next();
};
export default methodValidator;

