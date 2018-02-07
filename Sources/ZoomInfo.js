function ZoomInfo() {
	//Google search url using the zoominfo custom search engine
    var access_key = 'AIzaSyAiU6yCuGGU3Y06iHvlprmXsMlgVhswdAQ';
    var engine_id = '005408335780428068463:cfom544x5cg';
    var query = companyDomain;
    var url = "https://www.googleapis.com/customsearch/v1?key="+access_key+"&cx="+engine_id+"&q="+query+"&excludeTerms=crunchbase";
    console.log("ZoomInfo google search: "+url);

	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
		  var resp = JSON.parse(xhr.responseText);
		  if(resp.searchInformation.totalResults==0){
	          console.log("ZoomInfo google query no results, trying Crunchbase");
	          CrunchBase();
	          return;
	      }
	      var title = resp.items[0].title;
	      title = title.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
	      title = title.toLowerCase();
	      if(!(title.includes(companyName))){
	      	console.log("wrong zoominfo page");
	      	CrunchBase();
	      	return;
	      }
	      console.log("title: "+title);
		  var result = resp.items[0].link;
		  console.log(result);
		  ajax_page(result,zoomInfoCallBack);
		}
	}
	xhr.send();
}

function zoomInfoCallBack(htmlData){
	console.log(htmlData);
	var peopleContainers = htmlData.getElementsByClassName("similar_profiles_container_list_profileBox");
	if(peopleContainers==undefined || peopleContainers.length==0){
		CrunchBase();
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
		CrunchBase();
		return;
	}
	listenerCallback({
      greeting: "ceo",
      message_ceo: ceo_potential[0],
      message_description: ceo_potential[1]
    });

}