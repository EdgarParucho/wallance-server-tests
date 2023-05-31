'use strict';

const { nanoid } = require('nanoid');
const { DataTypes } = require('sequelize');
const { FUND_TABLE, fundSchema } = require('../src/db/models/fundModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.dropTable(FUND_TABLE)
    await queryInterface.createTable(FUND_TABLE, fundSchema)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(FUND_TABLE)
    await queryInterface.createTable(FUND_TABLE, {
      _id: { allowNull: false, autoIncrement: true, primaryKey: true, unique: true, type: DataTypes.INTEGER },
      balance: { allowNull: false, type: DataTypes.FLOAT, defaultValue: 0 },
      name: { allowNull: false, type: DataTypes.STRING },
      description: { allowNull: false, type: DataTypes.STRING },
      isDefault: { allowNull: false, type: DataTypes.BOOLEAN, field: 'is_default' },
      userID: {
        field: 'user_id',
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: USER_TABLE,
          key: '_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updatedAt: { allowNull: false, type: DataTypes.DATE, default: Sequelize.NOW, field: 'updated_at' },
      createdAt: { allowNull: false, type: DataTypes.DATE, default: Sequelize.NOW, field: 'created_at' }
    })
  }
};