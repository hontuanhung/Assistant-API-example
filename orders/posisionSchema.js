const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema({
  positionId: { type: String, required: true },

  account: { type: String },

  txHash: { type: [String], default: [] },

  logId: { type: Number },

  blockNumber: { type: Number },

  blockTime: { type: Date },

  size: { type: Number },

  sizeDelta: { type: String },

  reverseCount: { type: Number, default: 0 },

  maxSizeNumber: { type: Number, default: 0 },

  isClose: { type: Boolean, default: false },

  feeNumber: { type: Number },

  marginNumber: { type: Number, default: 0 },

  maxMarginNumber: { type: Number, default: 0 },

  averagePrice: { type: Number },

  fundingRateNumber: { type: Number, default: 0 },

  totalFundingRateFee: { type: Number, default: 0 },

  collateral: { type: Number },

  lastPriceNumber: { type: Number },

  fee: { type: Number, default: 0 },

  pnl: { type: Number },

  isLiquidate: { type: Boolean, default: false },

  realisedPnlNumber: { type: Number, default: 0 },

  realisedPnl: { type: Number, default: 0 },

  roi: { type: Number },

  isLong: { type: Boolean },

  leverage: { type: Number },

  orderCount: { type: Number, default: 1 },

  orderIncreaseCount: { type: Number, default: 1 },

  orderDecreaseCount: { type: Number, default: 0 },

  openBlockNumber: { type: Number },

  closeBlockNumber: { type: Number },

  durationInSecond: { type: Number },

  isWin: { type: Boolean },

  orderIds: { type: [String] },

  status: { type: String, enum: ["OPEN", "CLOSE"] },

  totalVolume: { type: Number },

  openBlockTime: { type: Date },

  closeBlockTime: { type: Date },

  key: { type: String, required: true, unique: true },

  pairAddress: { type: String, required: true },

  indexToken: { type: String, required: true },

  createdAt: { type: Date },

  updatedAt: { type: Date },
});

const position = mongoose.model('kwenta_position', positionSchema);

module.exports = position;
