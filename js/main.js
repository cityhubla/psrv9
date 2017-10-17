//Function for animating opening page logo and text using slick.js
$("div#menu").ready(function() {
	$("#cover_contents").load("./html/home.html", function(){
		animatelogo();
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
	console.log(selectedtab);
	$( ".btn_active").removeClass("btn_active");
	$( this ).addClass("btn_active");
    $( "div#"+start_maptab ).hide(); 
	$( "div#"+selectedtab ).show();
    if($("#correction_form").is(":visible")) {$("#correction_form").hide ();$("#mapresults_list").show();}
	start_maptab=selectedtab;
	console.log(start_maptab);
});

var fillform = function(){
	$("#mapresults_list").hide();
	$("#correction_form").load("./html/correction_form.html");
	$("#correction_form").show("./html/correction_form.html");
}
