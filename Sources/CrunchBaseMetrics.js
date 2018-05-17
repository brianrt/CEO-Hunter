function CrunchBaseMetrics() {
    var query = "http://www.bing.com/search?q=crunchbase.com+"+companyDomain;
    console.log("Crunchbase bing search: "+query);
    ajax_page(query,crunchBaseBingCallBackMetrics);
}

function crunchBaseBingCallBackMetrics(htmlData){
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
			      getRequestHTML(link,crunchBaseCallBackMetrics);
			      return;
			    }
	    	}
	    }
  	}
  	//If we've reached the end of the loop, there are no bing results
  	var capitalRaised = "-1";
  	listenerCallback({
	  greeting: "capital_raised_final",
	  message: capitalRaised
	});
}

function crunchBaseCallBackMetrics(htmlDataMetrics){
	console.log(htmlDataMetrics.innerHTML);
	var capitalRaised = "-1";
	console.log(htmlDataMetrics.innerHTML.toLowerCase().includes(companyDomain));
	if(!(htmlDataMetrics.innerHTML.toLowerCase().includes(companyDomain))){
		listenerCallback({
	      greeting: "capital_raised_final",
	      message: capitalRaised
	    });
	} else {
		//First, we attempt to get the capital raised
		var capitalResults = htmlDataMetrics.getElementsByClassName("cb-link component--field-formatter field-type-money ng-star-inserted");
		if(capitalResults[0] != undefined){
			capitalRaised = capitalResults[0].innerHTML.trim();
		}
		console.log(capitalRaised);
		listenerCallback({
		  greeting: "capital_raised_final",
		  message: capitalRaised
		});
	}
}