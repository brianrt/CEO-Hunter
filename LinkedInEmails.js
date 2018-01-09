//Responses: 0-2 means 0,1,2 email index is valid
//3 means catch_all is on, so possible all of them
//-1 means no valid email found
function verifyEmails(possibleEmails, sendResponse, hunts_used, total_hunts){
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
				sendResponse({farewell: 3, hunts_used: hunts_used, total_hunts: total_hunts});
			}
  			if(resp.smtp_check && resp.format_valid && resp.score>0.5){
  					//send back 0
  					sendResponse({farewell: 0, hunts_used: hunts_used, total_hunts: total_hunts});
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
						if(resp.smtp_check && resp.format_valid && resp.score>0.5){
			  				//send back 1
			  				sendResponse({farewell: 1, hunts_used: hunts_used, total_hunts: total_hunts});
			  			} else {
			  				// wasn't valid email, try the next one
							email_address = possibleEmails[2];
							var access_key = 'd7294b9f413ac4e844ac4105b73aa91c';
							var url = 'http://apilayer.net/api/check?access_key=' + access_key + '&email=' + email_address+'&catch_all=1';
							var xhr2 = new XMLHttpRequest();
							xhr2.open("GET", url, true);
							xhr2.onreadystatechange = function() {
								if (xhr2.readyState == 4) {
									var resp = JSON.parse(xhr2.responseText);
									if(resp.smtp_check && resp.format_valid && resp.score>0.5){
					  					//send back 2
					  					sendResponse({farewell: 2, hunts_used: hunts_used, total_hunts: total_hunts});
						  			} else {
						  				//send back -1
						  				sendResponse({farewell: -1, hunts_used: hunts_used, total_hunts: total_hunts});
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