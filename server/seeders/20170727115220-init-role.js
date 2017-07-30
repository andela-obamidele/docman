
module.exports = {
  up: (queryInterface) => {
    const query = queryInterface.bulkInsert('Roles', [
      { title: 'user', id: 2, createdAt: new Date(), updatedAt: new Date() },
      { title: 'admin', id: 1, createdAt: new Date(), updatedAt: new Date() }
    ]);
    return query;
  },

  down: (queryInterface) => {
    const query = queryInterface.bulkDelete('', null, {});
    return query;
  }
};
