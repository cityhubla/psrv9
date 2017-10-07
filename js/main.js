//Function for animating opening page logo and text using slick.js
$(document).ready(function(){
  $('.logoanimated').slick({
        dots: false,
        fade: true,
        arrows:false,
        infinite: true,
        slidesToShow: 1,
        autoplay: true,
        autoplaySpeed: 2000
  });
});

//Activates the menubar
$( "#togglenav" ).click(function() {
    if ($('.navlogo').css('display') == 'block'){
        $( '.navlogo' ).fadeToggle( "fast", "linear" );   
    }
    $( ".navmenu" ).fadeToggle( "slow", "linear" ); 
});

//Shows the map from menubar
$( ".togglecover" ).click(function() {
    $( "#cover" ).fadeToggle( "slow", "linear" );
    $( ".navmenu" ).fadeToggle( "slow", "linear" );
    $( ".navlogo" ).fadeToggle( "slow", "linear" );
});

//Shows the submenus
$( ".submenu" ).click(function() {
    if ($('#cover').css('display') == 'none'){
        $( "#cover" ).fadeToggle( "slow", "linear" );
    }

    $( ".activemenu" ).removeClass( "activemenu" );
    var activatemenu = $(this).attr('id');
    $("div#"+activatemenu).addClass('activemenu');
$("div#resources").load("../html/resources.html");
    $( ".navmenu" ).fadeToggle( "slow", "linear" );
   
    //$("#cover").children("div[id=']").attr("id",activatemenu).css('activemenu');           
});

//Activates the menubar from cover
$( ".toggleabout" ).click(function() {
    if ($('#cover').css('display') == 'none'){
        $( "#cover" ).fadeToggle( "slow", "linear" );
    }

    $( ".activemenu" ).removeClass( "activemenu" );
    var activatemenu = "about";
    $("div#"+activatemenu).addClass('activemenu');
 
});

//Shows the map from cover
$( ".togglemap" ).click(function() {
    $( "#cover" ).fadeToggle( "slow", "linear" );
    $( ".navlogo" ).fadeToggle( "slow", "linear" );
});
