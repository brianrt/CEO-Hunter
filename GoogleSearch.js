function GoogleSearch(){
	var query = "ceo";
	var access_key = 'AIzaSyBcBsQy0IOp-R2bZOi_hq6omvVVaA1Z1hA';
	var engine_id = '005408335780428068463:obi6mjahzr4';
	var url = "https://www.googleapis.com/customsearch/v1?key="+access_key+"&cx="+engine_id+"&q="+query+"&siteSearch=wikipedia.org&exactTerms="+companyName;
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