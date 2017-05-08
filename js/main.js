s = Snap("#svg"); //Main canvas
var database = []; //Array with data from csv

// SETTINGS - TIMELINE
var year_init_x = 55; //px
var year_init_y = 580; //px
var year_horizontal_spacing = 96; //px

var underline_dx = -20;//px
var underline_dy = -30; //px
var underline_width = 950; //px
var underline_heigth = 5; //px

var left_edge = -130; //Snap.svg transfrom units (?)
var bottom_edge = 50; //Snap.svg transfrom units (?)

var bar_width = 4; // in n° of people
var bar_spacing = 20; //Snap.svg transfrom units (?)

var f_horizontal_spacing = 3; //Snap.svg transfrom units (?)
var f_vertical_spacing = 6; //Snap.svg transfrom units (?)

// SETTINGS - FEMALE DESCRIPTION TEXT BOX
var f_text_dx = 10; //px
var f_name_dy = 25; //px
var f_lifetime_dy = 45; //px
var f_desc_dy = 65; //px
var fbox_width = 250; //px
var min_height = 85; //px
var height_per_line = 15; //px
var textbox_dx = 10; //px respect the mouse pos

var flip_y = 450; //If mouse_y > than this, the fbox is drawn above the mouse instead of under

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
	"tercero",
	"???"];
var region_types =[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0]; //0 means unknown region

var n_selected_text = {} //text

var graphics_per_year = []; //Array of arrays were each array holds graphics corresponding to a year... not really sure how much I use it though :c
for (i = 0; i < 10; i++) //Where 10 is the number of years covered in the database
	graphics_per_year.push([]);

var relation_graphics = initializeGraphicGroup(relation_types); //Array of arrays where each array hold graphics corresponding to a relation type
var method_graphics = initializeGraphicGroup(method_types); //Idem for methods
var region_graphics = initializeGraphicGroup(region_types); //Idem
var relation_filters = initializeFilterGroup(relation_types); //Array of booleans corresponding whether a filter is selected
var method_filters = initializeFilterGroup(method_types); //Idem
var region_filters = initializeFilterGroup(region_types); //Idem

var button_init_x = 1000; //px
var button_init_y = 100; //px
var button_bar_spacing = 150; //px, horizontal spacing in case it isn't clear
var button_dy = 25; //px
var button_size = 10; //px
var button_text_dx = 20; //px
var button_text_dy = 8; //px

var mouse_x = 0;
var mouse_y = 0;

window.onload = function() {
	$( "#database" ).load( "data/database_main.csv", function() {
		database = Papa.parse($('#database').val()).data;
		initializeFTextBox();
		drawTimeline(); //Timeline has to be drawn after database is parsed
		initializeFilterButtons(); //Filter buttons have to be drawn after the females have been categorized in groups (which is done when they're drawn)
	});
}

function initializeFilterButtons(){
	n_selected_text = s.text(button_init_x, button_init_y - 50, database.length-2);
	n_selected_text.attr({fill:"#FFFFFF", "font-size": "36px", "font-family": "KL"});

	var relation_text = s.text(button_init_x, button_init_y - 10, "RELACIÓN");
	relation_text.attr({fill:"#FFFFFF", "font-family": "KL"});
	for (var i = 0; i < relation_types.length - 1; i++) {
		var checkbox = s.rect(button_init_x, button_init_y + button_dy*i, button_size,button_size);
		checkbox.attr({
    		fill: "#FEFEFE",
    		stroke: "#282828",
    		strokeWidth: 2
    	});
    	//Why not a function? Because I need this by reference... it's not like I change it here though so I could investigate this...
    	checkbox.data("filter_array", relation_filters);
    	checkbox.data("index", i);
    	checkbox.data("enabled", false);
    	checkbox.click(set_filter);
    	var text = s.text(button_init_x+button_text_dx, button_init_y + button_dy*i + button_text_dy, relation_types[i]);
    	text.attr({fill:"#FFFFFF", "font-family": "KL"});
	}

	var method_text = s.text(button_init_x, button_init_y + button_dy*(relation_types.length) - 10, "MÉTODO");
	method_text.attr({fill:"#FFFFFF", "font-family": "KL"});
	for (var i = 0; i < method_types.length - 1; i++) {
		var dy = button_dy*(i+relation_types.length); //This lets us take in account the displacemente from the previous items.
		var checkbox = s.rect(button_init_x, button_init_y + dy, button_size,button_size);
		checkbox.attr({
    		fill: "#FEFEFE",
    		stroke: "#282828",
    		strokeWidth: 2
    	});
    	//Why not a function? Because I need this by reference... it's not like I change it here though so I could investigate this...
    	checkbox.data("filter_array", method_filters); 
    	checkbox.data("index", i);
    	checkbox.data("enabled", false);
    	checkbox.click(set_filter);
    	var text = s.text(button_init_x+button_text_dx, button_init_y + dy + button_text_dy, method_types[i]);
    	text.attr({fill:"#FFFFFF", "font-family": "KL"});
	}

	var region_text = s.text(button_init_x + button_bar_spacing, button_init_y - 10, "REGIÓN");
	region_text.attr({fill:"#FFFFFF", "font-family": "KL"});
	for (var i = 0; i < region_types.length - 1; i++) {
		var checkbox = s.rect(button_init_x + button_bar_spacing, button_init_y + button_dy*i, button_size,button_size);
		checkbox.attr({
    		fill: "#FEFEFE",
    		stroke: "#282828",
    		strokeWidth: 2
    	});
    	//Why not a function? Because I need this by reference... it's not like I change it here though so I could investigate this...
    	checkbox.data("filter_array", region_filters);
    	checkbox.data("index", i);
    	checkbox.data("enabled", false);
    	checkbox.click(set_filter);
    	var text = s.text(button_init_x+button_bar_spacing+button_text_dx, button_init_y + button_dy*i + button_text_dy, regionNToName(region_types[i]));
    	text.attr({fill:"#FFFFFF", "font-family": "KL"});
	}
}

function regionNToName(n){
	if (n == 1) {return "Tarapacá"}
	else if (n == 2) {return "Antofagasta"}
	else if (n == 3) {return "Atacama"}
	else if (n == 4) {return "Coquimbo"}
	else if (n == 5) {return "Valparaíso"}
	else if (n == 6) {return "O'Higgins"}
	else if (n == 7) {return "Maule"}
	else if (n == 8) {return "Biobío"}
	else if (n == 9) {return "Araucanía"}
	else if (n == 10) {return "Los Lagos"}
	else if (n == 11) {return "Aysén"}
	else if (n == 12) {return "Magallanes"}
	else if (n == 13) {return "Metropolitana"}
	else if (n == 14) {return "Los Ríos"}
	else if (n == 15) {return "Arica y Parnacota"}
}

function set_filter(){
	if (this.data("enabled") == false){
		this.attr({fill:"#DB1D6A"});
		this.data("enabled", true);
		this.data("filter_array")[this.data("index")] = true;
	}
	else{
		this.attr({fill:"#FEFEFE"});
		this.data("enabled", false);
		this.data("filter_array")[this.data("index")] = false;
	}

	run_filter();
	redrawTimeline();
}

function redrawTimeline(){
	var selected = 0;
	var opaque_graphics = [];
	var transparent_graphics = [];

	for (i = 0; i < graphics_per_year.length; i++){
		for (j = 0; j < graphics_per_year[i].length; j++){
			if (graphics_per_year[i][j].attr("opacity") == 1){
				opaque_graphics.push(graphics_per_year[i][j]);
				selected++;
			}
			else
				transparent_graphics.push(graphics_per_year[i][j]);
		}
	}

	n_selected_text.attr({text: selected.toString()});
	var years = timelineYearArray();
	for (var i = 0; i < opaque_graphics.length; i++) {
		var year_i = getYearIndex(opaque_graphics[i].data("info")[0]);

		var x = years[year_i][0] + (f_horizontal_spacing*years[year_i][2]);
		var y = years[year_i][1];

		opaque_graphics[i].data("t_x",x);
		opaque_graphics[i].data("t_y",y);
		opaque_graphics[i].transform(createTransform(x, y, 0.05));
		
		years[year_i][2] += 1;
		if (years[year_i][2] == bar_width) {
			years[year_i][1] -= f_vertical_spacing;
			years[year_i][2] = 0;
		}
	}
	for (var i = 0; i < transparent_graphics.length; i++) {
		var year_i = getYearIndex(transparent_graphics[i].data("info")[0]);
		transparent_graphics[i].transform(createTransform(years[year_i][0] + (f_horizontal_spacing*years[year_i][2]), years[year_i][1], 0.05));
		years[year_i][2] += 1;
		if (years[year_i][2] == bar_width) {
			years[year_i][1] -= f_vertical_spacing;
			years[year_i][2] = 0;
		}
	}
}

//I currently check iterate through eveything when I filter. It... sounds unefficiente but it works well.
function run_filter(){
	for (var i = 0; i < graphics_per_year.length; i++)
		for (var j = 0; j < graphics_per_year[i].length; j++)
				graphics_per_year[i][j].attr({opacity: 1});

	// By default we unmark all the "???" when filtering.
	if (filterSelected == true){
		for (var j = 0; j < relation_graphics[relation_graphics.length - 1].length; j++)
			relation_graphics[relation_graphics.length - 1][j].attr({opacity: 0.25});
		for (var j = 0; j < method_graphics[method_graphics.length-1].length; j++)
			method_graphics[method_graphics.length-1][j].attr({opacity: 0.25});
		for (var j = 0; j < region_graphics[region_graphics.length-1].length; j++)
			region_graphics[region_graphics.length-1][j].attr({opacity: 0.25});
	}

	if (hasFilterSelected(relation_filters) == true){
		for (var i = 0; i < relation_filters.length; i++) {
			if (relation_filters[i] == false){
				for (var j = 0; j < relation_graphics[i].length; j++)
					relation_graphics[i][j].attr({opacity: 0.25});
			}
		}
	}
	if (hasFilterSelected(method_filters) == true){
		for (var i = 0; i < method_filters.length; i++) {
			if (method_filters[i] == false){
				for (var j = 0; j < method_graphics[i].length; j++)
					method_graphics[i][j].attr({opacity: 0.25});
			}
		}
	}
	if (hasFilterSelected(region_filters) == true){
		for (var i = 0; i < region_filters.length; i++) {
			if (region_filters[i] == false){
				for (var j = 0; j < region_graphics[i].length; j++)
					region_graphics[i][j].attr({opacity: 0.25});
			}
		}
	}
}

function filterSelected(){
	return hasFilterSelected(relation_filters) || hasFilterSelected(method_filters) || hasFilterSelected(region_filters);
}

function hasFilterSelected(this_array){
	for (var i = 0; i < this_array.length; i++)
		if (this_array[i] == true)
			return true;
	return false;
}

function initializeFTextBox(){
	f_box = s.rect(0, 0, fbox_width, min_height, 10, 10);
	f_name = s.text(f_text_dx, f_name_dy, "test");
	f_name.attr({"font-size": "24px", "font-family": "bebas_book"});
	f_lifetime = s.text(f_text_dx, f_lifetime_dy, "1900-2000");
	f_lifetime.attr({"font-size": "20px", "font-family": "bebas_book"});
	f_desc = s.multitext(f_text_dx, f_desc_dy, "desc", fbox_width, {"font-size": "12px", "font-family": "bebas_book"});
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
	var years = timelineYearArray();

	for (var i = 0; i < years.length; i++) {
		var n_year = 2008 + i;
		year_number = s.text(year_init_x + year_horizontal_spacing*i, year_init_y, n_year.toString());
		year_number.attr({fill:"#FFFFFF", "font-family": "bebas_regular"});
	}

	var underline = s.rect(year_init_x + underline_dx, year_init_y + underline_dy, underline_width, underline_heigth);
	underline.attr({fill: "#DB1D6A"});

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

function timelineYearArray(){
	return [
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

//TO DO- Explain that -1
function initializeFilterGroup(types){
	var return_array = [];
	for (var i = 0; i < types.length-1; i++)
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
		g.data("t_x",x);
		g.data("t_y",y);
		g.data("info",info);
		g.attr({fill:"#EA77A6"});

		g.transform(createTransform(x, y, 0.05));
		g.hover(femaleHoverIn, femaleHoverOut);

		graphics_per_year[getYearIndex(info[0])].push(g)

		relation_graphics[groupIndex(relation_types, info[7])].push(g);
		method_graphics[groupIndex(method_types, info[8])].push(g);
		region_graphics[groupIndex(region_types, info[2])].push(g);
	});
}

//Takes an (x,y) translate and scale s and returns a string in the Snap.svg transfrom format
function createTransform(x, y, s){
	return "T"+x+","+y + " S"+s;
}

function femaleHoverIn(){
	if (this.attr("opacity") == 0.25){return}

	// Need to create this first so I can get the n° of lines.
	f_desc = s.multitext(textbox_dx+mouse_x+f_text_dx, mouse_y+f_desc_dy, this.data("info")[11], fbox_width - f_text_dx, {"text-align":"justify",
	  "font-size": "14px", "font-family": "KL"});

	var y_displacement = 0;
	if (mouse_y > flip_y){ y_displacement = min_height + f_desc.attr("text").length * height_per_line;}

	f_box.attr({x: textbox_dx+mouse_x, y: mouse_y-y_displacement, height: min_height + f_desc.attr("text").length * height_per_line});
	f_name.attr({x: textbox_dx+mouse_x+f_text_dx, y: mouse_y+f_name_dy-y_displacement});
	f_lifetime.attr({x: textbox_dx+mouse_x+f_text_dx, y: mouse_y+f_lifetime_dy-y_displacement});
	f_desc.attr({y: mouse_y+f_desc_dy-y_displacement});

	this.attr({fill:"#D8256E"});
	this.transform(createTransform(this.data("t_x"), this.data("t_y"), 0.06));
	f_name.attr({text: this.data("info")[4]});
	f_lifetime.attr({text: getLifetime(this.data("info"))});
	
	f_text_box.attr({visibility: "visible"});
	f_text_box.appendTo(f_text_box.paper);
	f_desc.appendTo(f_desc.paper);
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
	if (this.attr("opacity") == 0.25){return}

	this.attr({fill:"#EA77A6"});
	this.transform(createTransform(this.data("t_x"), this.data("t_y"), 0.05));
	f_text_box.attr({visibility: "hidden"});
	f_desc.remove();
}