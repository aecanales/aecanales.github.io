s = Snap("#svg"); //Main canvas
var database = []; //Array with data from csv

// SETTINGS - TIMELINE
var left_edge = -130; //Snap.svg transfrom units (?)
var bottom_edge = 50; //Snap.svg transfrom units (?)

var bar_width = 4; // in n° of people
var bar_spacing = 20; //Snap.svg transfrom units (?)

var f_horizontal_spacing = 3; //Snap.svg transfrom units (?)
var f_vertical_spacing = 6; //Snap.svg transfrom units (?)

// SETTINGS - FEMALE DESCRIPTION TEXT BOX
var f_text_dx = 10; //px
var f_name_dy = 20; //px
var f_lifetime_dy = 40; //px
var f_desc_dy = 60; //px

var f_box = {} //rect
var f_name = {} //text
var f_lifetime = {} //text
var f_desc = {} //multitext (view plugins)
var f_text_box = {} //group

// SETTINGS - FILTERS
var method_types = 
	["degollada",
	"baleada",
	"apunalada",
	"estrangulada",
	"golpeada",
	"quemada",
	"asfixiada",
	"otro",
	"???"];
var relation_types =
	["ex-pareja",
	"ex-esposo",
	"esposo",
	"pareja",
	"familiar",
	"conviviente",
	"ex-conviviente",
	"familiar",
	"tercero",
	"???"];

var relation_graphics = initializeGraphicGroup(relation_types); //Array of arrays where each array hold graphics corresponding to a relation type
var method_graphics = initializeGraphicGroup(method_types); //Idem for methods

var relations = []; //Array of groups where each group represents a relation type 
var methods = []; //Idem for methods

var mouse_x = 0;
var mouse_y = 0;

window.onload = function() {
	$( "#database" ).load( "data/database_main.csv", function() {
		database = Papa.parse($('#database').val()).data;
		initializeFTextBox();
		drawTimeline(); //Timeline has to be drawn here to make sure the database has already been parsed

		for (var i = 0; i < relation_types.length; i++) {
			relations.push(s.group(relation_graphics[i]));
		}
		for (var i = 0; i < method_types.length; i++) {
			methods.push(s.group(method_graphics[i]));
		}
	});
}

function initializeFTextBox(){
	f_box = s.rect(0, 0, 200, 300, 10, 10);
	f_name = s.text(f_text_dx, f_name_dy, "test");
	f_lifetime = s.text(f_text_dx, f_lifetime_dy, "1900-2000");
	f_desc = s.multitext(f_text_dx, f_desc_dy, "desc", 180, { "font-size": "12px" });
	f_box.attr({
    	fill: "#F7CDDE",
    	stroke: "#FFFFFF",
    	strokeWidth: 5
    });
	f_text_box = s.group(f_box, f_name, f_lifetime, f_desc);
	f_text_box.attr({visibility: "hidden"});
	s.mousemove(fTextBoxFollowMouse);
}

function fTextBoxFollowMouse(ev, x, y ){
	mouse_x = x;
	mouse_y = y;
}

//TO DO - Comment how this code works
function drawTimeline(){
	// format: [starting x, cur y, width counter] If there was some smarter way to define this that'd be cool...
	var years = [
		[left_edge+bar_spacing*0, bottom_edge, 0], /*0 2008*/
		[left_edge+bar_spacing*1, bottom_edge, 0], /*1 2009*/
		[left_edge+bar_spacing*2, bottom_edge, 0], /*2 2010*/
		[left_edge+bar_spacing*3, bottom_edge, 0], /*3 2011*/
		[left_edge+bar_spacing*4, bottom_edge, 0], /*4 2012*/
		[left_edge+bar_spacing*5, bottom_edge, 0], /*5 2013*/
		[left_edge+bar_spacing*6, bottom_edge, 0], /*6 2014*/
		[left_edge+bar_spacing*7, bottom_edge, 0], /*7 2015*/
		[left_edge+bar_spacing*8, bottom_edge, 0], /*8 2016*/
		[left_edge+bar_spacing*9, bottom_edge, 0]  /*9 2017*/
	];
	

	for (var i = 1; i < database.length; i++) {
		if (database[i][0] == "") {continue;}
		var year_i = getYearIndex(database[i][0]);
		createFemale(years[year_i][0] + (f_horizontal_spacing*years[year_i][2]), years[year_i][1], database[i]);
		years[year_i][2] += 1;
		if (years[year_i][2] == bar_width) {
			years[year_i][1] -= f_vertical_spacing;
			years[year_i][2] = 0;
		}
	}
}

function getYearIndex(year){
	if (year == "2008") {return 0}
	else if (year == "2009") {return 1}
	else if (year == "2010") {return 2}
	else if (year == "2011") {return 3}
	else if (year == "2012") {return 4}
	else if (year == "2013") {return 5}
	else if (year == "2014") {return 6}
	else if (year == "2015") {return 7}
	else if (year == "2016") {return 8}
	else if (year == "2017") {return 9}
	else {return year} //TO DO - Check the database entries with no year!
}

function initializeGraphicGroup(types){
	var return_array = [];
	for (var i = 0; i < types.length; i++)
		return_array.push([]);
	return return_array;
}

function groupIndex(types_array, type){
	for (var i = 0; i < types_array.length; i++) {
		if (types_array[i] == type) {return i}
	}
	console.log("Unknown type: " + type);
	return 0;
}

function createFemale(x, y, info){
	Snap.load("img/female.svg", function (f) { 
		var g = f.select("g");
		s.append(f);
		g.data("orig_t_x",x);
		g.data("orig_t_y",y);
		g.data("info",info);
		g.attr({fill:"#EA77A6"});
		//Function that takes info as a param and returns the index of the array the woman graphic needs to be added t
		g.transform(createTransfrom(x, y, 0.05));
		g.hover(femaleHoverIn, femaleHoverOut);

		relation_graphics[groupIndex(relation_types, info[7])].push(g)
		method_graphics[groupIndex(method_types, info[8])].push(g)
	});
}

//Takes an (x,y) translate and scale s and returns a string in the Snap.svg transfrom format
function createTransfrom(x, y, s){
	return "T"+x+","+y + " S"+s;
}

function femaleHoverIn(){

	f_box.attr({x: mouse_x, y: mouse_y});
	f_name.attr({x: mouse_x+f_text_dx, y: mouse_y+f_name_dy});
	f_lifetime.attr({x: mouse_x+f_text_dx, y: mouse_y+f_lifetime_dy});

	this.attr({fill:"#D8256E"});
	this.transform(createTransfrom(this.data("orig_t_x"), this.data("orig_t_y"), 0.06));
	f_name.attr({text: this.data("info")[4]});
	f_lifetime.attr({text: getLifetime(this.data("info"))});
	
	f_text_box.attr({visibility: "visible"});
	f_text_box.appendTo(f_text_box.paper);
	f_desc = s.multitext(mouse_x+f_text_dx, mouse_y+f_desc_dy, this.data("info")[11], 180, { "font-size": "12px" });
}

function getLifetime(f_data){
	if (f_data[5] == ""){ return "????-"+death}
	else {
		death = parseInt(f_data[0]);
		age = parseInt(f_data[5]);
		return (death - age) + "-" + death
	}
}

function femaleHoverOut(){
	this.attr({fill:"#EA77A6"});
	this.transform(createTransfrom(this.data("orig_t_x"), this.data("orig_t_y"), 0.05));
	f_text_box.attr({visibility: "hidden"});
	f_desc.remove();
}