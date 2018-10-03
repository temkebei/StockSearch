$(document).ready(function () {
  const validationList = [];
  const stocks = [];

  const queryAllSymbols = `https://api.iextrading.com/1.0/ref-data/symbols`;
  $.ajax({
    url: queryAllSymbols,
    method: 'GET'
  }).then(function (response) {
    for (let i = 0; i < response.length; i++) {
      let validList = response[i].symbol
      validationList.push(validList);
    };
  });

  $('#btnSubmit').on('click', function () {
    event.preventDefault();
    let newStock = $('#stockInfo').val().toUpperCase();
    if (!validationList.includes(newStock)) {
      alert("Please input a valid stock symbol.");
    } else {
      stocks.push(newStock);
      $('#stockInfo').val('');
      render();
    };
  });

  $('#btnClear').on('click', function () {
    $('#tBody').empty();
    $('#logoDiv').empty();
    $('#newsDiv').empty();
  });

  $('#resetButtons').on('click', function () {
    $('#stocks-view').empty();
    stocks.length = 0;
  });

  $("#stocks-view").on("click", "input", function () {
    let stockSymbol = this.value;
    const queryURL1 = `https://api.iextrading.com/1.0/stock/${stockSymbol}/quote`;
    const queryURL2 = `https://api.iextrading.com/1.0/stock/${stockSymbol}/logo`;
    const queryURL3 = `https://api.iextrading.com/1.0/stock/${stockSymbol}/news`;

    $.ajax({
      url: queryURL1,
      method: 'GET'
    }).then(function (response) {
      const Q1 = $('#tBody').append(`<tr><td>${response.companyName}</td><td>${response.symbol}</td><td>${response.latestPrice}</td></tr>`);
    });
    $.ajax({
      url: queryURL2,
      method: 'GET'
    }).then(function (response) {
      const Q2 = $('#logoDiv').append(`<img class="image" src="${response.url}">`);
    });
    $.ajax({
      url: queryURL3,
      method: 'GET'
    }).then(function (response) {
      for (let i = 0; i < response.length; i++) {
        const Q3 = $('#newsDiv').append(`<h5><a href='${response[i].url}'>${response[i].headline}</a></h5><br><p>${response[i].source}</p><br><p>${response[i].datetime}</p><br><p>${response[i].summary}</p><hr>`)
      };
    });
    $('#tBody').empty();
    $('#logoDiv').empty();
    $('#newsDiv').empty();
  });

  const render = function () {
    $('#stocks-view').empty();
    for (let i = 0; i < stocks.length; i++) {
      let theId = 'getStocks' + i;
      $('#stocks-view').append(`<input id='${theId}' type='button' value='${stocks[i]}'/>&nbsp`);
    };
  };
});



// below codes is to display a list of all the stock companies
// and display upto date plrices that update every 5 second

'use strict';
const DEFAULT_PORTFOLIOS = [
{'name': 'Tech', 'symbols': ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'FB', 'TWTR', 'NFLX', 'SNAP', 'SPOT', 'DBX', 'SQ', 'BABA', 'INTC', 'AMD', 'NVDA', 'ORCL']},
];
const PORTFOLIOS = portfoliosFromQueryParams() || DEFAULT_PORTFOLIOS;
const REFRESH_SECONDS = 10;
const BATCH_SIZE = 100;
const BASE_URL = 'https://api.iextrading.com/1.0/stock/market/batch';
let symbols = [];
let containerDiv = document.querySelector('.stocks-container');
let updatedDiv = document.querySelector('.updated-timestamp');
PORTFOLIOS.forEach((p, i) => addPortfolio(p, i === 0));
symbols = symbols.filter((s, i) => symbols.indexOf(s) === i);
updateData('addTitle');
setInterval(updateData, REFRESH_SECONDS * 5000);
function addPortfolio(portfolio, includeHeader) {
let tableHeaderHtml = '';
if (includeHeader) {
  tableHeaderHtml = `
    <thead>
      <tr>
        <th></th>
        <th class="stock-price">Last</th>
        <th class="stock-change">Change</th>
        <th class="stock-change-pct">Change%</th>
        <th class="stock-mkt-cap">Mkt Cap</th>
      </tr>
    </thead>
  `
}
let tableBodyHtml = portfolio.symbols.map(symbol => {
  symbol = symbol.toUpperCase();
  symbols.push(symbol);
  let html = `
    <tr data-symbol="${symbol}">
      <td class="stock-symbol"><a href="${symbolUrl(symbol)}" target="_blank">${symbol}</a></td>
      <td class="stock-price"></td>
      <td class="stock-change"></td>
      <td class="stock-change-pct"></td>
      <td class="stock-mkt-cap"></td>
    </tr>
  `
  return html;
}).join('');
let portfolioDiv = document.createElement('div');
portfolioDiv.innerHTML = `
  <details open>
    <summary><h2>${portfolio.name}</h2></summary>
    <table>${tableHeaderHtml}<tbody>${tableBodyHtml}</tbody></table>
  </details>
`;
containerDiv.appendChild(portfolioDiv);
}
function updateData(addTitle) {
let numberOfBatches = Math.ceil(symbols.length / BATCH_SIZE);
for (let i = 0; i < numberOfBatches; i++) {
  let symbolsBatch = symbols.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
  updateDataForBatch(symbolsBatch, addTitle);
}
updatedDiv.innerHTML = `Data updated at ${(new Date()).toLocaleString()}`;
}
function updateDataForBatch(symbols, addTitle) {
let filters = ['latestPrice', 'change', 'changePercent', 'marketCap'];
if (addTitle) filters.push('companyName');
let url = `${BASE_URL}?types=quote&symbols=${symbols.join(',')}&filter=${filters.join(',')}`;
fetch(url).then(response => response.json()).then(json => {
  symbols.forEach(symbol => {
    let data = json[symbol];
    if (typeof(data) === 'undefined') return;
    let formattedPrice = formatQuote(data.quote.latestPrice);
    let formattedChange = data.quote.change.toLocaleString('en', {'minimumFractionDigits': 2});
    let formattedChangePercent = (data.quote.changePercent * 100).toFixed(1) + '%';
    let formattedMarketCap = formatMarketCap(data.quote.marketCap);
    let rgbColor = data.quote.changePercent > 0 ? '0,255,0' : '255,0,0';
    let rgbOpacity = Math.min(Math.abs(data.quote.changePercent) * 20, 1);
    document.querySelectorAll(`[data-symbol="${symbol}"] .stock-price`).forEach(e => {
      e.innerHTML = formattedPrice;
      e.setAttribute('style', `background-color: rgba(${rgbColor}, ${rgbOpacity})`);
    });
    document.querySelectorAll(`[data-symbol="${symbol}"] .stock-change`).forEach(e => {
      e.innerHTML = formattedChange;
      e.setAttribute('style', `background-color: rgba(${rgbColor}, ${rgbOpacity})`);
    });
    document.querySelectorAll(`[data-symbol="${symbol}"] .stock-change-pct`).forEach(e => {
      e.innerHTML = formattedChangePercent;
      e.setAttribute('style', `background-color: rgba(${rgbColor}, ${rgbOpacity})`);
    });
    document.querySelectorAll(`[data-symbol="${symbol}"] .stock-mkt-cap`).forEach(e => {
      e.innerHTML = formattedMarketCap;
      e.setAttribute('style', `background-color: rgba(${rgbColor}, ${rgbOpacity})`);
    });
    if (addTitle) {
      document.querySelectorAll(`[data-symbol="${symbol}"] .stock-symbol a`).forEach(e => {
        e.setAttribute('title', data.quote.companyName);
      });
    }
  });
});
}
function portfoliosFromQueryParams() {
if (!window.location.search) return;
let params = new URLSearchParams(window.location.search);
let portfolios = [];
for (let p of params) {
  portfolios.push({'name': p[0], 'symbols': p[1].split(',')});
}
return portfolios;
}
function symbolUrl(symbol) {
return `https://iextrading.com/apps/stocks/${symbol}`;
}
function formatQuote(value) {
let options = {
  'minimumFractionDigits': 2,
  'style': 'currency',
  'currency': 'USD'
};
return value.toLocaleString('en', options);
}
function formatMarketCap(marketCap) {
let value, suffix;
if (marketCap >= 1e12) {
  value = marketCap / 1e12;
  suffix = 'T';
} else if (marketCap >= 1e9) {
  value = marketCap / 1e9;
  suffix = 'B';
} else {
  value = marketCap / 1e6;
  suffix = 'M';
}
let digits = value < 10 ? 1 : 0;
return '$' + value.toFixed(digits) + suffix;
}