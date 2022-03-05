export class Kline {
  close = '';
  closeTime = 0;
  high = '';
  ignored = '';
  low = '';
  open = '';
  openTime = 0;
  quoteAssetVolume = '';
  takerBaseAssetVolume = '';
  takerQuoteAssetVolume = '';
  trades = 0;
  volume = '';
  constructor(init?: Partial<Kline>) {
    Object.assign(this, init);
  }
}
