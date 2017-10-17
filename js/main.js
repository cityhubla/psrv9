//Function for animating opening page logo and text using slick.js
$("div#menu").ready(function() {
	$("#cover_contents").load("./html/home.html", function(){
		animatelogo();
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;
		// iOS detection from: http://stackoverflow.com/a/9039885/177710
		if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
			$(".apple_warning").show();
			}
	}) 
});

$("div#searchmap_info").ready(function() {
	$("div#searchmap_info").load("./html/searchmap_info.html", function(){})
	$("div#mapresults_list").load("./html/parcelinfo.html");	
	$("div#mapoption").load("./html/uses_legend.html");	
});

var animatelogo = function(){
	$('.logoanimated').slick({
		dots: false,
		fade: true,
		arrows:false,
		infinite: true,
		slidesToShow: 1,
		autoplay: true,
		autoplaySpeed: 2000
	});
}

//Opens the menubar when user clicks on "menu"
$( "#togglenav" ).click(function() {
    if ($('.navlogo').css('display') == 'block'){
        $( '.navlogo' ).hide();   
    }
    $( ".navmenu" ).fadeToggle( "slow", "linear" ); 
});

//When user clicks on menu item, loads content using jQuery fadetoggle
$(".submenu").click(function(){
	$( ".navmenu" ).hide(); 
	var loadhtml = $(this).attr('id'); //Listens for button clicked
	if ( loadhtml == "gotomap" ){ //If user selected map, hides #cover
		$("#cover").fadeOut( "slow", "linear", function() {$("#cover_contents").empty() });
		$( ".navlogo" ).fadeToggle( "slow", "linear" );
	} else if ( loadhtml == "home" ){ //If user selected home, hides activates animation
		$("#cover").fadeIn( "slow", "linear"); //This loads the #cover if user is coming from map
		$("#cover_contents").fadeToggle( "slow", "linear", function(){
			$("#cover_contents").empty().load("./html/home.html", function(){
				$("#cover_contents").fadeToggle( "slow", "linear");
				animatelogo();
			});	
		})
	}
	else { //If user selected an item on the menu, fade loads the page
		$("#cover").fadeIn( "slow", "linear"); //This loads the #cover if user is coming from map
		$("#cover_contents").fadeToggle( "slow", "linear", function(){
			$("#cover_contents").empty().load("./html/"+loadhtml+".html", function(){
				$("#cover_contents").fadeToggle( "slow", "linear");
			});	
		})
	}
})

//Add listener to home page buttons

var loadmap = function(){
	$("#cover").fadeOut( "slow", "linear", function() {$("#cover_contents").empty() });
	$( ".navlogo" ).fadeToggle( "slow", "linear" );
}

var loadabout = function(){
	$("#cover").fadeIn( "slow", "linear"); //This loads the #cover if user is coming from map
	$("#cover_contents").fadeToggle( "slow", "linear", function(){
		$("#cover_contents").empty().load("./html/about.html", function(){
			$("#cover_contents").fadeToggle( "slow", "linear");
		});	
	})
}

var start_maptab = "searchmap"
//Listener to change tabs
$( ".maptab_button" ).click(function() {
    var selectedtab = $(this).attr('id');
	$( ".btn_active").removeClass("btn_active");
	$( this ).addClass("btn_active");
    $( "div#"+start_maptab ).hide(); 
	$( "div#"+selectedtab ).show();
    if($("#correction_form").is(":visible")) {$("#correction_form").hide ();$("#mapresults_list").show();}
	if($("#seemap").hasClass("btn_active")) {$("#map").css("z-index", 7)} else {$("#map").css("z-index", 0)}
	start_maptab=selectedtab;

});

var fillform = function(){
	$("#mapresults_list").hide();
	$("#correction_form").load("./html/correction_form.html");
	$("#correction_form").show("./html/correction_form.html");
}

//Credits and Thanks
console.log("Shout out and much thanks to those who inspired, conspired with the explorations and pursuits I have taken.");
console.log("Thanks to Monika Shankar, Sanna Alas, Jazmine Johnson and the folks at PSR for the opportunity to collaborate on such a fantastic project");
console.log("Thanks to the teams at Mapbox, and QGIS for developing such fantastic tools");
console.log("Thanks to my friends and colleagues at maptimeLA with 1-Ups to Nina Kin, Machiko Yasuda, Jon Schleuss, Bond Harper, Regan Hutson, Andy Rutkowski, Colombene Gorton, Leigh Phan, Rex Feng, Chandler Sterling and Greg Scarich");
console.log("All for LA!!");