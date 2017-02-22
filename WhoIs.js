function WhoIs(){
	console.log("WhoIs");
	var url = "https://www.who.is/whois/"+companyDomain;
	ajax_page(url,whoIsCallBack);
}

function whoIsCallBack(htmlData){
	console.log(htmlData);
	var result = htmlData.getElementsByClassName("col-md-12 queryResponseBodyValue");
	// for (var i = 0; i < result.length;i++){
	// 	console.log(result[i].innerHTML);
	// }
	console.log(result[1].innerHTML);
	var source = result[1].innerHTML;
	var found = source.search("Name");
	console.log(found);
	var nameContainer = source.substring(found+4,found+100);
	console.log(nameContainer);
	if(nameContainer.includes("<") && nameContainer.includes(">")){
		var chopFirstPart = nameContainer.substring(37);
		name = chopFirstPart.substring(0,chopFirstPart.indexOf("<"));
		console.log(name);
		if(!verifyName(name)){
			displayNotFound();
			return;
		}
		listenerCallback({
	        greeting: "ceo",
	        message_ceo: name,
	        message_description: "Chief Executive Officer"
	    });
	}
	else{
		var index = /[a-z]/i.exec(nameContainer).index;
		console.log(index);
		var chopFirstPart = nameContainer.substring(index);
		console.log(chopFirstPart);
		var index2 = chopFirstPart.indexOf("\n");
		var name = chopFirstPart.substring(0,index2);
		console.log(name);
		if(!verifyName(name)){
			displayNotFound();
			return;
		}
		listenerCallback({
	        greeting: "ceo",
	        message_ceo: name,
	        message_description: "Chief Executive Officer"
	    });
	}
}

function verifyName(name){
	name = name.toLowerCase();
	if(name.includes("domain"))
		return false;
	if(name.includes("technologies"))
		return false;
	if(name.includes("host"))
		return false;
	if(name.includes("corporation"))
		return false;
	if(name.includes(companyName))
		return false;
	var test = /^[a-z A-Z]+$/.test(name);
	if(test==false)
		return false;
	return true;
}

