//Function to add to form    
var submitgoogle = function(){
	var assessorid = $('#assessorid').html();
	console.log(assessorid);
	var usename = $('input[name="use_name"]').val();
	var useaddress = $('input[name="use_address"]').val();
	var usetype = $('input[name="usetype"]').val();
	var usedescription = $('textarea[name="use_desc"]').val();
	var username = $('input[name="use_submittedby"]').val();
	var useremail = $('input[name="use_submittedbyemail"]').val();
	
	var post_ain = "entry.793370108";
	var post_usename = "entry.2093119813";
	var post_useaddress = "entry.852730541"
	var post_usetype = "entry.2019327232"
	var post_usedescription = "entry.1694087586"
	var post_username = "entry.1564249937"
	var post_useremail = "entry.1777562084"

	var baseURL = 'https://docs.google.com/a/theworks.la/forms/d/e/1FAIpQLScHdYOjYoskFRZYGUXImGbwSmer-hPdi0nBbBmSc0KVvEcKGQ/formResponse?';
	var submitRef = '&submit=Submit';
	var submitURL = (baseURL + 
					 post_ain + "=" + assessorid + "&" + 
					 post_usename + "=" + usename + "&" +
					 post_useaddress + "=" + useaddress + "&" +
					 post_usetype + "=" + usetype + "&" +
					 post_usedescription + "=" + usedescription + "&" +
					 post_username + "=" + username + "&" +
					 post_useremail + "=" + useremail + "&" +
					 + submitRef);
	$.post(submitURL); //Submitting will trigger a CORS issue, will adjust 
	//$(this)[0].action=submitURL;
	//$('#input-feedback').text('Thank You!');

	$("#correction_form").hide("./html/correction_form.html");
	$("#mapresults_list").show();
    };