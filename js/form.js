//Function to add to form    
var submitgoogle = function(){
        //var inputq1 = encodeURIComponent($('#input-q1').val());
		console.log("working")
		var selectedapn = "test from map";
		var inputq2 = "2nd test from map";
        //var inputq2 = encodeURIComponent($('#input-q2').val());
        var q1ID = "entry.793370108";//Assesor's Parcel Number
        var q2ID = "entry.2093119813";//Address
        var baseURL = 'https://docs.google.com/a/theworks.la/forms/d/e/1FAIpQLScHdYOjYoskFRZYGUXImGbwSmer-hPdi0nBbBmSc0KVvEcKGQ/formResponse?';
        var submitRef = '&submit=Submit';
        var submitURL = (baseURL + q1ID + "=" + selectedapn + "&" + q2ID + "=" + inputq2 + submitRef);
        console.log(submitURL);
		$.post(submitURL);
        //$(this)[0].action=submitURL;
        //$('#input-feedback').text('Thank You!');

		$("#correction_form").hide("./html/correction_form.html");
		$("#mapresults_list").show();
    };