const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  account: {
    type: { type: String },
  },
  txHash: { type: String },

  logId: { type: Number },

  blockNumber: { type: Number },

  blockTime: Date,

  averagePrice: { type: Number },

  key: { type: String, require: true, unique: true },
  indexToken: { type: String },
  size: { type: String },

  sizeNumber: { type: Number },
  price: { type: String },
  positionId: { type: String },

  priceNumber: { type: Number },

  collateralDelta: { type: Number },
  fee: { type: String },

  sizeDelta: { type: Number },

  feetypeNumber: { type: Number },

  isLong: { type: Boolean },

  isOpen: { type: Boolean },

  isClose: { type: Boolean },

  leverage: { type: Number },

  fundingRateFee: { type: String, default: "" },

  fundingRateFeeNumber: { type: Number },

  type: {
    type: String,
    enum: ["OPEN", "CLOSE", "INCREASE", "DECREASE", "LIQUIDATE"],
  },

  createdAt: Date,
});

const order = mongoose.model('kwenta_order', orderSchema);

module.exports = order;