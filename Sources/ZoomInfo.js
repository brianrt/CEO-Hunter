function ZoomInfo() {
	//Bing search url
    var query = "http://www.bing.com/search?q=zoominfo.com+"+companyDomain;
  	ajax_page(query,zoomInfoBingCallBack);
}

function zoomInfoBingCallBack(htmlData){
  	console.log(htmlData);
    if(htmlData == "Error"){
      ZoomInfoGoogle();
      return;
    }
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
			    console.log(trimmedCompanyName);
			    var link = title_possibilites[j].href;
			    if(link.includes("https://www.zoominfo.com/c/") && title.includes("zoominfo") && title.includes(trimmedCompanyName)){
			      console.log("link: "+link);
			      ajax_page(link,zoomInfoCallBack);
			      return;
			    }
	    	}
	    }
  	}
  	ZoomInfoGoogle();
}

function ZoomInfoGoogle() {
	//Create search url and get request!!!
    var query = "https://www.google.com/search?q=zoominfo.com+" + companyDomain + "&oq=zoominfo.com+" + companyDomain + ""
  	ajax_page(query,zoomInfoGoogleCallBack);
}

function zoomInfoGoogleCallBack(htmlData){
  	console.log(htmlData);
    if(htmlData == "Error"){
      AngelList();
      return;
    }
  	var search_results = htmlData.getElementsByTagName("cite");
  	console.log(search_results);
  	for(var i = 0; i < search_results.length; i++){
	    var link = search_results[i].innerHTML;
	    console.log(link);
	    var trimmedCompanyName = companyName.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
	    console.log(trimmedCompanyName);
	    if(link.includes("https://www.zoominfo.com/c/") && link.includes(trimmedCompanyName)){
	      console.log("chosen link: "+link);
	      ajax_page(link,zoomInfoCallBack);
	      return;
	    }
  	}
  	AngelList();
}

function zoomInfoCallBack(htmlData){
	console.log(htmlData);
	if(htmlData == "Error"){
		AngelList();
		return;
	}
	var peopleContainers = htmlData.getElementsByClassName("similar_profiles_container_list_profileBox");
	if(peopleContainers==undefined || peopleContainers.length==0){
		AngelList();
		return;
	}
	var names = [];
	var descriptions = [];

	for(var j = 0; j < peopleContainers.length;j++){

		// Get name
		var namesContainer = peopleContainers[j].getElementsByClassName("fullName");
		if(namesContainer==undefined || namesContainer.length==0){
			continue;
		}
		var hrefs = namesContainer[0].getElementsByTagName("a");
		if(hrefs==undefined || hrefs.length==0){
			continue;
		}
		var name = hrefs[0].innerHTML;
		names.push(name);

		// Get title
		var titles = peopleContainers[j].getElementsByClassName("title");
		if(titles==undefined || titles.length==0){
			continue;
		}
		var paragraphs = titles[0].getElementsByTagName("p");
		if(paragraphs==undefined || paragraphs.length==0){
			continue;
		}
		var description = paragraphs[0].innerHTML;
		descriptions.push(description);
	}
	console.log(names);
	console.log(descriptions);
	var ceo_potential = checkNamesWithDesciptions(names,descriptions);
	console.log(ceo_potential);
	if(ceo_potential=="different lengths" || ceo_potential=="no match"){
		console.log("no");
		AngelList();
		return;
	}
	listenerCallback({
      greeting: "ceo",
      message_ceo: ceo_potential[0],
      message_description: ceo_potential[1]
    });

}