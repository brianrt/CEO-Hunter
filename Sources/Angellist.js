function AngelList() {
	var url = "https://angel.co/"+companyName
	console.log(url);
	getRequestHTML(url,angelListCallBack);
}

function angelListCallBack(htmlData){
	console.log(htmlData.innerHTML.toLowerCase().includes(companyDomain));
	if(!(htmlData.innerHTML.toLowerCase().includes(companyDomain))){
	    //Then call linkedin
		console.log("Wrong angellist page, trying LinkedIn");
		LinkedIn();
		return;
	}
	names = [];
	descriptions = [];

	var nameResults = htmlData.getElementsByClassName("profile-link");
	for (var i = 0; i < nameResults.length; i++){
		var nameResult = nameResults[i].innerHTML;
		if(nameResult.indexOf("<img") == -1){
			names.push(nameResult);
		}
	}

	var desctiptionResults = htmlData.getElementsByClassName("role_title");
	for (var i = 0; i < desctiptionResults.length; i++){
		descriptions.push(desctiptionResults[i].innerHTML);
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