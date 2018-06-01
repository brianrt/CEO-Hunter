//Responses: 0-2 means 0,1,2 email index is valid
//3 means catch_all is on, so possible all of them
//-1 means no valid email found
function verifyEmails(possibleEmails, sendResponse){
	email_address = possibleEmails[0];
	var access_key = 'd7294b9f413ac4e844ac4105b73aa91c';
	var url = 'http://apilayer.net/api/check?access_key=' + access_key + '&email=' + email_address+'&catch_all=1';
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var resp = JSON.parse(xhr.responseText);

			//Check catch all first
			if(resp.catch_all==true){
				//send back 3
				console.log("catch all");
				sendResponse({farewell: 3});
			}
  			else if(resp.smtp_check && resp.format_valid && resp.score>0.5){
  					//send back 0
  					sendResponse({farewell: 0});
  			} else {
  				// 0 wasn't valid email, try the next one


				var email_address = possibleEmails[1];
				var access_key = 'd7294b9f413ac4e844ac4105b73aa91c';
				var url = 'http://apilayer.net/api/check?access_key=' + access_key + '&email=' + email_address+'&catch_all=1';
				var xhr1 = new XMLHttpRequest();
				xhr1.open("GET", url, true);
				xhr1.onreadystatechange = function() {
					if (xhr1.readyState == 4) {
						var resp = JSON.parse(xhr1.responseText);
						console.log("trying the next one");
						if(resp.smtp_check && resp.format_valid && resp.score>0.5){
			  				//send back 1
			  				sendResponse({farewell: 1});
			  			} else {
			  				sendResponse({farewell: -1});
			  				// wasn't valid email, try the next one
							email_address = possibleEmails[2];
							var access_key = 'd7294b9f413ac4e844ac4105b73aa91c';
							var url = 'http://apilayer.net/api/check?access_key=' + access_key + '&email=' + email_address+'&catch_all=1';
							var xhr2 = new XMLHttpRequest();
							xhr2.open("GET", url, true);
							xhr2.onreadystatechange = function() {
								if (xhr2.readyState == 4) {
									var resp = JSON.parse(xhr2.responseText);
									console.log("trying the last one");
									if(resp.smtp_check && resp.format_valid && resp.score>0.5){
					  					//send back 2
					  					sendResponse({farewell: 2});
						  			} else {
						  				//send back -1
						  				sendResponse({farewell: -1});
						  			}
								}
							}
							xhr2.send();
  						}
					}
				}
				xhr1.send();
  			}
		}
	}
	xhr.send();
}