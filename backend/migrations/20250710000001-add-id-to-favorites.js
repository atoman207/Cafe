'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if id column exists
    const tableInfo = await queryInterface.describeTable('Favorites');
    
    if (!tableInfo.id) {
      // Add id column if it doesn't exist
      await queryInterface.addColumn('Favorites', 'id', {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove id column if it exists
    const tableInfo = await queryInterface.describeTable('Favorites');
    
    if (tableInfo.id) {
      await queryInterface.removeColumn('Favorites', 'id');
    }
  }
}; 