var canvas; // canvas element on the DOM
var context; // The context which gives access to the drawing API

/* --------------- Constants --------------- */
var INNER_RADIUS = 150;
var OUTER_RADIUS = 900;
var DISPLACE_ANGLE = 15;
var DISPLACE_ANGLE_IN_RADIANS;
var ANGLE_AVAILABLE = 180 - 2 * DISPLACE_ANGLE;
var ANGLE_AVAILABLE_IN_RADIANS;
var SECTOR_EXPANSION_FACTOR = 7;
var SELECTED_SECTOR_EXPANSION_LENGTH = 150;
var BAR_GRAPH_SEPARATION = 20;
var GLOBAL_ALPHA = 1.0;


var CANVAS_BACKGROUND_COLOR = "#717171";
var WIN_SECTOR_COLOR = "#7EA2A9";
var LOSS_SECTOR_COLOR = "#E1BD81";
var EXPANDED_WIN_SECTOR_COLOR = "#4199F3";
var EXPANDED_LOSS_SECTOR_COLOR = "#B77437";
var EXPANDED_SECTOR_STROKE_COLOR = "#A75D19";
var INNER_BAR_COLOR = "white";
var OUTER_BAR_COLOR = "#9EAD81";

var POINTS_PLOT_COLOR = "#501700";
var ASSISTS_PLOT_COLOR = "#FF1009";
var REBOUNDS_PLOT_COLOR = "#151B16";
var STEALS_PLOT_COLOR = "#F5A503";
var TEXT_FONT = "9pt Candara";

/* --------------- Sector Initialization --------------- */
var origin = {
	x : 1050,
	y : 1200
};

var sectorInfo = {
	daySectors : [],
	_daySectors : [],
	isAnimated : false /* Indicates if the visualization is in animated state */
};

/* --------------- Helper Functions --------------- */
var generateSectors = function(){
	var angle = DISPLACE_ANGLE_IN_RADIANS;
	for(var i = 0; i < data.totalGames; i++){
		var day = {startAngle : angle};
		angle = angle + getDayAngle(ANGLE_AVAILABLE);
		day.endAngle = angle;
		day.index = i + 1;
		sectorInfo.daySectors.push(day);
	}	
}

var getDayAngle = function(angleAvailable){
	return getAngleInRadians(angleAvailable/data.totalGames);
};

var getAngleInRadians = function(angle){
	return angle * Math.PI/180;
};


var handleClick = function(e){
	var clickLocation = {x:e.pageX, y:e.pageY};

	var point_info = getPointInfo(clickLocation);

	if(isPointInDrawing(point_info)){
		setTimeout(function(){
			showExpandedSector(point_info.angle);
		}, 0);	
	}else{
		sectorInfo.isAnimated = false;
		clearDaySectors();
		draw();
	}
};

/* returns true if the given point is in the drawing */
var isPointInDrawing = function(point_info){
	var result = true;

	if(point_info.y > origin.y){
		return false;
	}

	if(point_info.distance > OUTER_RADIUS || point_info.distance < INNER_RADIUS){
		return false;
	}

	if(!sectorInfo.isAnimated){
		if(point_info.angle < DISPLACE_ANGLE_IN_RADIANS || point_info.angle > DISPLACE_ANGLE_IN_RADIANS + ANGLE_AVAILABLE_IN_RADIANS){
			return false;
		}
	}

	return true;
};

/* returns an object containing angle and distance_from_origin */
var getPointInfo = function(point){
	var deltaX = point.x - origin.x - 40;
	var deltaY = Math.abs(point.y - origin.y);

	var angle = Math.atan(deltaY/deltaX);
	angle = angle > 0 ? Math.PI - angle : -angle;

	var distance_from_origin = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

	return{
		x : point.x,
		y : point.y,
		angle : angle,
		distance : distance_from_origin
	};
}

var getSector = function(angle, daySectors){
	for(var i = 0; i < daySectors.length; i++){
		var curr = daySectors[i];
		if(angle >= curr.startAngle && angle <= curr.endAngle){
			return curr;
		}
	}
};

var clearDaySectors = function(){
	sectorInfo._daySectors = [];
	sectorInfo.daySectors = [];
	if(sectorInfo.selectedIndex){
		delete sectorInfo.selectedIndex;
	}
	sectorInfo.isAnimated = false;
};


/* important : generates the modified sector objects after click */
var generateAnimatedDaySectors = function(angle){
	var sector = (!sectorInfo.isAnimated) ? getSector(angle, sectorInfo.daySectors) : getSector(angle, sectorInfo._daySectors);
	var sectorIndex = sector.index;

	console.log(sector);
	var anglePerDay = (Math.PI - SECTOR_EXPANSION_FACTOR * getDayAngle(180 - 2 * DISPLACE_ANGLE))/(data.totalGames - 1);

	var angle = 0;
	clearDaySectors(); /* clear the previously used animated day sectors if not empty */

	for(var i = 0; i < data.totalGames; i++){
		var _day = {startAngle : angle};
		_day.index = (i + 1);
		if(i === (sectorIndex - 1)){
			_day.endAngle = _day.startAngle + (SECTOR_EXPANSION_FACTOR * getDayAngle(180 - 2 * DISPLACE_ANGLE));
			sectorInfo.selectedIndex = i + 1; 
		}
		else{
			_day.endAngle = _day.startAngle + anglePerDay;
		}
		angle = _day.endAngle;
		sectorInfo._daySectors.push(_day);
	}

	sectorInfo.isAnimated = true;
};

/* --------------- Animation Functions --------------- */

var showExpandedSector = function(angle){
	generateAnimatedDaySectors(angle);
	clearCanvas();
	drawBoundary(0);
	
	context.strokeStyle = "black";
	context.lineWidth = 3;
	drawArcs(0);
	
	drawDaySectors(sectorInfo._daySectors);
	drawMonthSectors(sectorInfo._daySectors);
	expandSelectedSector(sectorInfo.selectedIndex);
	drawTextOnSectors(sectorInfo._daySectors);

	var selectedMonth = data.games[sectorInfo.selectedIndex].month;
	var selectedYear = data.games[sectorInfo.selectedIndex].year;
	setMonth(selectedMonth);
	
	$.plot($("#placeholder"), flotdata, {
                    xaxis: {
                        mode: "time",               
                        min: (new Date(selectedYear, selectedMonth, 1)).getTime(),
                        max: (new Date(selectedYear, selectedMonth, 31)).getTime()
                    }
    });

    var str = document.getElementById("april").innerHTML; 
    $("#timeslot").html("in " + str);

}

/* --------------- Drawing Functions --------------- */

var drawArcs = function(displaceAngle){
	context.beginPath();
	context.arc(origin.x, origin.y, INNER_RADIUS, getAngleInRadians(180 + displaceAngle), getAngleInRadians(360 - displaceAngle), false);
	context.stroke();

	context.beginPath();

	context.arc(origin.x, origin.y, OUTER_RADIUS, getAngleInRadians(180 + displaceAngle), getAngleInRadians(360 - displaceAngle), false);
	context.stroke();
};

var drawBoundary = function(displaceAngle){
	context.beginPath();
	context.strokeStyle = "white";
	context.lineWidth = 10;
	context.arc(origin.x, origin.y, INNER_RADIUS, getAngleInRadians(180 + displaceAngle), getAngleInRadians(360 - displaceAngle), false);
	context.stroke();

	context.beginPath();
	context.arc(origin.x, origin.y, OUTER_RADIUS, getAngleInRadians(180 + displaceAngle), getAngleInRadians(360 - displaceAngle), false);
	context.stroke();

	var startAngle = getAngleInRadians(displaceAngle),
		endAngle = Math.PI - startAngle;

	context.moveTo(origin.x - INNER_RADIUS * Math.cos(startAngle), origin.y - INNER_RADIUS * Math.sin(startAngle));
	context.lineTo(origin.x - OUTER_RADIUS * Math.cos(startAngle), origin.y - OUTER_RADIUS * Math.sin(startAngle));

	context.moveTo(origin.x - INNER_RADIUS * Math.cos(endAngle), origin.y - INNER_RADIUS * Math.sin(endAngle));
	context.lineTo(origin.x - OUTER_RADIUS * Math.cos(endAngle), origin.y - OUTER_RADIUS * Math.sin(endAngle));

	context.stroke();		
};

var drawMonthSectors = function(daySectors){
	var currentMonth = 1;
	context.save();
	context.strokeStyle = "#583230";
	context.lineWidth = 3;

	context.moveTo(origin.x - INNER_RADIUS * Math.cos(daySectors[currentMonth - 1].startAngle), origin.y - INNER_RADIUS * Math.sin(daySectors[currentMonth - 1].startAngle));
	context.lineTo(origin.x - OUTER_RADIUS * Math.cos(daySectors[currentMonth - 1].startAngle), origin.y - OUTER_RADIUS * Math.sin(daySectors[currentMonth - 1].startAngle));

	for(var i = 0; i < data.numGames.length - 1; i++){
		currentMonth += data.numGames[i];
		context.moveTo(origin.x - INNER_RADIUS * Math.cos(daySectors[currentMonth - 1].startAngle), origin.y - INNER_RADIUS * Math.sin(daySectors[currentMonth - 1].startAngle));
		context.lineTo(origin.x - OUTER_RADIUS * Math.cos(daySectors[currentMonth - 1].startAngle), origin.y - OUTER_RADIUS * Math.sin(daySectors[currentMonth - 1].startAngle));
	}

	context.moveTo(origin.x - INNER_RADIUS * Math.cos(daySectors[data.totalGames - 1].endAngle), origin.y - INNER_RADIUS * Math.sin(daySectors[data.totalGames - 1].endAngle));
	context.lineTo(origin.x - OUTER_RADIUS * Math.cos(daySectors[data.totalGames - 1].endAngle), origin.y - OUTER_RADIUS * Math.sin(daySectors[data.totalGames - 1].endAngle));
	
	context.stroke();
	context.restore();
};

var drawDaySectors = function(daySectors){
	context.save();
	

	for(var i = 0; i < daySectors.length; i++){
		context.beginPath();
	
		context.strokeStyle = "brown";
		if(data.games[i].result === "L"){
			context.fillStyle = LOSS_SECTOR_COLOR;
		}else{
			context.fillStyle = WIN_SECTOR_COLOR;
		}
		
  		context.lineWidth = 1;
		var angle = daySectors[i].startAngle;
		context.moveTo(origin.x - INNER_RADIUS * Math.cos(angle), origin.y - INNER_RADIUS * Math.sin(angle));
		context.lineTo(origin.x - OUTER_RADIUS * Math.cos(angle), origin.y - OUTER_RADIUS * Math.sin(angle));
		context.arc(origin.x, origin.y, OUTER_RADIUS, Math.PI + angle, Math.PI + daySectors[i].endAngle, false);
		angle = daySectors[i].endAngle;
		context.lineTo(origin.x - INNER_RADIUS * Math.cos(angle), origin.y - INNER_RADIUS * Math.sin(angle));
		angle = daySectors[i].endAngle;
		context.lineTo(origin.x - INNER_RADIUS * Math.cos(angle), origin.y - INNER_RADIUS * Math.sin(angle));
		context.stroke();
		context.fill();	
	}
	
	
	context.restore();	
};

var drawTextOnSectors = function(daySectors){
	for(var i = 0; i < daySectors.length; i++){
		if(i === sectorInfo.selectedIndex - 1){
			drawTextOnExpandedSector(daySectors[i]);
			continue;	
		}
		drawText(daySectors[i], (INNER_RADIUS + OUTER_RADIUS)/1.2, data.games[i].result);
		drawText(daySectors[i], (INNER_RADIUS + OUTER_RADIUS)/1.3, data.games[i].location);

		drawText(daySectors[i], (INNER_RADIUS + OUTER_RADIUS)/1.5, data.games[i].teamScore);
		drawText(daySectors[i], (INNER_RADIUS + OUTER_RADIUS)/1.6, data.games[i].assists);	
		drawText(daySectors[i], (INNER_RADIUS + OUTER_RADIUS)/1.7, data.games[i].rebounds);	
		drawText(daySectors[i], (INNER_RADIUS + OUTER_RADIUS)/1.8, data.games[i].steals);		
	}
};

var drawTextOnExpandedSector = function(sector){
	var options = {
		strokeStyle : "#3B3B3B",
		font : "23px Arial",
		lineWidth : 2,
		textAligh : "left",
		angle : (sector.startAngle + sector.endAngle)/2
	};

	var i = sectorInfo.selectedIndex - 1;

	drawText(sector, (INNER_RADIUS + OUTER_RADIUS)/1.1, "    Score: " + data.games[i].teamScore, options);
	drawText(sector, (INNER_RADIUS + OUTER_RADIUS)/1.15, "   Opp Score: " + data.games[i].oppositionScore, options);	
	drawText(sector, (INNER_RADIUS + OUTER_RADIUS)/1.20, "  Points: " + data.games[i].pointsScored, options);	
	drawText(sector, (INNER_RADIUS + OUTER_RADIUS)/1.25, "  Minutes: " + data.games[i].minutes, options);

	drawText(sector, (INNER_RADIUS + OUTER_RADIUS)/1.3, "  Assists: " + data.games[i].assists, options);
	drawText(sector, (INNER_RADIUS + OUTER_RADIUS)/1.4, "Rebounds: " + data.games[i].rebounds, options);	
	drawText(sector, (INNER_RADIUS + OUTER_RADIUS)/1.5, "   Steals: " + data.games[i].steals, options);		
};

var drawText = function(sector, distance, text, options){
	var startAngle = sector.startAngle;
	var _angle = startAngle + 0.01;
	var x = origin.x - distance * Math.cos(_angle), 
		y = origin.y - distance * Math.sin(_angle);
	
	var _options = {
		strokeStyle : "#3B3B3B",
		font : TEXT_FONT,
		lineWidth : 2,
		textAlign : "left",
		angle : _angle
	};

	if(options){
		_options = options;
	}

	context.strokeStyle = _options.strokeStyle;
	context.font = _options.font;
	context.textAlign = _options.textAlign;
	context.lineWidth = _options.lineWidth;
	context.save();
	context.translate(x, y);
	context.rotate(-1 * (Math.PI/2 - _options.angle));
	context.strokeText(text, 0, 0);
	context.restore();

	context.lineWidth = 1;
	context.strokeStyle = "blue";
};

var drawPlots = function(){
	var totalPoints = 0;
	var totalAssists = 0;
	var totalRebounds = 0;
	var totalSteals = 0;
	
	for(var i = 0; i < data.games.length; i++){
		totalPoints += data.games[i].pointsScored;
		totalAssists += data.games[i].assists;
		totalRebounds += data.games[i].rebounds;
		totalSteals += data.games[i].steals;
	}
	
	var averagePoints = totalPoints/data.totalGames;
	var averageAssists = totalAssists/data.totalGames;
	var averageRebounds = totalRebounds/data.totalGames;
	var averageSteals = totalSteals/data.totalGames;

	context.save();
	context.beginPath();

	if ($("#pts").is(':checked')) {
		drawPlot("pointsScored", averagePoints, POINTS_PLOT_COLOR);
	}

	if ($("#ast").is(':checked')) {
		drawPlot("assists", averageAssists, ASSISTS_PLOT_COLOR);
	}

	if ($("#rbs").is(':checked')) {
		drawPlot("rebounds", averageRebounds, REBOUNDS_PLOT_COLOR);
	}

	if ($("#stl").is(':checked')) {
		drawPlot("steals", averageSteals, STEALS_PLOT_COLOR);
	}

	context.restore();
};

var drawPlot = function(stat, statAvg, color){
	context.beginPath();
	context.strokeStyle = color;
	context.lineWidth = 3;
	var plotPoints = [];
	var plotDistance;
	for(var i = 0; i < data.games.length; i++){
		plotDistance = (data.games[i][stat]/statAvg) * 100;
		var angle = (sectorInfo.daySectors[i].startAngle + sectorInfo.daySectors[i].endAngle)/2;
		if(i == 0){
			context.moveTo(origin.x - (OUTER_RADIUS + plotDistance) * Math.cos(angle), origin.y - (OUTER_RADIUS + plotDistance) * Math.sin(angle));
		}else{
			context.lineTo(origin.x - (OUTER_RADIUS + plotDistance) * Math.cos(angle), origin.y - (OUTER_RADIUS + plotDistance) * Math.sin(angle));
			context.moveTo(origin.x - (OUTER_RADIUS + plotDistance) * Math.cos(angle), origin.y - (OUTER_RADIUS + plotDistance) * Math.sin(angle));	
		}
	}
	context.stroke();
};

var drawBarGraphs = function(){
	for(var i = 0; i < sectorInfo.daySectors.length; i++){
		context.beginPath();
		var angle = sectorInfo.daySectors[i].startAngle;
		context.moveTo(origin.x - (OUTER_RADIUS + BAR_GRAPH_SEPARATION) * Math.cos(angle), origin.y - (OUTER_RADIUS + BAR_GRAPH_SEPARATION) * Math.sin(angle));
		var dist = data.games[i].teamScore/1.5;
		context.fillStyle = INNER_BAR_COLOR;
		context.lineTo(origin.x - (OUTER_RADIUS + dist + BAR_GRAPH_SEPARATION) * Math.cos(angle), origin.y - (OUTER_RADIUS + BAR_GRAPH_SEPARATION + dist) * Math.sin(angle));
		angle = sectorInfo.daySectors[i].endAngle;
		context.lineTo(origin.x - (OUTER_RADIUS + dist + BAR_GRAPH_SEPARATION) * Math.cos(angle), origin.y - (OUTER_RADIUS + dist + BAR_GRAPH_SEPARATION) * Math.sin(angle));
		context.lineTo(origin.x - (OUTER_RADIUS + BAR_GRAPH_SEPARATION) * Math.cos(angle), origin.y - (OUTER_RADIUS + BAR_GRAPH_SEPARATION) * Math.sin(angle));
		context.stroke();
		context.fill();

		context.beginPath();
		var angle = sectorInfo.daySectors[i].startAngle;
		context.moveTo(origin.x - (OUTER_RADIUS + dist+ BAR_GRAPH_SEPARATION) * Math.cos(angle), origin.y - (OUTER_RADIUS + dist+ BAR_GRAPH_SEPARATION) * Math.sin(angle));
		dist += data.games[i].oppositionScore/1.5;
		context.fillStyle = OUTER_BAR_COLOR;
		context.lineTo(origin.x - (OUTER_RADIUS + dist+ BAR_GRAPH_SEPARATION) * Math.cos(angle), origin.y - (OUTER_RADIUS + dist+ BAR_GRAPH_SEPARATION) * Math.sin(angle));
		angle = sectorInfo.daySectors[i].endAngle;
		context.lineTo(origin.x - (OUTER_RADIUS + dist+ BAR_GRAPH_SEPARATION) * Math.cos(angle), origin.y - (OUTER_RADIUS + dist+ BAR_GRAPH_SEPARATION) * Math.sin(angle));
		dist = dist - data.games[i].oppositionScore/1.5;
		context.lineTo(origin.x - (OUTER_RADIUS + dist+ BAR_GRAPH_SEPARATION) * Math.cos(angle), origin.y - (OUTER_RADIUS + dist+ BAR_GRAPH_SEPARATION) * Math.sin(angle));
		context.stroke();
		context.fill();
	}
};

var expandSelectedSector = function(selectedIndex){
	context.save();
	var selectedSector = sectorInfo._daySectors[selectedIndex - 1];
	context.beginPath();

	context.strokeStyle = EXPANDED_SECTOR_STROKE_COLOR;
	if(data.games[selectedIndex - 1].result === "L"){
		context.fillStyle = EXPANDED_LOSS_SECTOR_COLOR;	
	}else{
		context.fillStyle = EXPANDED_WIN_SECTOR_COLOR;	
	}
	
	context.lineWidth = 4;

	context.moveTo(origin.x - INNER_RADIUS * Math.cos(selectedSector.startAngle), origin.y - INNER_RADIUS * Math.sin(selectedSector.startAngle));
	context.lineTo(origin.x - (OUTER_RADIUS + SELECTED_SECTOR_EXPANSION_LENGTH) * Math.cos(selectedSector.startAngle), origin.y - (OUTER_RADIUS + SELECTED_SECTOR_EXPANSION_LENGTH) * Math.sin(selectedSector.startAngle));

	context.lineTo(origin.x - (OUTER_RADIUS + SELECTED_SECTOR_EXPANSION_LENGTH) * Math.cos(selectedSector.endAngle), origin.y - (OUTER_RADIUS + SELECTED_SECTOR_EXPANSION_LENGTH) * Math.sin(selectedSector.endAngle));
	context.lineTo(origin.x - INNER_RADIUS * Math.cos(selectedSector.endAngle), origin.y - INNER_RADIUS * Math.sin(selectedSector.endAngle));

	context.stroke();
	context.fill();

	/* cover the patch with same color as expanded sector fill color */
	context.beginPath();
	if(data.games[selectedIndex - 1].result === "L"){
		context.strokeStyle = EXPANDED_LOSS_SECTOR_COLOR;	
	}else{
		context.strokeStyle = EXPANDED_WIN_SECTOR_COLOR;	
	}
	context.lineWidth = 16;
	context.arc(origin.x, origin.y, OUTER_RADIUS, Math.PI + selectedSector.startAngle + 0.003, Math.PI + selectedSector.endAngle - 0.003, false);

	context.stroke();
	context.restore();
};

/* --------------- Utility Functions --------------- */

var addEvent = function(obj, eventName, callback)
{
	if(obj.attachEvent){
		obj.attachEvent("on" + eventName, callback);
	}
	else{
		obj.addEventListener(eventName, callback, false);
	}
};

var removeEvent = function(obj, eventName, callback){
	obj.removeEventListener(eventName, callback);	
};

var sendAjaxRequest = function(url, callback, options)
{
	var xhr = new XMLHttpRequest();
	
	options = options || {};
	var method = options.method || "GET"; 
	xhr.open(method, url, true);
	
	var _callback = function()
	{
		if (xhr.readyState==4) {
			callback(xhr.responseXML, xhr.responseText);
		}
	};
	
	addEvent(xhr, "readystatechange", _callback);
	xhr.send(null);
};

/* --------------- Test Functions --------------- */

var test = function(){
	var callback = function(xml, text){
		console.log(text);
	};

	sendAjaxRequest(DATA_URL_BASE + "/Lebron.json", callback);
};

/* --------------- Initialization --------------- */

var onLoadHandler = function(){
	canvas = document.getElementById("arc");
	context = canvas.getContext("2d");
	context.globalAlpha = GLOBAL_ALPHA;

	init();
	getDataFromServer();
	
	/* Wait for 500ms after requesting server for data before processing and using it */
	setTimeout(function(){
		processData();
		draw();
	}, 500);
};

var init = function(){
	DISPLACE_ANGLE_IN_RADIANS = getAngleInRadians(DISPLACE_ANGLE);
	ANGLE_AVAILABLE_IN_RADIANS = getAngleInRadians(180 - 2 * DISPLACE_ANGLE);
	addEvent(canvas, "click", handleClick);

	var seasonSlider = document.getElementById("seasonRange"); 
	addEvent(seasonSlider, "change", showSeasonData);

	var playerSlider = document.getElementById("playerRange"); 
	addEvent(playerSlider, "change", showPlayerData);
};

var clearCanvas = function(){
	context.clearRect(0, 0, canvas.width, canvas.height);
};

var draw = function(){
	clearCanvas();
	drawBoundary(DISPLACE_ANGLE);
	generateSectors();
	drawArcs(DISPLACE_ANGLE);
	
	drawDaySectors(sectorInfo.daySectors);
	drawMonthSectors(sectorInfo.daySectors);
	
	drawTextOnSectors(sectorInfo.daySectors);
	
	drawBarGraphs();
	drawPlots();
};

/* calling the onLoadHandler */
window.onload = function(){
	onLoadHandler();
};