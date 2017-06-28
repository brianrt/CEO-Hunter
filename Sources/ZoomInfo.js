function ZoomInfo() {
	//Google search url using the zoominfo custom search engine
    var access_key = 'AIzaSyAiU6yCuGGU3Y06iHvlprmXsMlgVhswdAQ';
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
	var columns = htmlData.getElementsByClassName("contacts");
	if(columns==undefined || columns.length==0){
		CrunchBase();
		return;
	}
	var names = [];
	var descriptions = [];
	var column = columns[0];
	//There are two columns
	var hrefs = column.getElementsByTagName("a");
	var paragraphs = column.getElementsByTagName("p");
	for(var i = 0; i < hrefs.length; i++){
		var name = hrefs[i].innerHTML;
		names.push(name);
	}
	for(var j = 0; j < paragraphs.length;j++){
		var description = paragraphs[j].innerHTML;
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