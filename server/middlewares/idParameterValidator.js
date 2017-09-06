import ErrorConstants from '../constants/ErrorConstants';
/**
 * @description validate that id param is a number
 * 
 * @param {object} request express http request object
 * @param {Promise} response express http response promise
 * @param {function} next passes control to the next middleware
 * 
 * @returns {void|Promise} express http response promise
 */
const idParameterValidator = (request, response, next) => {
  const iD = request.params.id;
  if (Number.isNaN(Number.parseInt(iD, 10))) {
    return response
      .status(400).json({ error: ErrorConstants.wrongIdTypeError });
  }
  next();
};
export default idParameterValidator;
