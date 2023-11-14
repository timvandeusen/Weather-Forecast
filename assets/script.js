$(document).ready(function () {
  $("#my-search-button").on("click", function () {
    var city = $("#my-search-value").val();
    getWeatherData(city);
    getWeatherForecast(city);
  });

  $("#my-search-value").keypress(function (event) {
    var keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode === 13) {
      var city = $("#my-search-value").val();
      getWeatherData(city);
      getWeatherForecast(city);
    }
  });

  var searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  if (searchHistory.length > 0) {
    getWeatherData(searchHistory[searchHistory.length - 1]);
  }

  for (var i = 0; i < searchHistory.length; i++) {
    createSearchHistoryItem(searchHistory[i]);
  }

  function createSearchHistoryItem(city) {
    var listItem = $("<li>").addClass("list-group-item").text(city);
    $(".my-search-history").append(listItem);
  }

  $(".my-search-history").on("click", "li", function () {
    var city = $(this).text();
    getWeatherData(city);
    getWeatherForecast(city);
  });

  function getWeatherData(city) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=c570e3e981953e571ea4c1cf1f2c6315&units=imperial",
    }).then(function (data) {
      if (searchHistory.indexOf(city) === -1) {
        searchHistory.push(city);
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        createSearchHistoryItem(city);
      }

      $("#my-today").empty();

      var title = $("<h3>").addClass("card-title").text(data.city.name + " (" + new Date().toLocaleDateString() + ")");
      var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[0].weather[0].icon + ".png");

      var card = $("<div>").addClass("card");
      var cardBody = $("<div>").addClass("card-body");
      var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[0].wind.speed + " MPH");
      var humidity = $("<p>").addClass("card-text").text("Humidity: " + data.list[0].main.humidity + " %");
      var temperature = $("<p>").addClass("card-text").text("Temperature: " + data.list[0].main.temp + " °F");

      var lon = data.city.coord.lon;
      var lat = data.city.coord.lat;

      $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=c570e3e981953e571ea4c1cf1f2c6315&lat=" + lat + "&lon=" + lon,
      }).then(function (response) {
        var uvColor;
        var uvIndex = $("<p>").addClass("card-text").text("UV Index: ");
        var uvBtn = $("<span>").addClass("btn btn-sm").text(response.value);

        if (response.value < 3) {
          uvBtn.addClass("btn-success");
        } else if (response.value < 7) {
          uvBtn.addClass("btn-warning");
        } else {
          uvBtn.addClass("btn-danger");
        }

        cardBody.append(uvIndex);
        $("#my-today .card-body").append(uvIndex.append(uvBtn));
      });

      title.append(img);
      cardBody.append(title, temperature, humidity, wind);
      card.append(cardBody);
      $("#my-today").append(card);
    });
  }

  function getWeatherForecast(city) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=c570e3e981953e571ea4c1cf1f2c6315&units=imperial",
    }).then(function (data) {
      $("#my-forecast").empty();

      var rowContainer = $("<div>").addClass("row");

      for (var i = 0; i < data.list.length; i++) {
        if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
          var forecastTitle = $("<h3>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
          var forecastImg = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
          var forecastCol = $("<div>").addClass("col-md-2.5");
          var forecastCard = $("<div>").addClass("card bg-primary text-white");
          var forecastCardBody = $("<div>").addClass("card-body p-2");
          var forecastHumidity = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
          var forecastTemperature = $("<p>").addClass("card-text").text("Temperature: " + data.list[i].main.temp + " °F");
          forecastCardBody.append(forecastTitle, forecastImg, forecastTemperature, forecastHumidity);
          forecastCard.append(forecastCardBody);
          forecastCol.append(forecastCard);
          rowContainer.append(forecastCol);
        }
      }

      $("#my-forecast").append(rowContainer);
    });
  }
});
