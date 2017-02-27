function firstPass(description){
   description = description.toLowerCase();
   if(description.includes("ceo"))
      return true;
   else if(description.includes("chief executive officer"))
      return true;
   else if(description.includes("president") && !(description.includes("vice")))
      return true;
   return false;
}

function secondPass(description){
   description = description.toLowerCase();
   if(description.includes("owner"))
      return true;
   else if(description.includes("founder"))
      return true;
   else if(description.includes("principal"))
      return true;
   else if(description.includes("partner"))
      return true;
   return false
}

function search(){
   console.log("in search");
   try{
      var results = document.getElementById("results");
      var employees = results.getElementsByTagName("li");
      for(i=0;i<employees.length;i++){
         var e = employees[i];
         if(e.className.includes("people")){
            var name = e.getElementsByClassName("title main-headline")[0].innerHTML;
            var description = e.getElementsByClassName("snippet")[0];
            description = description.getElementsByClassName("title")[0].innerHTML;
            if(firstPass(description) && name!="LinkedIn Member"){
               chrome.runtime.sendMessage({
                  greeting: "ceo",
                  message_ceo: result[0],
                  message_description: result[1]
               });
               window.close();
            }
         }
      }
      for(i=0;i<employees.length;i++){//This is for if they weren't the CEO, but we want to find other higher ups
         var e = employees[i];
         if(e.className.includes("people")){
            var name = e.getElementsByClassName("title main-headline")[0].innerHTML;
            var description = e.getElementsByClassName("snippet")[0];
            description = description.getElementsByClassName("title")[0].innerHTML;
            if(secondPass(description) && name!="LinkedIn Member"){
               chrome.runtime.sendMessage({
                  greeting: "ceo",
                  message_ceo: result[0],
                  message_description: result[1]
               });
               window.close();
            }
         } 
      }
   }
   catch(err){
      console.log("there was an error: "+err.message);

      try{
         //Trying agian
         //Changed to search for current position, then title if they don't have a current position
         var i = 0;
         setTimeout(function(){
            var results = document.getElementsByClassName("search-result--person");
            console.log("results: "+results);
            console.log("num results: "+results.length);
            for(i=0;i<results.length;i++){
               var description = "";
               try{
                  description = results[i].getElementsByClassName("search-result__snippets")[0].innerHTML.substring(9);
               }catch(error){
                  description = results[i].getElementsByClassName("search-result__truncate")[0].innerHTML;
               }
               console.log(description);
               var name = results[i].getElementsByTagName("span")[1].innerHTML;
               if(firstPass(description) && name!="LinkedIn Member"){
                  chrome.runtime.sendMessage({
                     greeting: "ceo",
                     message_ceo: name,
                     message_description: description
                  });
                  window.close();
               }
            }
         },2000);
         setTimeout(function(){
            var results = document.getElementsByClassName("search-result--person");
            for(i=0;i<results.length;i++){
               var description = "";
               try{
                  description = results[i].getElementsByClassName("search-result__snippets")[0].innerHTML.substring(9);
               }catch(error){
                  description = results[i].getElementsByClassName("search-result__truncate")[0].innerHTML;
               }
               console.log(description);
               var name = results[i].getElementsByTagName("span")[1].innerHTML;
               if(secondPass(description) && name!="LinkedIn Member"){
                  chrome.runtime.sendMessage({
                     greeting: "ceo",
                     message_ceo: name,
                     message_description: description
                  });
                  window.close();
               }
            }
            window.close();
         },3000);
      }
      catch(err){
         console.log("there was another error: "+err.message);
         window.close();
      }
      

   }
}


var result = search();


