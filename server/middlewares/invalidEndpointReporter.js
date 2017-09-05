import errorConstants from '../constants/errorConstants';
/**
 * @description reports not found for any request
 * this should be placed after all middlware
 * 
 * @param {object} request http request object from express
 * 
 * @param {*} response http resonse object from expressjs
 * 
 * @param {function} next function from expressjs that passes
 * constrol to the next middleware
 * 
 * @return {Promise| void} Promise from http response
 */
const invalidEndpointReporter = (request, response, next) => {
  response
    .status(404)
    .json({ error: errorConstants.invalidEndpointError });
  next();
};
export default invalidEndpointReporter;
