module.exports = {
  up: (queryInterface, Sequelize) => {
    const query = queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      role: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        defaultValue: 2,
        references: {
          model: 'Roles',
          key: 'id',
          as: 'role'
        }
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      fullName: {
        type: Sequelize.STRING,
      },
      bio: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
    return query;
  },
  down: (queryInterface) => {
    const query = queryInterface.dropTable('Users');
    return query;
  }
};
