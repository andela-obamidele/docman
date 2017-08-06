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
  }
};
