import errorConstants from '../constants/errorConstants';

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
        error: 'invalid query string(s). limit and ' +
        'offset are the only valid query strings in this endpoint'
      });
  }
  if (isPaginationRequired) {
    if (Number.isNaN(Number(limit)) || Number.isNaN(Number(offset))) {
      return response
        .status(406)
        .json({ error: errorConstants.paginationQueryError });
    }
    let offsetInteger = !offset ? 0 : offset;
    const limitInteger = Number.parseInt(limit, 10);
    offsetInteger = Number.parseInt(offset, 10);
    response
      .locals.paginationQueryStrings = {
        limit: limitInteger,
        offset: offsetInteger
      };
  }
  next();
};
export default limitAndOffsetValidator;
