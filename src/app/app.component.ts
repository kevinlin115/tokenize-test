import { AfterViewInit, Component, OnInit } from '@angular/core';
import { createChart } from 'lightweight-charts';
import { DateTime } from 'luxon';
import { from, tap } from 'rxjs';
import { IChartApi, ISeriesApi } from './../../node_modules/lightweight-charts/dist/typings.d';
import { Kline } from './class/kline.class';
const api = require('@marcius-capital/binance-api')

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  get Currencies() { return Object.keys(CurrencyMap) as Currency[]; }
  get CurrencyMap() { return CurrencyMap; }
  get ChartContainerID() { return 'ChartContainerID' }

  currentSymbol = Symbol.BTCUSDT;
  chart: IChartApi | undefined;
  candlestickSeries: ISeriesApi<'Candlestick'> | undefined;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.chart = createChart(document.getElementById(this.ChartContainerID) || document.body, { width: 400, height: 300 });
    this.candlestickSeries = this.chart.addCandlestickSeries();
    this.getKlines(this.currentSymbol).subscribe();
export class AppComponent {
  title = 'tokenize-test';
  }

  onCurrencyChanged(currency: Currency) {
    console.log(`onCurrencyChanged `, currency);
    this.currentSymbol = CurrencyMap[currency];
    this.getKlines(this.currentSymbol).subscribe();
  }

  private getKlines(symbol: Symbol) {
    return from(api.rest.klines({ symbol, interval: '1d', limit: 500 })).pipe(
      tap((res) => {
        const klines: Kline[] = res as Kline[];
        const data = klines.map(kline => {
          return {
            time: DateTime.fromMillis(kline.openTime).toFormat('yyyy-MM-dd'),
            open: Number(kline.open),
            high: Number(kline.high),
            low: Number(kline.low),
            close: Number(kline.close),
          };
        });
        this.candlestickSeries?.setData(data);
      })
    )
  }

}

enum Currency {
  'BTC' = 'BTC',
  'ETH' = 'ETH',
  'SHIB' = 'SHIB'
}

enum Symbol {
  'BTCUSDT' = 'BTCUSDT',
  'ETHUSDT' = 'ETHUSDT',
  'SHIBUSDT' = 'SHIBUSDT',
}

const CurrencyMap: { [key in Currency]: Symbol } = {
  [Currency.BTC]: Symbol.BTCUSDT,
  [Currency.ETH]: Symbol.ETHUSDT,
  [Currency.SHIB]: Symbol.SHIBUSDT,
}
