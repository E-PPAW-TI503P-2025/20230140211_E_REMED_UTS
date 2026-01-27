'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BorrowLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BorrowLog.init({
    userId: DataTypes.INTEGER,
    bookId: DataTypes.INTEGER,
    borrowDate: DataTypes.DATE,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'BorrowLog',
  });
  return BorrowLog;
};