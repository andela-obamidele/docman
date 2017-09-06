
module.exports = {
  /**
  * @description initializes roles table
  *
  * @param {object} queryInterface sequelize orm object
  *
  * @returns {function} sequelize query promise
  */
  up: (queryInterface) => {
    const query = queryInterface.bulkInsert('Roles', [
      { title: 'user', id: 2, createdAt: new Date(), updatedAt: new Date() },
      { title: 'admin', id: 1, createdAt: new Date(), updatedAt: new Date() }
    ]);
    return query;
  },
  /**
   * @description deletes created seeds
   * 
   * @param {object} queryInterface sequelize orm object
   * 
   * @returns {function} sequelize query promise
   */
  down: (queryInterface) => {
    const query = queryInterface.bulkDelete('', null, {});
    return query;
  }
};
