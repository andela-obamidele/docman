import errorConstants from '../../server/constants/errorConstants';
/**
 * @description validate that id param is a number
 * @param {object} request express http request object
 * @param {Promise} response express http response promise
 * @param {function} next passes control to the next middleware
 * @returns {void|Promise} express http response promise
 */
const idParameterValidator = (request, response, next) => {
  let documentId = request.params.id;
  documentId = Number.parseInt(documentId, 10);
  const indexOfId = request.originalUrl.indexOf(':id');
  if (indexOfId > -1 && Number.isNaN(documentId)) {
    return response
      .status(400).json(errorConstants.wrongIdTypeError);
  }
  next();
};
export default idParameterValidator;
