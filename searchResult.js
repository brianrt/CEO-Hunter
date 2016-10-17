function isCEO(description){
   description = description.toLowerCase();
   if(description.includes("ceo"))
      return true;
   else if(description.includes("chief executive officer"))
      return true;
   else if(description.includes("president") && !(description.includes("vice")))
      return true;
}

function isOther(description){
   description = description.toLowerCase();
   if(description.includes("owner"))
      return true;
   else if(description.includes("founder"))
      return true;
   else if(description.includes("principal"))
      return true;
   else if(description.includes("president"))
      return true;
   return false
}

setTimeout(function(){ 
         				var results = document.getElementById("results");
         				var employees = results.getElementsByTagName("li");
         				for(i=0;i<employees.length;i++){
         					var e = employees[i];
         					if(e.className.includes("people")){
         						var name = e.getElementsByClassName("title main-headline")[0].innerHTML;
         						var description = e.getElementsByClassName("snippet")[0];
         						description = description.getElementsByClassName("title")[0].innerHTML;
         						if(isCEO(description)){
         							chrome.extension.sendRequest("name"+name+"<br>"+description);
         							return;
         						}
         					} 
         				}
                     for(i=0;i<employees.length;i++){//This is for if they weren't the CEO, but we want to find other higher ups
                        var e = employees[i];
                        if(e.className.includes("people")){
                           var name = e.getElementsByClassName("title main-headline")[0].innerHTML;
                           var description = e.getElementsByClassName("snippet")[0];
                           description = description.getElementsByClassName("title")[0].innerHTML;
                           if(isOther(description)){
                              chrome.extension.sendRequest("name"+name+"<br>"+description);
                              return;
                           }
                        } 
                     }
					 }, 000); 




