
module.exports = {
  /**
  * @description creates Users in Users table
  *
  * @param {object} queryInterface sequelize orm object
  *
  * @returns {function} sequelize query promise
  */
  up: (queryInterface) => {
    const query = queryInterface.bulkInsert('Users', [
      {
        email: process.env.FIRST_ADMIN_EMAIL,
        password: process.env.FIRST_ADMIN_PASSWORD,
        username: process.env.FIRST_ADMIN_USERNAME,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: process.env.SECOND_ADMIN_EMAIL,
        password: process.env.SECOND_ADMIN_PASSWORD,
        username: process.env.SECOND_ADMIN_USERNAME,
        roleId: 1,
        updatedAt: new Date(),
        createdAt: new Date()
      }
    ]);
    return query;
  },
  /**
   * @description creates Users in Users table
   * @param {object} queryInterface sequelize orm object
   * @returns {function} drops the table
   */
  down: (queryInterface) => {
    const query = queryInterface.bulkDelete('Users', null, {});
    return query;
  }
};

