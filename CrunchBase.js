        function CrunchBase() {
	//Google search url using the bloomberg custom search engine
    var access_key = 'AIzaSyBcBsQy0IOp-R2bZOi_hq6omvVVaA1Z1hA';
    var engine_id = '005408335780428068463:obi6mjahzr4';
    var query = "crunchbase+" + companyDomain;
    var url = "https://www.googleapis.com/customsearch/v1?key="+access_key+"&cx="+engine_id+"&q="+query;
    console.log("Crunchbase google search: "+url);

	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
		  var resp = JSON.parse(xhr.responseText);
		  if(resp.searchInformation.totalResults==0){
	          console.log("Crunchbase google query failed, trying linkedin");
	          LinkedIn();
	          return;
	      }
	      var title = resp.items[0].title;
	      title = title.toLowerCase();
	      console.log("title: "+title);

	      if(title=="crunchbase | crunchbase"){
	      	console.log("Crunchbase: google result is just crunchbase");
	      	LinkedIn();
	      	return;
	      }
		  var result = resp.items[0].link;
		  console.log(result);
		  ajax_page(result,crunchBaseCallBack);
		}
	}
	xhr.send();
}

function crunchBaseCallBack(htmlData){
	console.log("crunbase data:");
	// console.log(htmlData.innerHTML);
	console.log(companyDomain);
	console.log(htmlData.innerHTML.includes(companyDomain));
	if(!(htmlData.innerHTML.includes(companyDomain))){
		console.log("Wrong cruchbase page, trying LinkedIn");
		LinkedIn();
		return;
	}
	var results = htmlData.getElementsByClassName("base info-tab people")[0];
	if(results==undefined){
		//next function
		console.log("Could not find");
		LinkedIn();
		return;
	}
	var list = results.getElementsByTagName("li");
	var names = [];
	var descriptions = [];
	for(var i = 0; i < list.length; i++){
		var info = list[i];
		var name = info.getElementsByTagName("a")[0].getAttribute("title");
		var description = info.getElementsByTagName("h5")[0].innerHTML;
		names.push(name);
		descriptions.push(description);
		console.log("name: "+name);
		console.log("description: "+description);
	}
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