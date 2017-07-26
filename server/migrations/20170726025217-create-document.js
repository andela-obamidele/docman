
module.exports = {
  up: (queryInterface, Sequelize) => {
    const query = queryInterface.createTable('Documents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      author: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: 'author',
        }
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: 'false'
      },
      access: {
        type: Sequelize.ENUM,
        values: ['public', 'private', 'role']
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
    const query = queryInterface.dropTable('Documents');
    return query;
  }
};
