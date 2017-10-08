//Function for animating opening page logo and text using slick.js
$("div#menu").ready(function() {
	$("#cover_contents").load("../html/home.html", function(){
		animatelogo();
	})
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
			$("#cover_contents").empty().load("../html/home.html", function(){
				$("#cover_contents").fadeToggle( "slow", "linear");
				animatelogo();
			});	
		})
	}
	else { //If user selected an item on the menu, fade loads the page
		$("#cover").fadeIn( "slow", "linear"); //This loads the #cover if user is coming from map
		$("#cover_contents").fadeToggle( "slow", "linear", function(){
			$("#cover_contents").empty().load("../html/"+loadhtml+".html", function(){
				$("#cover_contents").fadeToggle( "slow", "linear");			
			});	
		})
	}
})
