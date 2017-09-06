
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
        email: 'admin@docman.com',
        password: 'password',
        username: 'admin',
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'admin2@docman.com',
        password: '$2a$10$1Ck.42mvEh6va/uM9im0XO4kWzTDoLtvy' +
        'jVQWMPPcVOyIkkloq/Ky',
        username: 'admin2',
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

