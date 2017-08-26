module.exports = {
  /**
   * @description creates Roles table
   * @param {object} queryInterface sequelize orm object
   * @param {object} Sequelize Class that contains Sequelize
   * @returns {function} sequelize query promise
   */
  up: (queryInterface, Sequelize) => {
    const query = queryInterface.createTable('Roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.ENUM,
        values: ['admin', 'user'],
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    return query;
  },
  down: (queryInterface) => {
    const query = queryInterface.dropTable('Roles');
    return query;
  }
};
