setTimeout(function(){
	if(document.getElementById("emailCEO") != undefined){
		return;
	}
	var templateHTML = '<h1 id=mainHeader>Deal Hunter (BETA)</h1><br><br><button id="closeHunter">✖</button><p id="hunterName">Loading...</p><br><p id="hunterEmail">Loading...</p><br><p id="hunterVerified">Loading...</p>';
	window.scrollTo(0,500);
	var button = document.createElement('button');
	button.innerHTML = "Find Email";
	button.id = "emailCEO";
	button.addEventListener("click",function(){
		var popUp = document.createElement('div');
		popUp.id = "hunterPopUp";
		popUp.innerHTML = templateHTML;
		document.body.appendChild(popUp);

		//Close extension when link has been clicked
		var links = document.querySelectorAll("a,input"); 
		for(var i=0; i<links.length; i++){
			links[i].onclick = function(){
				try{
					document.body.removeChild(popUp);
				} catch(err){
					console.log("already removed");
				}
			}
		}

		//Add functionality to close button
		var closeButton = document.getElementById("closeHunter");
		closeButton.addEventListener("click",function(){
			document.body.removeChild(popUp);
		});

		//Scrape name
		var name = document.getElementsByClassName("pv-top-card-section__name")[0].innerHTML;
		document.getElementById("hunterName").innerHTML = name;

		//Scrape most recent position, get the Linkedin Company URL
		var experienceSection = document.getElementsByClassName("experience-section")[0];
		var mostRecentPosition;
		try{
			mostRecentPosition = experienceSection.getElementsByTagName("li")[0];
		} catch(err){
			console.log("Error: "+err);
			updateResults("Email not found","",5);
			return;
		}
		var linkedInCompanyURL = mostRecentPosition.getElementsByTagName("a")[0].href;
		console.log(linkedInCompanyURL);

		// Tells us whether the link is just a search for the company
		var isSearchLink = false;
		if(linkedInCompanyURL.includes("search")){
			isSearchLink = true;
			var companySearchURL = linkedInCompanyURL.replace("index","companies");
			var companyName = decodeURIComponent(companySearchURL.substring(companySearchURL.indexOf("=")+1)).trim().replace(/ /g,'').toLowerCase();
			console.log(companyName);
			// companySearchURL = "https://www.linkedin.com/search/results/companies/?keywords=Amazon";
			console.log(companySearchURL);
			ajax_page(companySearchURL,function(data){
				console.log(data.innerHTML);
				var dataText = data.innerHTML;



				var startIndex = dataText.indexOf('"included":[{"$deletedFields');
				var prunedData = dataText.substring(startIndex);
				var endIndex = prunedData.indexOf("}]}");
				var jsonText = prunedData.substring(11,endIndex+2);
				try{
					var jsonObject = JSON.parse(jsonText);
					var found = false;
					for (var key in jsonObject) {
						var element = jsonObject[key];
						var name = element.name;
						if(name != undefined){
							name = name.trim().replace(/ /g,'').toLowerCase();
							// console.log(name);
							if(name.includes(companyName)){
								found = true;
								var companyIdLink = element.objectUrn;
								var companyID = companyIdLink.substring(companyIdLink.indexOf("company:")+8);
								var linkedInCompanyURL = "https://www.linkedin.com/company/"+companyID;
								ajax_page(linkedInCompanyURL,generateEmails);
								break;
							}
						}
					}
					if(!found){
						updateResults("Email not found","",5);
			    		return;
					}
				} catch(err){
					console.log("Error: "+err);
					updateResults("Email not found","",5);
		    		return;
				}
			});
		}
		else{
			ajax_page(linkedInCompanyURL,generateEmails);
		}

		function ajax_page(query,callback){
			$.ajax(
				{ 
					url: query,
					success: function(data) {
						var d = document.createElement('div');
						d.innerHTML = data;
						callback(d);
					}
				}
			);
		}

		function generateEmails(data){

			var companyURL = "";
			if(isSearchLink){
				console.log(data);
			}


			//Find company URL
			var dataHTML = data.innerHTML;
			var startIndex = dataHTML.indexOf('companyPageUrl":"');
			var prunedData = dataHTML.substring(startIndex);
			var endIndex = prunedData.indexOf('","');
			var companyURL = prunedData.substring(17,endIndex);
			// console.log(companyURL);

			//Get company domain
	    	var companyDomain = extractDomain(companyURL);
		    console.log(companyDomain);
		    if(companyDomain == "Not found"){
		    	updateResults("Email not found","",5);
		    	return;
		    }

		    //Fetch name again
		    var name = document.getElementsByClassName("pv-top-card-section__name")[0].innerHTML;

			//Generate emails
			var possibleEmails = [];
			var tokens = name.toLowerCase().split(" ");
			var name = {first:tokens[0],last:tokens[tokens.length-1]}
			possibleEmails.push(name.first+"@"+companyDomain);
			possibleEmails.push(name.first.charAt(0)+name.last.toLowerCase()+"@"+companyDomain);
			possibleEmails.push(name.first+"."+name.last.toLowerCase()+"@"+companyDomain);
			console.log(possibleEmails);

			chrome.runtime.sendMessage({
				greeting: "emails",
				message: possibleEmails
			}, function(response){
				console.log(response);
				switch(response.farewell){
					case -1:
						updateResults(possibleEmails[0],"Not Likely",0);
						break;
					case 0:
						updateResults(possibleEmails[0],"Verified",1);
						break;
					case 1:
						updateResults(possibleEmails[1],"Verified",2);
						break;
					case 2:
						updateResults(possibleEmails[2],"Verified",3);
						break;
					case 3:
						updateResults(possibleEmails[0]+"<br>"+possibleEmails[1]+"<br>"+possibleEmails[2],"Risky",4);
						break;
				}
			});
		}

		function extractDomain(url){
			if(url.length > 100){
				return "Not found";
			}
			if(url.includes("www.")){
		      url = url.substring(url.indexOf("www.")+4,url.length);
		    }
		    if(url.includes("://")){
		        url = url.substring(url.indexOf("://")+3,url.length);
		    }
		    if(url.slice(-1) == "/"){
		    	url = url.substring(0,url.length-1);
		    }
		    parts = url.split(".")
		    return parts[parts.length-2]+"."+parts[parts.length-1];
		}


		function updateResults(email,verified,color_index){
			var colors = ["red","green","green","green","#cccc00","black"];
			document.getElementById("hunterEmail").innerHTML = email;
			document.getElementById("hunterVerified").innerHTML = verified;
			document.getElementById("hunterVerified").style.color = colors[color_index];
			if(color_index==5){
				document.getElementById("hunterPopUp").style.height = "150px";
			}
			else if(color_index==4){
				document.getElementById("hunterPopUp").style.height = "250px";
			}
		}

	});
	var element = document.getElementsByClassName("pv-top-card-section__actions")[1];
	element.appendChild(button);
},1000);	



