$(function () {
    $("#more-content").hide();
    var options = {
        lines: { show: true },
        points: { show: true },
        xaxis: { mode: "time"  }
    };
    var data = [];
    var placeholder = $("#placeholder");
    
    $.plot(placeholder, data, options);
    
    //For test right now, need the selected month, range from 0 to 11; and the year at the beginning of the season
    var selectedMonth = 11;
    var selectedYear = 2008;

    //currentSeason 1 -> 2008-2009
    var selectedSeason = 2007+currentSeason;
    var selectedSeasonEnd = selectedSeason + 1;
    
    $("#seasoninfo").html(selectedSeason + " - " + selectedSeasonEnd);
    $("#playerinfo").html( currentPlayer );
    

    
    whichMonth(selectedMonth);
    var season_str = '_'+selectedSeason+'_'+selectedSeasonEnd+'.json';
    $("#Kobe").attr("value", "./www/data/Kobe/Kobe"+season_str);
    $("#Durant").attr("value", "./www/data/Durant/Durant"+season_str);
    $("#Duncan").attr("value", "./www/data/Duncan/Duncan"+season_str);
    $("#Dwight").attr("value", "./www/data/Dwight/Dwight"+season_str);
    $("#Lebron").attr("value", "./www/data/Lebron/Lebron"+season_str);
    
    var init_url = "./www/data/" + currentPlayer + "/" + currentPlayer + season_str;
    $("#more").click(function(){
        $("#more-content").show();
        $.ajax({
            url: init_url,
            method: 'GET',
            dataType: 'json',
            success: onDataReceived
            
        });
    });
    
    
    // fetch one series, adding to what we got
    var alreadyFetched = {};


    function onDataReceived(series) {
            // extract the first coordinate pair so you can see that
            // data is now an ordinary Javascript object
             console.log(series.arr[0]["date"]);
             var firstcoordinate = '(' + series.arr[0]["date"] + ', ' + series.arr[0]["mindec"] + ')';

            // button.siblings('span').text('Player: ' + series.playerName + ', first point: ' + firstcoordinate);

            // let's add it to our current data
            if (!alreadyFetched[series.playerName]) {
                alreadyFetched[series.playerName] = true;
                data.push(flotDataTransformer(series));
            }

            //var data = flotDataTransformer(series);
            //console.log(data);
            //console.log(Date.parse(series.arr[0]["date"]));
            var gamedate = new Date(series.arr[0]["date"]);
            var gamemonth = gamedate.getMonth();
            console.log(flotDataTransformer(series));
            console.log(series.playerName);
            // and plot all we got
            $.plot(placeholder, data, options);
    }


    $("#comparePlayer").change(function() {
        
        var dataurl = $("#comparePlayer").val();
        console.log(dataurl);

        
        $.ajax({
            url: dataurl,
            method: 'GET',
            dataType: 'json',
            success: onDataReceived
        });
    });
       
    
    
    // $("input.fetchSeries").click(function () {

    //     var button = $(this);
    //     // find the URL in the link right next to us 
    //     var dataurl = button.siblings('a').attr('href');  
       
    //     // then fetch the data with jQuery
    //     $.ajax({
    //         url: dataurl,
    //         method: 'GET',
    //         dataType: 'json',
    //         success: onDataReceived
    //     });
    // });


    $("#whole").click(function () {
        $.plot($("#placeholder"), data, { xaxis: { mode: "time" } });
    });

    $("#regular").click(function () {
        $.plot($("#placeholder"), data, {
            xaxis: {
                mode: "time",
                min: (new Date(2008, 9, 15)).getTime(),
                max: (new Date(2009, 2, 15)).getTime()
            }
        });
    });

    $("#playOff").click(function () {
        $.plot($("#placeholder"), data, {
            xaxis: {
                mode: "time",
                // playoff from mid-March to end-May
                min: (new Date(2009, 2, 15)).getTime(),
                max: (new Date(2009, 4, 1)).getTime()
            }
        });
    });

    $("#april").click(function () {
    
        $.plot($("#placeholder"), data, {
            xaxis: {
                mode: "time",               
                min: (new Date(selectedYear, selectedMonth, 1)).getTime(),
                max: (new Date(selectedYear, selectedMonth, 31)).getTime()
            }
        });
    });

    $("#toreset").click(function(){
        location.reload();
    });

    /* Automatically Get the Month*/
    function whichMonth(selectedMonth) {
        switch (selectedMonth) {
            case 9:
                var monthSelected = "Octorber"; 
                // monthPeriodStart = new Date();
                // monthPeriodEnd = ""; 
                break;
            case 10:
                var monthSelected = "November"; break;
            case 11:
                var monthSelected = "December"; break;
            case 0:
                var monthSelected = "January"; break;
            case 1:
                var monthSelected = "Febrary"; break;
            case 2:
                var monthSelected = "March"; break;
            case 3:
                var monthSelected = "April"; break;
            case 4:
                var monthSelected = "May"; break;

        }
        document.getElementById("april").innerHTML = monthSelected;
    }


});



/* Special data format for Flot Library*/
var flotDataTransformer = function(obj) {
    var plots = [];
    for (var i = obj.arr.length - 1; i >= 0; i--) {
        // var gamedate = new Date(obj.arr[i]["date"]);
        // var gameday = gamedate.getDate();    
        // var plot = [ gameday , obj.arr[i]['mindec'] ];
        var gamedate =Date.parse(obj.arr[i]["date"]);    
        var plot = [ gamedate , obj.arr[i]['mindec'] ];
        plots.push(plot);

    };
    var data = { label: obj.playerName, data: plots }
    return data;
};

/* change the season by slider */
function seasonchanged (){
    selectedSeason = currentSeason + 2007;
    selectedSeasonEnd = selectedSeason + 1;
    $("#seasoninfo").html(selectedSeason + " - " + selectedSeasonEnd);
    

    selectedMonth = 11;
}

