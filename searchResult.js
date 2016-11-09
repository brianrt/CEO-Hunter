chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
   var ceo = "Not found";
   ceo = search();
   sendResponse({farewell: ceo});
});

function isCEO(description){
   description = description.toLowerCase();
   // console.log(description);
   if(description.includes("ceo"))
      return true;
   else if(description.includes("chief executive officer"))
      return true;
   else if(description.includes("president") && !(description.includes("vice")))
      return true;
   return false;
}

function isOther(description){
   description = description.toLowerCase();
   console.log(description);
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

function search(){
   var results = document.getElementById("results");
   var employees = results.getElementsByTagName("li");
   for(i=0;i<employees.length;i++){
      var e = employees[i];
      if(e.className.includes("people")){
         var name = e.getElementsByClassName("title main-headline")[0].innerHTML;
         var description = e.getElementsByClassName("snippet")[0];
         description = description.getElementsByClassName("title")[0].innerHTML;
         // console.log(description);
         if(isCEO(description)){
            chrome.extension.sendRequest("name"+name);
            chrome.extension.sendRequest("description"+description);
            return name;
         }
      }
   }
   for(i=0;i<employees.length;i++){//This is for if they weren't the CEO, but we want to find other higher ups
      var e = employees[i];
      if(e.className.includes("people")){
         var name = e.getElementsByClassName("title main-headline")[0].innerHTML;
         var description = e.getElementsByClassName("snippet")[0];
         description = description.getElementsByClassName("title")[0].innerHTML;
         // console.log(description);
         if(isOther(description)){
            chrome.extension.sendRequest("name"+name);
            chrome.extension.sendRequest("description"+description);
            return name;
         }
      } 
   }
}



