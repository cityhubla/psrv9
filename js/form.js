//Function to add to form    
var submitgoogle = function () {
	var assessorid = $('#assessorid').html(),
		usename = $('input[name="use_name"]').val(),
		useaddress = $('input[name="use_address"]').val(),
		usetype = $('input[name="usetype"]').val(),
		usedescription = $('textarea[name="use_desc"]').val(),
		username = $('input[name="use_submittedby"]').val(),
		useremail = $('input[name="use_submittedbyemail"]').val(),
	
		post_ain = "entry.793370108",
		post_usename = "entry.2093119813",
		post_useaddress = "entry.852730541",
		post_usetype = "entry.2019327232",
		post_usedescription = "entry.1694087586",
		post_username = "entry.1564249937",
		post_useremail = "entry.1777562084",

		baseURL = 'https://docs.google.com/a/theworks.la/forms/d/e/1FAIpQLScHdYOjYoskFRZYGUXImGbwSmer-hPdi0nBbBmSc0KVvEcKGQ/formResponse?',
		submitRef = '&submit=Submit',
		submitURL = (baseURL +
					 post_ain + "=" + assessorid + "&" +
					 post_usename + "=" + usename + "&" +
					 post_useaddress + "=" + useaddress + "&" +
					 post_usetype + "=" + usetype + "&" +
					 post_usedescription + "=" + usedescription + "&" +
					 post_username + "=" + username + "&" +
					 post_useremail + "=" + useremail + "&" +
					 submitRef);
	$.post(submitURL); //Submitting will trigger a CORS issue, will adjust 
	//$(this)[0].action=submitURL;
	//$('#input-feedback').text('Thank You!');

	$("#correction_form").hide("./html/correction_form.html");
	$("#mapresults_list").show();
};