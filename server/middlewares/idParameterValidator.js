// eslint-disable-next-line
import errorConstants from '../constants/errorConstants';
/**
 * @description validate that id param is a number
 * @param {object} request express http request object
 * @param {Promise} response express http response promise
 * @param {function} next passes control to the next middleware
 * @returns {void|Promise} express http response promise
 */
const idParameterValidator = (request, response, next) => {
  const iD = request.params.id;
  if (Number.isNaN(iD)) {
    return response
      .status(400).json({ error: errorConstants.wrongIdTypeError });
  }
  next();
};
export default idParameterValidator;
