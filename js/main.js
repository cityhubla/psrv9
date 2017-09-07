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

$( "#togglenav" ).click(function() {
    $( ".navmenu" ).fadeToggle( "slow", "linear" );
 
});

$( ".togglecover" ).click(function() {
    $( "#cover" ).fadeToggle( "slow", "linear" );
    $( ".navmenu" ).fadeToggle( "slow", "linear" );
});

$( ".submenu" ).click(function() {
    if ($('#cover').css('display') == 'none'){
        $( "#cover" ).fadeToggle( "slow", "linear" );
    }

    $( ".activemenu" ).removeClass( "activemenu" );
    var activatemenu = $(this).attr('id');
    $("div#"+activatemenu).addClass('activemenu');
    $( ".navmenu" ).fadeToggle( "slow", "linear" );
   
    //$("#cover").children("div[id=']").attr("id",activatemenu).css('activemenu');           
});

$( ".toggleabout" ).click(function() {
    if ($('#cover').css('display') == 'none'){
        $( "#cover" ).fadeToggle( "slow", "linear" );
    }

    $( ".activemenu" ).removeClass( "activemenu" );
    var activatemenu = "about";
    $("div#"+activatemenu).addClass('activemenu');
 
});

$( ".togglemap" ).click(function() {
    $( "#cover" ).fadeToggle( "slow", "linear" );
});
