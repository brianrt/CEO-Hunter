function ZoomInfo() {
	//Google search url using the zoominfo custom search engine
    var access_key = 'AIzaSyBcBsQy0IOp-R2bZOi_hq6omvVVaA1Z1hA';
    var engine_id = '005408335780428068463:cfom544x5cg';
    var query = companyDomain + "+Company+profile+zoominfo.com";
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
	var result = htmlData.getElementsByClassName("similar_column");
	if(result==undefined){
		CrunchBase();
		return;
	}
	var names = [];
	var descriptions = [];
	for(var i = 0; i < result.length; i++){
		var divs = result[i].getElementsByTagName("div");
		for(var j = 0; j < divs.length;j++){
			var name = divs[j].getElementsByTagName("a")[0].innerHTML;
			var description = divs[j].getElementsByTagName("span")[0].innerHTML;
			description = description.substring(0,description.length-5);
			names.push(name);
			descriptions.push(description);
		}
	}
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