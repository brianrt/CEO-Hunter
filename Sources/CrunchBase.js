function CrunchBase() {
    var query = "http://www.bing.com/search?q=crunchbase.com+"+companyDomain;
    console.log("Crunchbase bing search: "+query);
    ajax_page(query,crunchBaseBingCallBack);
}

function crunchBaseBingCallBack(htmlData){
  	console.log(htmlData);
  	var search_results = htmlData.getElementsByClassName("b_algo");
  	for(var i = 0; i < search_results.length; i++){
	    var title_possibilites = search_results[i].getElementsByTagName("a");
	    for(var j = 0; j < title_possibilites.length; j++){
	    	title = title_possibilites[j].innerHTML;
	    	if(title != ""){
			    title = title.toLowerCase();
			    title = title.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
			    console.log(title);
			    trimmedCompanyName = companyName.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
			    var link = title_possibilites[j].href;
			    if(link.includes("https://www.crunchbase.com/organization/") && title.includes("crunchbase") && title.includes(trimmedCompanyName)){
			      console.log("link: "+link);
			      getRequestHTML(link,crunchBaseCallBack);
			      return;
			    }
	    	}
	    }
  	}
  	//Could not find in bing search
	listenerCallback({
		greeting: "capital_raised",
		message: "-1"
	});
  	LinkedIn();
}

function crunchBaseCallBack(htmlData){
	console.log(htmlData.innerHTML);
	var capitalRaisedCrunch = "-1";
	console.log(htmlData.innerHTML.toLowerCase().includes(companyDomain));
	if(!(htmlData.innerHTML.toLowerCase().includes(companyDomain))){
		//If page is bad, send back N/A for capital raised
		listenerCallback({
	      greeting: "capital_raised",
	      message: capitalRaisedCrunch
	    });

	    //Then call linkedin
		console.log("Wrong cruchbase page, trying LinkedIn");
		LinkedIn();
		return;
	}
	//First, we attempt to get the capital raised
	var capitalResults = htmlData.getElementsByClassName("cb-link component--field-formatter field-type-money ng-star-inserted");
	if(capitalResults[0] != undefined){
		capitalRaisedCrunch = capitalResults[0].innerHTML.trim();
	}
	listenerCallback({
	  greeting: "capital_raised",
	  message: capitalRaisedCrunch
	});
	console.log(capitalRaisedCrunch);

	//Next, get the CEO
	var results = htmlData.getElementsByClassName("flex cb-padding-large-left");
	// console.log(results);
	if(results==undefined){
		console.log("Could not find");
		LinkedIn();
		return;
	}

	names = [];
	descriptions = [];
	for(var i = 0; i < results.length; i++){
		var name_possible = results[i].getElementsByTagName("a")[0];
		var description_possible = results[i].getElementsByTagName("span")[0];
		if(name_possible != undefined && description_possible != undefined){
			var name = name_possible.innerHTML.trim();
			var description = description_possible.innerHTML.trim();
			if(description != "Sponsor"){
				names.push(name);
				descriptions.push(description);
			}
		}
	}
	console.log("names: "+names);
	console.log("descriptions: "+descriptions);

	var ceo_potential = checkNamesWithDesciptions(names,descriptions);
	console.log(ceo_potential);
	if(ceo_potential=="different lengths" || ceo_potential=="no match"){
		console.log("no");
		LinkedIn();
		return;
	}
	listenerCallback({
      greeting: "ceo",
      message_ceo: ceo_potential[0],
      message_description: ceo_potential[1]
    });
}