$(function () {
    $("#april").hide();
    var flotdata = [];
    var alreadyFetched = {};

    graphinitiate();

    $(":checkbox").click(function(){
        clearDaySectors();
        draw();        
    });
});

function graphinitiate(){
            flotdata = [];
            alreadyFetched = {};
        //playerMax = 4    
            var playerMax = 0;
            alreadyFetched = {};
            flotdata = [];
            $("#timeslot").html("");

            var options = {
                lines: { show: true },
                points: { show: true },
                xaxis: { mode: "time"  }
            };
            
            var placeholder = $("#placeholder");
            
            $.plot(placeholder, flotdata, options);
            
            //For test right now, need the selected month, range from 0 to 11; and the year at the beginning of the season
            var selectedMonth = 9;
            var selectedYear = 2008;

            //currentSeason 1 -> 2008-2009
            var selectedSeason = 2007+currentSeason;
            var selectedSeasonEnd = selectedSeason + 1;
            
            $("#seasoninfo").html(selectedSeason + " - " + selectedSeasonEnd);
            $("#playerinfo").html( currentPlayer );
            

            
            setMonth(selectedMonth);
            var season_str = '_'+selectedSeason+'_'+selectedSeasonEnd+'.json';
            $("#Kobe").attr("value", "./www/data/Kobe/Kobe"+season_str);
            $("#Durant").attr("value", "./www/data/Durant/Durant"+season_str);
            $("#Duncan").attr("value", "./www/data/Duncan/Duncan"+season_str);
            $("#Dwight").attr("value", "./www/data/Dwight/Dwight"+season_str);
            $("#Lebron").attr("value", "./www/data/Lebron/Lebron"+season_str);
            $("#Garnett").attr("value", "./www/data/Garnett/Garnett"+season_str);
            $("#Carmelo").attr("value", "./www/data/Carmelo/Carmelo"+season_str);
            $("#CP3").attr("value", "./www/data/CP3/CP3"+season_str);
            $("#Dirk").attr("value", "./www/data/Dirk/Dirk"+season_str);
            $("#DWill").attr("value", "./www/data/DWill/DWill"+season_str);
            $("#JasonKidd").attr("value", "./www/data/JasonKidd/JasonKidd"+season_str);
            $("#JoshSmith").attr("value", "./www/data/JoshSmith/JoshSmith"+season_str);
            $("#Nash").attr("value", "./www/data/Nash/Nash"+season_str);
            $("#Rondo").attr("value", "./www/data/Rondo/Rondo"+season_str);
            $("#Iguodala").attr("value", "./www/data/Iguodala/Iguodala"+season_str);
            $("#DWade").attr("value", "./www/data/DWade/DWade"+season_str);
            $("#DRose").attr("value", "./www/data/DRose/DRose"+season_str);
            $("#DavidLee").attr("value", "./www/data/DavidLee/DavidLee"+season_str);


            
            var init_url = "./www/data/" + currentPlayer + "/" + currentPlayer + season_str;
            $("#comparePlayer").val(init_url);
                
            $.ajax({
                    url: init_url,
                    method: 'GET',
                    dataType: 'json',
                    success: onDataReceived
                    
            });

            // $("#more-content").show();
            
            
            // fetch one series, adding to what we got
            


            function onDataReceived(series) {
                if( playerMax<4 ){
                    // extract the first coordinate pair so you can see that
                    // data is now an ordinary Javascript object
                     console.log(series.arr[0]["date"]);
                     var firstcoordinate = '(' + series.arr[0]["date"] + ', ' + series.arr[0]["mindec"] + ')';

                    // button.siblings('span').text('Player: ' + series.playerName + ', first point: ' + firstcoordinate);

                    // let's add it to our current data
                    if (!alreadyFetched[series.playerName]) {
                        alreadyFetched[series.playerName] = true;
                        flotdata.push(flotDataTransformer(series));
                    }

                    //var data = flotDataTransformer(series);
                    //console.log(data);
                    //console.log(Date.parse(series.arr[0]["date"]));
                    var gamedate = new Date(series.arr[0]["date"]);
                    var gamemonth = gamedate.getMonth();
                    console.log(flotDataTransformer(series));
                    console.log(series.playerName);
                    // and plot all we got
                    $.plot(placeholder, flotdata, options);
                    playerMax++ ;
                }

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
                $("#timeslot").html("");
                $.plot($("#placeholder"), flotdata, { xaxis: { mode: "time" } });
            });

            $("#regular").click(function () {
                $("#timeslot").html("in regular season");
                $.plot($("#placeholder"), flotdata, {
                    xaxis: {
                        mode: "time",
                        min: (new Date(selectedSeason, 9, 15)).getTime(),
                        max: (new Date(selectedSeasonEnd, 2, 15)).getTime()
                    }
                });
            });

            $("#playOff").click(function () {
                $("#timeslot").html("in Playoffs");
                $.plot($("#placeholder"), flotdata, {
                    xaxis: {
                        mode: "time",
                        // playoff from mid-March to end-May
                        min: (new Date(selectedSeasonEnd, 2, 15)).getTime(),
                        max: (new Date(selectedSeasonEnd, 4, 1)).getTime()
                    }
                });
            });

            // $("#april").click(function () {
            //     var month_str = "in " + $(this).html(); 
            //     $("#timeslot").html(month_str); 
            //     $.plot($("#placeholder"), flotdata, {
            //         xaxis: {
            //             mode: "time",               
            //             min: (new Date(selectedYear, selectedMonth, 1)).getTime(),
            //             max: (new Date(selectedYear, selectedMonth, 31)).getTime()
            //         }
            //     });
            // });

            $("#toreset").click(function(){
                location.reload();
            });

            
}

/* Automatically Get the Month*/
function setMonth(selectedMonth) {
        switch (selectedMonth) {
            case 9:
                    var monthSelected = "October"; 
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
       
        //document.getElementById("timeslot_1").innerHTML = monthSelected;
        

        
}

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
    var flotdata = { label: obj.playerName, data: plots }
    return flotdata;
};

/* change the season by slider */
function seasonchanged (){
    selectedSeason = currentSeason + 2007;
    selectedSeasonEnd = selectedSeason + 1;
    $("#seasoninfo").html(selectedSeason + " - " + selectedSeasonEnd);


    selectedMonth = 11;
}

