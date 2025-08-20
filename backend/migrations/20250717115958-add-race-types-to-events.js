'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Events', 'fiveKm', { type: Sequelize.BOOLEAN, allowNull: true });
    await queryInterface.addColumn('Events', 'tenKm', { type: Sequelize.BOOLEAN, allowNull: true });
    await queryInterface.addColumn('Events', 'half', { type: Sequelize.BOOLEAN, allowNull: true });
    await queryInterface.addColumn('Events', 'full', { type: Sequelize.BOOLEAN, allowNull: true });
    await queryInterface.addColumn('Events', 'ultra', { type: Sequelize.BOOLEAN, allowNull: true });
    await queryInterface.addColumn('Events', 'elementary', { type: Sequelize.BOOLEAN, allowNull: true });
    await queryInterface.addColumn('Events', 'parent', { type: Sequelize.BOOLEAN, allowNull: true });
    await queryInterface.addColumn('Events', 'timed', { type: Sequelize.BOOLEAN, allowNull: true });
    await queryInterface.addColumn('Events', 'relay', { type: Sequelize.BOOLEAN, allowNull: true });
    await queryInterface.addColumn('Events', 'trail', { type: Sequelize.BOOLEAN, allowNull: true });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Events', 'fiveKm');
    await queryInterface.removeColumn('Events', 'tenKm');
    await queryInterface.removeColumn('Events', 'half');
    await queryInterface.removeColumn('Events', 'full');
    await queryInterface.removeColumn('Events', 'ultra');
    await queryInterface.removeColumn('Events', 'elementary');
    await queryInterface.removeColumn('Events', 'parent');
    await queryInterface.removeColumn('Events', 'timed');
    await queryInterface.removeColumn('Events', 'relay');
    await queryInterface.removeColumn('Events', 'trail');
  }
};
