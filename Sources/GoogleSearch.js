function GoogleSearch(){
	var query = "ceo+"+companyName;
	var access_key = 'AIzaSyAiU6yCuGGU3Y06iHvlprmXsMlgVhswdAQ';
	var engine_id = '005408335780428068463:obi6mjahzr4';
	var url = "https://www.googleapis.com/customsearch/v1?key="+access_key+"&cx="+engine_id+"&q="+query+"&siteSearch=en.wikipedia.org";
	console.log(url);
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var resp = JSON.parse(xhr.responseText);
			if(resp.searchInformation.totalResults==0){
	          console.log("Google search query no results, trying Bloomberg");
	          Bloomberg();
	          return;
	      	}
	      	var title = resp.items[0].snippet; 	
		    title = title.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
		    title = title.toLowerCase();
		    if(!(title.includes(companyName))){
		    	console.log("Google search title doesn't match, trying bloomberg");
		    	Bloomberg();
	          	return;
		    }
			var hcard = resp.items[0].pagemap.hcard;
			console.log(hcard);
			if (hcard!=undefined){
				hcard = hcard[0]
				if(hcard.role!=undefined || hcard.nickname!=undefined){
					console.log("Have a google result");
					var role = "Chielf Executive Officer";
					var ceo  = hcard.fn
					if(hcard.role!=undefined){
						role = hcard.role;
					}

					name = ceo.toLowerCase();
					var words = ["Registration","Private","Admin","Perfect","System","Inc.","Inc","LLC","The","Group","network","services","domain","technologies","host","corporation","surf",companyName,"manage"];
					for(var i = 0; i < words.length; i++){
						var word = words[i].toLowerCase();
						if(name.includes(word)){
							console.log("Ceo name didn't pass filter, trying bloomberg");
							Bloomberg();
							return;
						}
					}
					var test = /^[a-z A-Z]+$/.test(ceo);
					if(test==false){
						console.log("Ceo name didn't pass filter, trying bloomberg");
						Bloomberg();
						return;
					}

					listenerCallback({
						greeting: "ceo",
						message_ceo: ceo,
						message_description: role
					});
				}
				else{
					console.log("Google failed, trying bloomberg");
					Bloomberg();
				}
			}
			else{
				console.log("Google failed, trying bloomberg");
				Bloomberg();
			}
	  	}
	}
	xhr.send();
}