s = Snap("#svg");
var database = [];
var f_box = s.rect(0, 0, 200, 300, 10, 10);
var f_name = s.text(10, 20, "test");
var f_lifetime = s.text(10, 40, "1900-2000");
var f_desc = s.text(10, 60, "Lorem Ipsum");
f_box.attr({
    fill: "#F7CDDE",
    stroke: "#FFFFFF",
    strokeWidth: 5
});

var f_text_box = s.group(f_box, f_name, f_lifetime, f_desc);
f_text_box.attr({visibility: "hidden"});

function moveFunc(ev, x, y ){
	f_box.attr({x: x, y: y});
	f_name.attr({x: x+10, y: y+20});
	f_lifetime.attr({x: x+10, y: y+40});
	f_desc.attr({x: x+10, y: y+60});	
}
s.mousemove(moveFunc);

window.onload = function() {

	var left_edge = -130;
	var bottom_edge = 50;

	var bar_width = 4; // in n° of people
	var bar_spacing = 20;

	var f_horizontal_spacing = 3;
	var f_vertical_spacing = 6;

	// format [starting x, cur y, width counter] If there was some smarter way to define this that'd be cool...
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
	
	$( "#database" ).load( "data/database.csv", function() {
		database = Papa.parse($('#database').val()).data;
		//Code has to go here to make sure the database has downloaded
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

	});
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
	else {return year}
}

function createFemale(x, y, info){
	Snap.load("img/female.svg", function (f) { 
		var g = f.select("g");
		s.append(f);
		g.data("orig_t_x",x);
		g.data("orig_t_y",y);
		g.data("info",info);
		g.attr({fill:"#EA77A6"});
		g.transform(createTransfrom(x, y, 0.05));
		g.hover(femaleHoverIn, femaleHoverOut);
	});
}

function createTransfrom(x, y, s){
	return "T"+x+","+y + " S"+s;
}

function femaleHoverIn(){
	this.attr({fill:"#D8256E"});
	this.transform(createTransfrom(this.data("orig_t_x"), this.data("orig_t_y"), 0.06));

	f_name.attr({text: this.data("info")[4]});
	f_lifetime.attr({text: getLifetime(this.data("info"))});
	f_desc.attr({text: this.data("info")[11]});
	f_text_box.attr({visibility: "visible"});
	f_text_box.appendTo(f_text_box.paper);
}

function femaleHoverOut(){
	this.attr({fill:"#EA77A6"});
	this.transform(createTransfrom(this.data("orig_t_x"), this.data("orig_t_y"), 0.05));
	f_text_box.attr({visibility: "hidden"});
}

function getLifetime(f_data){
	death = parseInt(f_data[0]);
	age = parseInt(f_data[5]);
	return (death - age) + "-" + death
}