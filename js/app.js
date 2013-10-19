(function(window){

    //Check if browser supports W3C Geolocation API
    if (navigator.geolocation) 
    {
        $("#results .head").html("<h4>Getting Weather for Current Location...</h4>");
        $("#results .body").html("<div class='center'><img src='img/loader.gif' /></div>");

        navigator.geolocation.getCurrentPosition(function(position)
        {
            getWeatherFromCoordinates(position.coords.latitude, position.coords.longitude, showWeather);
        }, function()
        {
            $("#results .head").html("<h4>Error: could not determine location...</h4>");
            $("#results .body").html("");
        });
    }
    
    $("#search").on("submit", function()
    {
        $("#results .head").html("");
        getWeatherFromCity($("#city").val());
        return false;
    })

    function getWeatherFromCity(city, callback)
    {
        if(city === false || typeof city === "undefined") 
        {
            $("#results .head").html("Sorry, could not find city...");
            return;
        }

        $("#results .body").html("<div class='center'><img src='img/loader.gif' /></div>");
        var url = "http://api.openweathermap.org/data/2.5/weather?q="+city;
        getJSONP(url, callback);
    }

    function getWeatherFromCoordinates(lat, long, callback)
    {
        if(city === false || typeof city === "undefined") 
        {
            $("#results .head").html("Sorry, could not find city...");
            return;
        }

        $("#results .body").html("<div class='center'><img src='img/loader.gif' /></div>");
        var url = "http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+long;
        getJSONP(url, callback);
    }

    function showWeather(data)
    {
        console.log(data);
        var units = $("[name='units']:checked").val();

        var weather = {};
        //get general weather, description
        weather.condition = data.weather[0].description;

        //get time received, sunrise and sunset
        weather["time"] = getDateTime(data.dt, "m")+" (your time)";
        weather.sunrise = getDateTime(data.sys.sunrise, "m")+" (your time)";
        weather.sunset = getDateTime(data.sys.sunset, "m")+" (your time)";

        //original is in kelvin, need to convert to celcius
        if(units==="celcius")
        {
            var tempUnit = "°C";
            weather.temperature = Math.round(data.main.temp-273.15)+tempUnit;
            //daily max/min
            if(data.main.temp_min && data.main.temp_max)
            {
                weather["low"] = Math.round(data.main.temp_min-273.15)+tempUnit;
                weather["high"] = Math.round(data.main.temp_max-273.15)+tempUnit;
            }
        }
        //otherwise, if in fahrenheit
        else
        {
            var tempUnit = "°F";
            weather.temperature = Math.round(((data.main.temp-273.15)*1.8)+32)+tempUnit;
            //daily max/min
            if(data.main.temp_min && data.main.temp_max)
            {
                weather["low"] = Math.round(((data.main.temp_min-273.15)*1.8)+32)+tempUnit;
                weather["high"] = Math.round(((data.main.temp_max-273.15)*1.8)+32)+tempUnit;
            }
        }

        //when changing from celcius to fahrenheit or vice versa, reflect changes
        $("[name='units']").change(function(){showWeather(data)});

        //humidity in percent
        weather.humidity = data.main.humidity+"%";
        //wind speed in km/h
        weather["wind speed"] = Math.round((data.wind.speed*3.6))+"km/h";
        //cloudiness in percent
        weather.cloudiness = data.clouds.all+"%";
        //air pressure in kPa
        weather.pressure = (data.main.pressure/10)+"kPa";
        //precipitation in mm
        if(data.rain) for(range in data.rain) weather[range+" range of rain"] = data.rain[range]+"mm";
        if(data.snow) for(range in data.snow) weather[range+" range range of snow"] = data.snow[range]+"mm";
        
        $("#results .head").html("<h4>"+data.name+", "+data.sys.country+"</h4>");
        $("#results .body").html("");

        for(key in weather)
        {
            var value = weather[key];

            $("#results .body").append("<p><b>"+key.capitalize()+": </b>"+value+"</p>")
        }

    }

})(window);

