const { Op } = require('sequelize');
const sequelize = require('../dataAccess/sequelize');
const CustomError = require('../utils/customError.js');
const RecordService = require('./recordService');

const { Fund, Record } = sequelize.models;
const recordService = new RecordService();

class FundService {

  constructor() {}

  async create(body) {
    const data = await Fund.create({ ...body, isDefault: false }, { raw: true });
    delete data.userID;
    return data;
  };

  async update({ userID, id, updateEntries }) {
    const fund = await Fund.findOne({ where: { id, userID } });
    if (fund === null) throw new CustomError(404, "The requested fund wasn't found.");
    const data = await fund.update(updateEntries);
    delete data.dataValues.userID;
    return data;
  };

  async delete({ userID, id }) {
    const data = await sequelize.transaction(async (transaction) => {

      const fund = await Fund.findOne({ where: { id, userID }, }, { transaction });

      if (fund === null) throw new CustomError(404, "The requested fund wasn't found.");
      if (fund.dataValues.isDefault) throw new CustomError(409, "Cannot delete the default fund.");
      if (fund.balance > 0) throw new CustomError(409, "Cannot delete a fund with positive balance.");

      const defaultFund = await Fund.findOne({ where: { userID, isDefault: true }, raw: true, transaction })

      await Record.destroy({
        where: {
          fundID: {
            [Op.or]: [defaultFund.id, fund.dataValues.id]
          },
          otherFundID: {
            [Op.or]: [defaultFund.id, fund.dataValues.id]
          }
        },
        transaction,
      });

      await Record.update({
        fundID: defaultFund.id
      }, { where: { fundID: fund.dataValues.id }, transaction, });

      await Record.update({
        otherFundID: defaultFund.id
      }, { where: { otherFundID: fund.dataValues.id }, transaction, });

      await recordService.updateBalance({ fundID: defaultFund.id, userID }, { transaction });
      await fund.destroy({ transaction });
      return id;
    });

    return data;
  }
};

module.exports = FundService;
