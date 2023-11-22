const mongoose = require("mongoose");
const dotenv = require("dotenv");
const orderDB = require("./orderSchema");
const positionDB = require("./posisionSchema");
const TrackerOrderEntity = require("./trackerOrderEntity");
const SCRIPT_KEY = require("./script-key");
const BOT_SCRIPT = require("./bot-script");
const BINGX_TOKEN = require("./token");

process.on("uncaughtException", (err) => {
  console.log("UNHANDLER REJECTIONN! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
}); // đang listening uncaughtException nên phải để lên đầu

dotenv.config({ path: "./config.env" });
const DB =
  "mongodb://gmx-admin:Decentralab%40%40%402023%40%40%40@45.32.121.209:27017/gmx?retryWrites=true&w=majority&authSource=admin";
// console.log(app.get('env'));
// console.log(process.env);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.conn ection);
    console.log("DB connection successful!");
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = async function getAlertVolume({volume, compareOperator}, date, limit) {
  try {
    const currentTime = new Date().getTime();
    date = 1 * 24 * 60 * 60 * 1000;
    const dateRange = {
      $gte: new Date(Date.now() - date),
      $lt: new Date(currentTime),
    };
    const sizeCondition = { [compareOperator]: volume };

    const kwentaOrders = await orderDB
      .find({
        createdAt: dateRange,
        $or: [
          {
            sizeDelta: sizeCondition,
            type: { $ne: "LIQUIDATE" },
          },
          {
            sizeNumber: sizeCondition,
            type: "LIQUIDATE",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(limit || 1);
    return await processKwentaOrder(kwentaOrders);
  } catch (e) {
    console.log(e);
  }
}

async function processKwentaOrder(orders) {
  try {
    const alerts = [];
    for (const order of orders) {
      switch (order.type) {
        case "OPEN":
        case "INCREASE":
        case "DECREASE":
          const task = new TrackerOrderEntity({
            id: order.id,
            type: order.type,
            account: order.account,
            isLong: order.isLong,
            size: order.sizeDelta,
            leverage: order.leverage,
            indexToken: order.indexToken,
            price: order.priceNumber,
            key: (
              await positionDB.findOne({
                orderIds: order.id,
                status: "OPEN",
              })
            ).key,
            blockNumber: order.blockNumber,
          });
          alerts.push(await processAlert(task, "KWENTA", false));

          break;
        case "LIQUIDATE":
          order.sizeDelta = order.sizeNumber;
        case "CLOSE":
          const position = await positionDB.findOne({
            orderIds: order.id,
          });

          alerts.push(
            await processAlert(
              new TrackerOrderEntity({
                id: position.id,
                type: order.type,
                account: position.account,
                isLong: position.isLong,
                size: order.sizeDelta,
                leverage: position.leverage,
                indexToken: position.indexToken,
                price: position.lastPriceNumber,
                roi: position.roi,
                realisedPnl: position.realisedPnl,
              }),
              "KWENTA",
              true
            )
          );
          break;
      }
    }
    return alerts;
  } catch (error) {
    console.log(error);
  }
}

function processAlert(order, protocol, isPosition) {
  try {
    const orderParams = {
      account: order.account,
      indexToken: order.token,
      key: order.key,
      blockNumber: `${order.blockNumber}`,
    };
    const positionParams = {
      id: `${order.id}`,
    };
    const params = new URLSearchParams(
      isPosition ? positionParams : orderParams
    );
    const url = `https://devvv.copin.io/${protocol}/position?${params.toString()}&utm_source=Twitter&utm_medium=direct&utm_campaign=Whales`;
    const key = SCRIPT_KEY.ORDER_TYPE;
    let messageData = [
      [
        SCRIPT_KEY.ORDER_TYPE,
        `${order.type[0]}${order.type.slice(1).toLowerCase()}${
          order.type.endsWith("E") ? "d" : "ed"
        }`,
      ],
      [SCRIPT_KEY.BUY_TYPE, order.isLong ? "LONG" : "SHORT"],
      [SCRIPT_KEY.INDEX_TOKEN, BINGX_TOKEN[order.token]],
      [
        SCRIPT_KEY.VOLUME,
        order.volume.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        }) || 0,
      ],
      [SCRIPT_KEY.ADDRESS, url],
      [SCRIPT_KEY.ALERTEMOS, generateAlertEmos(order.volume)],
      // [SCRIPT_KEY.SHORT_ADDRESS, order.address.substring(0, 8)],
      [SCRIPT_KEY.AVERAGE_PRICE, order.price],
      [SCRIPT_KEY.PROTOCOL, protocol],
    ];
    if (order.type === "CLOSE" || order.type === "LIQUIDATE") {
      messageData = [
        ...messageData,
        [
          SCRIPT_KEY.CONTENT,
          `${generateDotEmos(order.roi)} PnL: ${order.pnl} | ROI: ${
            order.roi
          }%`,
        ],
      ];
    }

    const script =
      order.type === "CLOSE" || order.type === "LIQUIDATE"
        ? BOT_SCRIPT.WHALE_ORDER_CLOSE_ALERT
        : BOT_SCRIPT.WHALE_ALERT;

    return fillText(script, new Map(messageData));
  } catch (error) {
    SentryService.captureException(`Error when process alert: ${error.stack}`);
  }
}

function fillText(baseStr, fillMap) {
  let resultStr = baseStr;
  for (const key of fillMap.keys()) {
    // @ts-ignore
    resultStr = resultStr.replaceAll(key, fillMap.get(key));
  }
  return resultStr;
}

function generateAlertEmos(volume) {
  const alertEmo = "🚨";

  let repeatTimes = 0;
  const whaleAlertAmounts = [1000000, 4000000, 7000000, 10000000, 1300000];
  for (const amount of whaleAlertAmounts) {
    if (volume >= amount) {
      repeatTimes++;
    }
  }

  return volume <= whaleAlertAmounts[0]
    ? alertEmo
    : alertEmo.repeat(repeatTimes);
}

function generateDotEmos(roi) {
  const roiEmo = roi >= 0 ? "🟢" : "🔴";

  const step = 20;
  const repeatTimes = Math.min(Math.ceil((Math.abs(roi) + 0.1) / step), 6);

  return roiEmo.repeat(repeatTimes);
}

