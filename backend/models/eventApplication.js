'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EventApplication extends Model {
    static associate(models) {
      EventApplication.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      EventApplication.belongsTo(models.Event, {
        foreignKey: 'eventId',
        as: 'event'
      });
    }
  }
  EventApplication.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Events',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    appliedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'EventApplication',
    tableName: 'EventApplications',
    timestamps: true
  });
  return EventApplication;
}; 