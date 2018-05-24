function AngelList() {
	var url = "https://angel.co/"+companyName
	console.log(url);
	getRequestHTML(url,angelListCallBack);
}

function getMoneyRep(money){
	if((money/1000000000.0) >= 1.0){
		return (money/1000000000.0).toString() + "B";
	} else if((money/1000000.0) >= 1.0){
		return (money/1000000.0).toString() + "M";
	} else if((money/1000.0) >= 1.0){
		return (money/1000.0).toString() + "K";
	} else {
		return "$"+money.toString();
	}
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

	// Find Capital Raised
	var capitalRaisedAngel = 0.0;
	var capitals = htmlData.getElementsByClassName("raised");
	for (var i = 0; i < capitals.length; i++){
		var capital = capitals[i];
		if(capital.className.indexOf("unknown") == -1){
			var links = capital.getElementsByTagName("a");
			var amount = 0.0;
			if(links.length == 0){
				amount = parseFloat(capital.innerHTML.replace(/\D/g,''));
			} else {
				amount = parseFloat(links[0].innerHTML.replace(/\D/g,''));
			}
			capitalRaisedAngel += amount;
		}
	}
	//We don't use the capital Raised for now

	//Then find CEO
	var roles = htmlData.getElementsByClassName("role");
	for (var i = 0; i < roles.length; i++){
		var role = roles[i];
		if(role.localName == "li" && role.innerHTML.indexOf("startup-link") == -1){
			descriptions.push(role.getElementsByClassName("role_title")[0].innerHTML);
			names.push(role.getElementsByClassName("profile-link")[1].innerHTML);
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