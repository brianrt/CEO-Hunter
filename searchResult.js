chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
   console.log("LinkedIn search script starting");
   var companyName = request.greeting;
   search(companyName);
});

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

function search(companyName){
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
            secondarySearch(companyName);
         },3000);
      }
      catch(err){
         console.log("there was another error: "+err.message);
         secondarySearch(companyName);
      }
      

   }
}

function secondarySearch(companyName){
   var html = document.body.innerHTML;
   console.log(html);
   var startIndex = html.indexOf('{"firstName":');
   var newHTML = html.substring(startIndex+30);
   var newStartIndex = newHTML.indexOf('{"firstName":');
   var endIndex = newHTML.indexOf('sharedConnections');
   var jsonEmployeesList = newHTML.substring(newStartIndex,endIndex);
   jsonEmployeesList = jsonEmployeesList.substring(0,jsonEmployeesList.lastIndexOf("}")+1);
   var jsonObject = JSON.parse('['+ jsonEmployeesList + ']');
   console.log(jsonObject);
   var names = [];
   var descriptions = [];
   for (var key in jsonObject) {
      var employee = jsonObject[key];
      if(employee.firstName==""){
         continue;
      }
      var name = employee.firstName+" "+employee.lastName;
      var occupation = employee.occupation;
      var strippedOccupation = occupation.toLowerCase().replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
      var strippedCompanyName = companyName.toLowerCase().replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
      console.log(strippedOccupation);
      console.log(strippedCompanyName);
      if(name != undefined && strippedOccupation.includes(strippedCompanyName)){
         names.push(name);
         descriptions.push(occupation);
      }
   }
   console.log(names);
   console.log(descriptions);
   var ceo_potential = checkNamesWithDesciptions(names,descriptions);
   console.log(ceo_potential);
   if(ceo_potential=="different lengths" || ceo_potential=="no match"){
      console.log("no linkedin matches");
      return;
      window.close();
   }
   chrome.runtime.sendMessage({
      greeting: "ceo",
      message_ceo: ceo_potential[0],
      message_description: ceo_potential[1]
   });
   window.close();
}


//From CheckDescriptions.js
function checkNamesWithDesciptions(names,descriptions){
   if(names.length!=descriptions.length){
      return "different lengths";
   }

   //Attempt first pass
   for(var i = 0; i < names.length; i++){
      if(firstPass(descriptions[i])){
         return [names[i], descriptions[i]];
      }
   }

   //Attempt second pass
   for(var i = 0; i < names.length; i++){
      if(secondPass(descriptions[i])){
         return [names[i], descriptions[i]];
      }
   }

   return "no match";
}

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
   else if(description.includes("partner") && !description.includes("partnership"))
      return true;
   return false;
}