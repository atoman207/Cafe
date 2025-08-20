'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Event.belongsTo(models.City, { foreignKey: 'cityId' });
      Event.hasMany(models.EventApplication, { foreignKey: 'eventId', as: 'applications' });
    }
  }
  Event.init({
    name: DataTypes.STRING,
    date: DataTypes.DATE,
    location: DataTypes.STRING,
    cityId: DataTypes.INTEGER,
    fiveKm: DataTypes.BOOLEAN,
    tenKm: DataTypes.BOOLEAN,
    half: DataTypes.BOOLEAN,
    full: DataTypes.BOOLEAN,
    ultra: DataTypes.BOOLEAN,
    elementary: DataTypes.BOOLEAN,
    parent: DataTypes.BOOLEAN,
    timed: DataTypes.BOOLEAN,
    relay: DataTypes.BOOLEAN,
    trail: DataTypes.BOOLEAN,
    link_url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};