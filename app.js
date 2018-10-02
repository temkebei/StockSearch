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