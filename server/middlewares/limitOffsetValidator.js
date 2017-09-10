// eslint-disable-next-line
import ErrorConstants from '../constants/ErrorConstants';
/**
 * @description validate limit and offset
 * 
 * @param {object} request http request from expressjs
 * @param {object} response http response object from expressjs
 * @param {function} next passes controll to next middleware when called
 * 
 * @returns {Promise} promise from http response
 */
const limitAndOffsetValidator = (request, response, next) => {
  const { limit, offset, ...otherQueryStrings } = request.query;
  const queryStrings = Object.keys(request.query);
  const endpointHasQueryStrings = queryStrings.length > 0;
  const queryStringHasLimit = queryStrings.indexOf('limit') > -1;
  const queryStringHasOffset = queryStrings.indexOf('offset') > -1;
  const invalidQueryStringPresent = Object.keys(otherQueryStrings).length > 0;
  const isPaginationRequired = limit || offset;

  if (endpointHasQueryStrings &&
    (!queryStringHasLimit ||
      (queryStringHasOffset && !offset)) &&
    invalidQueryStringPresent) {
    return response
      .status(400)
      .json({
        error: ErrorConstants.badPaginationParameters
      });
  }
  if (isPaginationRequired) {
    if (offset && !limit) {
      return response.status(400)
        .json({ error: ErrorConstants.emptyLimitError });
    }

    if (limit) {
      if (!Number.parseInt(limit, 10)) {
        if (limit === '0') {
          return response.status(400)
            .json({ error: ErrorConstants.zeroLimitError });
        }
        return response.status(400)
          .json({ error: ErrorConstants.limitTypeError });
      }
    }

    if (offset) {
      if (!Number.parseInt(offset, 10) && offset !== '0') {
        return response.status(400)
          .json({ error: ErrorConstants.offsetTypeError });
      }
    }
    const limitInteger = Number.parseInt(limit, 10);
    const offsetInteger = !offset ? 0 : Number.parseInt(offset, 10);
    response
      .locals.paginationQueryStrings = {
        limit: limitInteger,
        offset: offsetInteger
      };
  }
  next();
};

export default limitAndOffsetValidator;
