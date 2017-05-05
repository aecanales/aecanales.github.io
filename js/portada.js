s = Snap("#svg"); //Canvas principal de visualización
var database = []; //Arreglo  de arreglos (cada arreglo representa una mujer) con datos del csv.
//OJO que el primer arreglo (database[0]) tiene las cabeceras de las columnas ("Nombre", "Año", etc.)

// SETTINGS - CREACIÓN DE MUJERES
var f_scale = 0.05; //escala relativa a la escala incial
var f_scale_mouseover = 0.06; //Tamaño cuando uno pone el mouse encima de la mujer

var initial_x = -15; //traslación x inicial
var dx = 5; //espacio horizontal entre mujeres
var initial_y = 0; //traslación y inicial
var dy = 0; //espacion vertical entre mujeres

// SETTINGS - CAJA DE TEXTO
var f_width = 200; //px
var f_height = 150; //px

var f_text_dx = 10; //px
var f_name_dy = 20; //px
var f_lifetime_dy = 40; //px

var f_box = {} //rect
var f_name = {} //text
var f_text = {} //text
var f_text_box = {} //group

var mouse_x = 0; //posición horizontal del mouse (px)
var mouse_y = 0; //posición vertical del mouse (px)

window.onload = function() {
	$( "#database" ).load( "data/database.csv", function() {
		database = Papa.parse($('#database').val()).data; //Lee el csv
		initializeFTextBox(); //Crea la caja de texto que será utilizada para mostrar info de la mujer
		
		//Idealmente pon todo tu código que no sea definir funciones o variables acá!
		//EJEMPLO - Creación de 10 mujeres
		for (var i = 1; i < 11; i++) {
			createFemale(initial_x + dx*i, initial_y, database[i])
		}
	});
}

function initializeFTextBox(){
	f_box = s.rect(0, 0, f_width, f_height, 10, 10); //Se crea una caja
	f_name = s.text(f_text_dx, f_name_dy, "test"); //Se crea el texto para el nombre
	f_text = s.text(f_text_dx, f_lifetime_dy, "desc"); //Se crea la descripción
	f_box.attr({ //Le asignamos los atributos a la caja
    	fill: "#F7CDDE", //Color de relleno interno
    	stroke: "#FFFFFF", //Color de borde
    	strokeWidth: 5 //Grosor de borde
    });
	f_text_box = s.group(f_box, f_name, f_text); //Agrupamos la caja, el nombre, y el texto
	f_text_box.attr({visibility: "hidden"}); //Escondemos el grupo para que no se vea hasta que lo necesitemos
	s.mousemove(setMousePos); //Asignamos que se llama la funcion setMousePos cada vez que se mueva el mouse
}

function setMousePos(ev, x, y ){
	mouse_x = x;
	mouse_y = y;
}

function createFemale(x, y, info){
	Snap.load("img/female.svg", function (f) { //Cargo la imagen de la mujer
		var g = f.select("g"); //Seleciono la gráfica
		s.append(f); //Agrego la imagen al canvas
		g.data("orig_t_x",x); //Guardo el x inicial en la gráfica
		g.data("orig_t_y",y); //Guardo el y inicial en la gráfica
		g.data("info",info); //Guardo la info de la mujer (un arreglo) en la gráfica
		g.attr({fill:"#EA77A6"}); //Le cambio el color a la gráfica
		g.transform(createTransfrom(x, y, f_scale)); //Traslado la gráfica segun (x,y) y le asigno la escala
		g.hover(femaleHoverIn, femaleHoverOut); //Determino las funciones a llamar cuando uno pone el mouse encima de la gráfica
	});
}

//Toma una traslación (x,y) y un escalamiento s y retorna un string que puede ser usado por g.transform()
function createTransfrom(x, y, s){
	return "T"+x+","+y + " S"+s; //ej queda como "T10, 10 S0.5"
}

//Función que se llama cuando pongo el mouse encima de una mujer
function femaleHoverIn(){
	//OJO: "this" en este contexto se refiera a la gráfica de la mujer sobre la cual se puso el mouse
	f_box.attr({x: mouse_x, y: mouse_y}); //Muevo la caja a la posición del mouse
	f_name.attr({x: mouse_x+f_text_dx, y: mouse_y+f_name_dy}); // Muevo el nombre relativo al mouse
	f_text.attr({x: mouse_x+f_text_dx, y: mouse_y+f_lifetime_dy}); // Muevo el texto relativo al mouse

	this.attr({fill:"#D8256E"}); //Cambio el color de la mujer
	this.transform(createTransfrom(this.data("orig_t_x"), this.data("orig_t_y"), f_scale_mouseover)); //Le cambio el tamaño a la mujer manteniendo su posición
	f_name.attr({text: this.data("info")[4]}); //Cambio el nombre al nombre de la mujer
	f_text.attr({text: "descripcion"}); //CAMBIAR A DESCRIPCIÓN CORTA
	
	f_text_box.attr({visibility: "visible"}); //Hago que el grupo de la caja de texto sea visible
	f_text_box.appendTo(f_text_box.paper); //Lo reagrego al canvas (f_text_box.paper = s), de esta manera que encina de todos los elementos
}

//Función que se llama cuando saco el mouse de encima de una mujer
function femaleHoverOut(){
	//OJO: "this" en este contexto se refiera a la gráfica de la mujer sobre la cual se sacó el mouse
	this.attr({fill:"#EA77A6"}); //Lo devuelvo a su color original
	this.transform(createTransfrom(this.data("orig_t_x"), this.data("orig_t_y"), f_scale)); //Devuelo a su tamaño original
	f_text_box.attr({visibility: "hidden"}); //Hago que el grupo de la caja de texto sea invisible
}