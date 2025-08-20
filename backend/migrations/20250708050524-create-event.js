'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      location: {
        type: Sequelize.STRING
      },
      cityId: {
        type: Sequelize.INTEGER
      },
      fiveKm: {
        type: Sequelize.BOOLEAN
      },
      tenKm: {
        type: Sequelize.BOOLEAN
      },
      half: {
        type: Sequelize.BOOLEAN
      },
      full: {
        type: Sequelize.BOOLEAN
      },
      ultra: {
        type: Sequelize.BOOLEAN
      },
      elementary: {
        type: Sequelize.BOOLEAN
      },
      parent: {
        type: Sequelize.BOOLEAN
      },
      timed: {
        type: Sequelize.BOOLEAN
      },
      relay: {
        type: Sequelize.BOOLEAN
      },
      trail: {
        type: Sequelize.BOOLEAN
      },
      link_urk:{
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Events');
  }
};