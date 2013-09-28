/* --------------- Constants --------------- */
var DATA_URL_BASE = "./www/data";
var DATA_URLS = ["/Carmelo/Carmelo_2008_2009.json", "/Carmelo/Carmelo_2009_2010.json", "/Carmelo/Carmelo_2010_2011.json", "/Carmelo/Carmelo_2011_2012.json",
   				 "/CP3/CP3_2008_2009.json", "/CP3/CP3_2009_2010.json", "/CP3/CP3_2010_2011.json", "/CP3/CP3_2011_2012.json",
				 "/Dirk/Dirk_2008_2009.json", "/Dirk/Dirk_2009_2010.json", "/Dirk/Dirk_2010_2011.json", "/Dirk/Dirk_2011_2012.json",
				 "/DWill/DWill_2008_2009.json", "/DWill/DWill_2009_2010.json", "/DWill/DWill_2010_2011.json", "/DWill/DWill_2011_2012.json",
				 "/Durant/Durant_2008_2009.json", "/Durant/Durant_2009_2010.json", "/Durant/Durant_2010_2011.json", "/Durant/Durant_2011_2012.json",
				 "/Duncan/Duncan_2008_2009.json", "/Duncan/Duncan_2009_2010.json", "/Duncan/Duncan_2010_2011.json", "/Duncan/Duncan_2011_2012.json",
				 "/Dwight/Dwight_2008_2009.json", "/Dwight/Dwight_2009_2010.json", "/Dwight/Dwight_2010_2011.json", "/Dwight/Dwight_2011_2012.json",
				 "/Lebron/Lebron_2008_2009.json", "/Lebron/Lebron_2009_2010.json", "/Lebron/Lebron_2010_2011.json", "/Lebron/Lebron_2011_2012.json",
				 "/Rondo/Rondo_2008_2009.json", "/Rondo/Rondo_2009_2010.json", "/Rondo/Rondo_2010_2011.json", "/Rondo/Rondo_2011_2012.json",
				 "/Nash/Nash_2008_2009.json", "/Nash/Nash_2009_2010.json", "/Nash/Nash_2010_2011.json", "/Nash/Nash_2011_2012.json",
				 "/JoshSmith/JoshSmith_2008_2009.json", "/JoshSmith/JoshSmith_2009_2010.json", "/JoshSmith/JoshSmith_2010_2011.json", "/JoshSmith/JoshSmith_2011_2012.json",
				 "/JasonKidd/JasonKidd_2008_2009.json", "/JasonKidd/JasonKidd_2009_2010.json", "/JasonKidd/JasonKidd_2010_2011.json", "/JasonKidd/JasonKidd_2011_2012.json",
				 "/Iguodala/Iguodala_2008_2009.json", "/Iguodala/Iguodala_2009_2010.json", "/Iguodala/Iguodala_2010_2011.json", "/Iguodala/Iguodala_2011_2012.json",
				 "/DWade/DWade_2008_2009.json", "/DWade/DWade_2009_2010.json", "/DWade/DWade_2010_2011.json", "/DWade/DWade_2011_2012.json",
				 "/DRose/DRose_2008_2009.json", "/DRose/DRose_2009_2010.json", "/DRose/DRose_2010_2011.json", "/DRose/DRose_2011_2012.json",
				 "/DavidLee/DavidLee_2008_2009.json", "/DavidLee/DavidLee_2009_2010.json", "/DavidLee/DavidLee_2010_2011.json", "/DavidLee/DavidLee_2011_2012.json",
				 "/Kobe/Kobe_2008_2009.json", "/Kobe/Kobe_2009_2010.json", "/Kobe/Kobe_2010_2011.json", "/Kobe/Kobe_2011_2012.json"
				 ];

/* --------------- Data --------------- */
var data = {

};

var DATA_OBJECTS = [];

var currentPlayer = "Lebron";
var currentSeason = 1;
var players = ["Lebron", "Durant", "Duncan", "Dwight", "Kobe", "Carmelo", "CP3", "Dirk", "DWill", "JasonKidd", "JoshSmith", "Rondo", "Iguodala", "DWade", "DRose", "DavidLee", "Nash" ];//, "Garnett"];
var seasons = ["2008-2009", "2009-2010", "2010-2011", "2011-2012"];

/* --------------- Data from Server --------------- */

var getDataFromServer = function(){
	var callback = function(xml, text){
		var data = JSON.parse(text);
		DATA_OBJECTS.push(data);	
	};

	for(var i = 0; i < DATA_URLS.length; i++){
		sendAjaxRequest(DATA_URL_BASE + DATA_URLS[i], callback);		
	}
};

var processData = function(){
	var seasonData = getSeasonData("2008-2009", "Lebron");
	populateDataObject(seasonData);
};

var getSeasonData = function(season, player){
	for(var i = 0; i < DATA_OBJECTS.length; i++){
		if(DATA_OBJECTS[i].season === season && DATA_OBJECTS[i].playerName === player){
			return DATA_OBJECTS[i];
		}	
	}

	return {};
};

var populateDataObject = function(seasonData){
	data.totalGames = seasonData.arr.length;
	data.numGames = [0, 0, 0, 0, 0, 0, 0];
	data.games = [];

	for(var i = 0; i < seasonData.arr.length; i++){
		var game = seasonData.arr[i];
		var _game = {};
		
		var date = Date.parse(game.date);
		var month = date.getMonth();
		switch(month){
			case 9:
				data.numGames[0]++;
				break;
			case 10:
				data.numGames[1]++;	
				break;
			case 11:
				data.numGames[2]++;	
				break;
			case 0:
				data.numGames[3]++;	
				break;
			case 1:
				data.numGames[4]++;	
				break;
			case 2:
				data.numGames[5]++;	
				break;
			case 3:
				data.numGames[6]++;	
				break;
		}

		_game.location = game.location === "Home" ? "H" : "A";
		_game.result = game.outcom === "L" ? "L" : "W";
		_game.teamScore = isString(game.teamscore) ? parseFloat(parseFloat(game.teamscore).toFixed(1)) : parseFloat(game.teamscore.toFixed(1));
		_game.oppositionScore = isString(game.oppscore) ? parseFloat(parseFloat(game.oppscore).toFixed(1)) : parseFloat(game.oppscore.toFixed(1));
		_game.pointsScored = isString(game.pts) ? parseFloat(parseFloat(game.pts).toFixed(1)) : parseFloat(game.pts.toFixed(1));
		_game.minutes = isString(game.mindec) ? parseFloat(parseFloat(game.mindec).toFixed(1)) : parseFloat(game.mindec.toFixed(1));

		_game.assists = isString(game.ast) ? parseFloat(parseFloat(game.ast).toFixed(1)) : parseFloat(game.ast.toFixed(1));
		_game.rebounds = isString(game.rbs) ? parseFloat(parseFloat(game.rbs).toFixed(1)) : parseFloat(game.rbs.toFixed(1));
		_game.steals = isString(game.stl) ? parseFloat(parseFloat(game.stl).toFixed(1)) : parseFloat(game.stl.toFixed(1));

		// getting the date
		_game.month = month;
		_game.year = date.getFullYear();

		data.games.push(_game);
	}
};

/* --------------- Slider Callback Functions --------------- */

var showSeasonData = function(event){
	var player = currentPlayer;
	var season = seasons[event.target.valueAsNumber - 1];
	currentSeason = event.target.valueAsNumber;

	var seasonData = getSeasonData(season, player);
	populateDataObject(seasonData);
	clearDaySectors();
	draw();

	graphinitiate();
};

var showPlayerData = function(event){
	var season = seasons[currentSeason - 1];
	var player = players[event.target.valueAsNumber - 1];
	currentPlayer = player;

	var seasonData = getSeasonData(season, player);
	populateDataObject(seasonData);
	clearDaySectors();
	draw();
	

	graphinitiate();
	setProfilePic(currentPlayer);
};

var setProfilePic = function(playerName){
	$("#profile_pic").attr("src","./www/images/" + playerName + ".jpg");	
};

/* utility function taken from underscore.js to determine if obj is a string */
var isString = function (obj) {
  return toString.call(obj) == '[object String]';
};

