setTimeout(function(){ 
         				var results = document.getElementById("results");
         				var employees = results.getElementsByTagName("li");
         				for(i=0;i<employees.length;i++){
         					var e = employees[i];
         					if(e.className.includes("people")){
         						var name = e.getElementsByClassName("title main-headline")[0].innerHTML;
         						var description = e.getElementsByClassName("snippet")[0];
         						description = description.getElementsByClassName("title")[0].innerHTML;
         						if(description.toLowerCase().includes("ceo") || (description.toLowerCase().includes("president") && !(description.toLowerCase().includes("vice")))){
         							chrome.extension.sendRequest("name"+name+"<br>"+description);
         							break;
         						}
         						console.log(name);
         						console.log(description);
         					} 
         				}
					 }, 3000); 




