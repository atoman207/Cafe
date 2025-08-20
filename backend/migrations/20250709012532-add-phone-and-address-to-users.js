'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the column already exists
    const table = await queryInterface.describeTable('Users');
    if (!table.address) {
      await queryInterface.addColumn('Users', 'address', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "address");
  }
};
