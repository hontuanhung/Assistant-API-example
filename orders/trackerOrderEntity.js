export class TrackerOrderEntity {
  constructor(partial) {
      if (partial) {
          this.id = partial.id;
          this.account = partial.account;
          this.type = partial.type;
          this.isLong = partial.isLong;
          this.volume = partial.size;
          this.roi = Math.round(partial === null || partial === void 0 ? void 0 : partial.roi) || 0;
          this.pnl = partial.realisedPnl.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
          }) || 0;
          this.leverage = (partial.leverage || 0).toFixed(2);
          this.token = partial.indexToken;
          this.price = partial.price.partial.realisedPnl.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
          }) || 0;
          this.key = partial.key;
          this.blockNumber = partial.blockNumber;
      }
  }
}
