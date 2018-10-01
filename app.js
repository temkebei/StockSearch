
$('#btnSubmit').on('click',function(event){
    event.preventDefault();
    let stock =$('#searchStock').val();
    console.log(stock);

$.ajax({
    url:`https://api.iextrading.com/1.0/stock/${stock}/batch?types=quote,news&range=1m&last=1`,
    method:'GET'
}).then(function(response){
    console.log(response);
})

})

// Initial array of stocks
const stocks = ['FB', "AAPL", 'TSLA', 'GOOG'];

// Function for displaying stock data
const render = function () {

  // Delete the content inside the stocks-view div prior to adding new stocks
  // (this is necessary otherwise you will have repeat buttons)
  $("#stocks-view").empty()
  // Loop through the array of stocks, then generate buttons for each stock in the array
  for (let i = 0; i < stocks.length; i++) {
    $("#stocks-view").append(`<button class="get-stock" value=${stocks[i]}>${stocks[i]}</button>`)
  }

}

// This function handles events where the add stock button is clicked
const addButton = function (event) {

  // event.preventDefault() prevents submit button from trying to send a form.
  // Using a submit button instead of a regular button allows the user to hit
  // 'Enter' instead of clicking the button if desired
  event.preventDefault();

  // Write code to grab the text the user types into the input field
  let newStock = $("#stock-input").val().trim()
  // Write code to add the new stock into the stocks array
  stocks.push(newStock);
  // Write code to delete the contents of the former input
  $("#stock-input").val("")
  // The renderButtons function is called, rendering the list of stock buttons
  render();
}

$('#add-stock').on('click', addButton);
$("#stocks-view").on("click",".get-stock", function (event) {

  event.preventDefault();
  const stock = $(this).val();
  const queryURL = `https://api.iextrading.com/1.0/stock/${stock}/batch?types=quote,news&range=1m&last=10`;
  console.log(stock);
  console.log(queryURL);
  $.ajax({
    url:queryURL,
    method:"GET"
  }).then(function(response){

    console.log(response);

  })


})
// Calling the renderButtons function to display the initial list of stocks
render();


