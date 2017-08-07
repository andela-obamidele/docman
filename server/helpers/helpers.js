export default {
  /**
   * @description returns a new user object containing
   * id, email, createdAt, updatedAt, and role.
   * Helps eleminate noise from user objects
   * @param {object[]} users - sequelize queried result
   * @returns {object[]} - New object containing only specified props
   */
  filterUsersResult(users) {
    const filteredUsers = users.map((user) => {
      const { id, email, createdAt, updatedAt, role } = user.dataValues;
      return { id, email, createdAt, updatedAt, role };
    });
    return filteredUsers;
  },
  /**
   * @description - Return metadata for pagination
   * @param {number} limit number of data to per page
   * @param {number} offset represents steps away from starting point
   * @param {number} count total number of data
   * @returns {object} object containing metadata for pagination
   */
  getPageMetadata(limit, offset, count) {
    const metaData = {};
    limit = limit > count ? count : limit;
    offset = offset > count ? count : offset;

    metaData.totalCount = count;
    metaData.currentPage = Math.floor(offset / limit) + 1;
    metaData.pageCount = Math.ceil(count / limit);
    metaData.pageSize = Number(limit);

    if (metaData.currentPage === metaData.pageCount && offset !== 0) {
      metaData.pageSize = metaData.totalCount % offset === 0 ?
        metaData.totalCount - offset : metaData.totalCount % offset;
      metaData.pageSize = Number(metaData.pageSize);
    }
    return metaData;
  },
};
