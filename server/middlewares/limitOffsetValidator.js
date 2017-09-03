import errorConstants from '../constants/errorConstants';

const paginationQueryError = (request, response, next) => {
  let { limit, offset } = request.query;
  const isPaginationRequired = limit || offset;
  offset = !offset ? 0 : offset;
  if (isPaginationRequired) {
    if (Number.isNaN(Number(limit)) || Number.isNaN(Number(offset))) {
      return response
        .status(406)
        .json({ error: errorConstants.paginationQueryError });
    }
    offset = !offset ? 0 : offset;
    limit = Number.parseInt(limit, 10);
    offset = Number.parseInt(offset, 10);
    response.locals.paginationQueryStrings = { limit, offset };
  }
  next();
};
export default paginationQueryError;
