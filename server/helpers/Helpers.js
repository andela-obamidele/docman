import ErrorConstants from '../constants/ErrorConstants';

const Helpers = {
  /**
 * @description used by both document and users to
 * routes to handle validation errors
 * 
 * @param {Error[]} errors an array of sequelize validation errors
 * 
 * @returns {object[]} an array of error messages and fields
 */
  handleValidationErrors(errors) {
    const errorResponse = [];
    errors.forEach((errorObject) => {
      let message = errorObject.message.replace('null', 'empty');
      message = message
        .replace(
          'title must be unique',
          'a document already exist with that title');
      if (!errorObject.message) {
        message = `${errorObject.path} cannot be empty`;
        errorObject.message = message;
      }

      errorResponse
        .push({
          message,
        });
    });
    return errorResponse;
  },
  /**
   * @description - Return metadata for pagination
   * 
   * @param {number} limit number of data to per page
   * @param {number} offset represents steps away from starting point
   * @param {object} queryResult total number of data
   * 
   * @returns {object} object containing metadata for pagination
   */
  getPageMetadata(limit, offset, queryResult) {
    const count = queryResult.count;
    const queryHasNoData = !queryResult.rows[0];
    const metaData = {};
    limit = limit > count ? count : limit;
    offset = offset > count ? count : offset;
    metaData.totalCount = count;
    metaData.currentPage = Math.floor(offset / limit) + 1;
    metaData.pageCount = Math.ceil(count / limit);
    metaData.pageSize = Number(limit);
    if (queryHasNoData) {
      metaData.message = ErrorConstants.endOfPageReached;
    }
    return metaData;
  },
};
export default Helpers;
