module.exports = {
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
  down: (queryInterface, Sequelize) => {
    const query = queryInterface.dropTable('Roles');
    return query;
  }
};
