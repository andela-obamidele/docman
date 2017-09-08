module.exports = {
  /**
    * @description creates Users table

    * @param {object} queryInterface sequelize orm object
    * @param {object} Sequelize Class that contains Sequelize
    
    * @returns {Promise} sequelize query promise
    */
  up: (queryInterface, Sequelize) => {
    const query = queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      roleId: {
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
  /**
   * @param {object} queryInterface sequelize query interface
   * @return {Promise} sequelize query Promise
   */
  down: (queryInterface) => {
    const query = queryInterface.dropTable('Users');
    return query;
  }
};
