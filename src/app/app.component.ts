import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CandlestickData, createChart, Range, Time } from 'lightweight-charts';
import { DateTime } from 'luxon';
import { debounceTime, from, Subject, Subscription, tap } from 'rxjs';
import { IChartApi, ISeriesApi } from './../../node_modules/lightweight-charts/dist/typings.d';
import { Kline } from './class/kline.class';
const api = require('@marcius-capital/binance-api')

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly ChartWidth = 400;

  @HostListener('window:resize')
  onWindowResize() {
    this.chart?.resize(this.chartContainer?.clientWidth || 300, this.ChartWidth);
  }

  get Currencies() { return Object.keys(CurrencyMap) as Currency[]; }
  get CurrencyMap() { return CurrencyMap; }
  get ChartContainerID() { return 'ChartContainerID' }

  currentSymbol = Symbol.BTCUSDT;
  private chartContainer: HTMLElement | undefined;
  private chart: IChartApi | undefined;
  private candlestickSeries: ISeriesApi<'Candlestick'> | undefined;
  private data: { [key in Symbol]: CandlestickData[] } = {
    [Symbol.BTCUSDT]: [],
    [Symbol.ETHUSDT]: [],
    [Symbol.SHIBUSDT]: [],
  };

  rangeChangeSubject = new Subject<Range<Time>>();
  private rangeSubscription: Subscription;

  constructor() {
    this.rangeSubscription = this.rangeChangeSubject.pipe(
      debounceTime(300)
    ).subscribe(range => {
      this.onRangeChange(range);
    })
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.chartContainer = document.getElementById(this.ChartContainerID) || document.body;
    this.chart = createChart(this.chartContainer, { width: this.chartContainer.clientWidth, height: this.ChartWidth });
    this.candlestickSeries = this.chart.addCandlestickSeries();
    this.getKlines(this.currentSymbol);
    this.chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
      if (range) {
        this.rangeChangeSubject.next(range);
      }
    })
  }

  ngOnDestroy(): void {
    this.rangeSubscription.unsubscribe();
  }

  onCurrencyChanged(currency: Currency) {
    console.log(`onCurrencyChanged `, currency);
    this.currentSymbol = CurrencyMap[currency];
    this.getKlines(this.currentSymbol);
  }

  private getKlines(symbol: Symbol) {
    if (this.data[symbol].length > 0) {
      this.candlestickSeries?.setData(this.data[symbol]);
    } else {
      from(api.rest.klines({ symbol, interval: '1d', limit: 1000 })).pipe(
        tap((res) => {
          console.log(`get klines = `, res);
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
      ).subscribe();
    }
  }

  private onRangeChange(range: Range<Time>) {
    console.log(`on range change `, range);
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
