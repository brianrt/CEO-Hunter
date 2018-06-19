chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
   console.log("LinkedIn search script starting");
   var companyName = request.greeting;
   var targeted_position = request.targeted_position;
   console.log(targeted_position);
   search(companyName,targeted_position);
});

function search(companyName,targeted_position){
   console.log("in search");
   try{
      var results = document.getElementById("results");
      var employees = results.getElementsByTagName("li");
      var names = [];
      var descriptions = [];
      for(i=0;i<employees.length;i++){
         var e = employees[i];
         if(e.className.includes("people")){
            var name = e.getElementsByClassName("title main-headline")[0].innerHTML;
            var description = e.getElementsByClassName("snippet")[0];
            description = description.getElementsByClassName("title")[0].innerHTML;
            if(name!="LinkedIn Member"){
               names.push(name);
               descriptions.push(description);
            }
         }
      }
      var ceo_potential = checkNamesWithDesciptions(names,descriptions,targeted_position);
      console.log(ceo_potential);
      if(ceo_potential[1].includes(":\n")){
         ceo_potential[1] = ceo_potential[1].substring(ceo_potential[1].indexOf(": ")+2);
      }
      console.log(ceo_potential);
      if(ceo_potential=="different lengths" || ceo_potential=="no match"){
         console.log("no linkedin matches");
         throw 'Round one not found';
      } else {
         chrome.runtime.sendMessage({
            greeting: "ceo",
            message_ceo: ceo_potential[0],
            message_description: ceo_potential[1]
         });
         // window.close();
      }
   }
   catch(err){
      console.log("there was an error: "+err.message);

      try{
         //Trying agian
         //Changed to search for current position, then title if they don't have a current position
         var results = document.getElementsByClassName("search-result--person");
         var descriptions = [];
         var names = [];
         for(var i=0;i<results.length;i++){
            var description = "";
            try{
               description = results[i].getElementsByClassName("search-result__snippets")[0].innerHTML.substring(11);
            }catch(error){
               description = results[i].getElementsByClassName("search-result__truncate")[0].innerHTML.trim();
            }
            console.log(description);
            var name = results[i].getElementsByClassName("actor-name")[0].innerHTML;
            console.log(name);
            if(name!="LinkedIn Member"){
               names.push(name);
               descriptions.push(description);
            }
         }
         var ceo_potential = checkNamesWithDesciptions(names,descriptions,targeted_position);
         console.log(ceo_potential);
         if(ceo_potential[1].includes(":\n")){
            ceo_potential[1] = ceo_potential[1].substring(ceo_potential[1].indexOf(": ")+2);
         }
         console.log(ceo_potential);
         if(ceo_potential=="different lengths" || ceo_potential=="no match"){
            console.log("no linkedin matches");
            throw 'Round two not found';
         } else {
            chrome.runtime.sendMessage({
               greeting: "ceo",
               message_ceo: ceo_potential[0],
               message_description: ceo_potential[1]
            });
            // window.close();
         }
      }
      catch(err){
         console.log("there was another error: "+err.message);
         try{
            secondarySearch(companyName);
         } catch(err){
            console.log("there was another error: "+err.message);
            chrome.runtime.sendMessage({
               greeting: "who.is",
            });
            // window.close();
         }
      }
   }
}

function secondarySearch(companyName,targeted_position){
   try{
      var html = document.body.innerHTML;
      chrome.runtime.sendMessage({
         greeting: "log",
         message: html
      });
      // console.log("html: "+html);
      var startIndex = html.indexOf('{"firstName":');
      var newHTML = html.substring(startIndex+30);
      // console.log("newHTML: "+newHTML);
      var newStartIndex = newHTML.indexOf('{"firstName":');
      var endIndex = newHTML.indexOf('sharedConnections');
      jsonEmployeesList = newHTML.substring(newStartIndex,endIndex);
      console.log("jsonEmployeesList: "+jsonEmployeesList);
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
      var ceo_potential = checkNamesWithDesciptions(names,descriptions,targeted_position);
      console.log(ceo_potential);
      if(ceo_potential[1].includes(":\n")){
         ceo_potential[1] = ceo_potential[1].substring(ceo_potential[1].indexOf(": ")+2);
      }
      console.log(ceo_potential);
      if(ceo_potential=="different lengths" || ceo_potential=="no match"){
         console.log("no linkedin matches");
         chrome.runtime.sendMessage({
            greeting: "who.is",
         });
         // window.close();
      } else {
         chrome.runtime.sendMessage({
            greeting: "ceo",
            message_ceo: ceo_potential[0],
            message_description: ceo_potential[1]
         });
         // window.close();
      }
   } catch (error) {
      chrome.runtime.sendMessage({
         greeting: "who.is",
      });
      // window.close();
   }
}


//From CheckDescriptions.js
function checkNamesWithDesciptions(names,descriptions,targeted_position){
   console.log("in linkedin checkNamesWithDesciptions: ",targeted_position);
   if(names.length!=descriptions.length){
      return "different lengths";
   }
   switch(targeted_position){
      case "ceo_owner":
         //Attempt first pass
         for(var i = 0; i < names.length; i++){
            if(firstPassCEO(descriptions[i])){
               return [names[i], descriptions[i]];
            }
         }

         //Attempt second pass
         for(var i = 0; i < names.length; i++){
            if(secondPassCEO(descriptions[i])){
               return [names[i], descriptions[i]];
            }
         }
         return "no match";
      case "sales_exec":
         return checkTargetedPositions(names,descriptions,sales_key,sales_array);
      case "marketing_exec":
         return checkTargetedPositions(names,descriptions,marketing_key,marketing_array);
      case "business_exec":
         return checkTargetedPositions(names,descriptions,business_dev_key,business_dev_array);
      default:
         return "no match";
   }
}

//Sales Exec Data
var sales_key = "sales";
var search_1_sales = ["vp","svp","vice","president"];
var search_2_sales = ["officer","chief","director"];
var search_3_sales = ["executive"];
var search_4_sales = ["manager"];
var sales_array = [search_1_sales,search_2_sales,search_3_sales,search_4_sales];

//Marketing Exec Data
var marketing_key = "marketing";
var search_1_marketing = ["vp","svp","vice","president","chief","officer"];
var search_2_marketing = ["director","head"];
var search_3_marketing = ["manager"];
var marketing_array = [search_1_marketing,search_2_marketing,search_3_marketing];

//Business Dev. Exec Data
var business_dev_key = "business development";
var search_1_business_dev = ["vp","svp","vice","president","officer"];
var search_2_business_dev = ["director","head"];
var search_3_business_dev = ["executive","manager"];
var business_dev_array = [search_1_business_dev,search_2_business_dev,search_3_business_dev];

//Keeping old two methods for ceo checking
function firstPassCEO(description){
   description = description.toLowerCase();
   if(description.includes("ceo"))
      return true;
   else if(description.includes("chief executive officer"))
      return true;
   else if(description.includes("president") && !(description.includes("vice")))
      return true;
   return false;
}

function secondPassCEO(description){
   description = description.toLowerCase();
   if(description.includes("owner"))
      return true;
   else if(description.includes("founder"))
      return true;
   else if(description.includes("principal"))
      return true;
   else if(description.includes("partner") && !description.includes("partnership"))
      return true;
   return false
}

function checkTargetedPositions(names,descriptions,key,positions_arrays){
   //First filter out any positions without the main term
   filtered_names = [];
   filtered_descriptions = [];
   for(var i = 0; i < descriptions.length; i++){
      description = descriptions[i].toLowerCase();
      if(description.includes(key)){
         filtered_names.push(names[i]);
         filtered_descriptions.push(descriptions[i]);
      }
   }
   if(filtered_descriptions.length==0){
      return "no match";
   }
   //Go through position descriptions and check if they include the targeted position titles
   for(var i = 0; i < filtered_descriptions.length; i++){
      description = filtered_descriptions[i].toLowerCase();
      for(var j = 0; j < positions_arrays.length; j++){
         var positions = positions_arrays[j];
         for(var k = 0; k < positions.length; k++){
            var position = positions[k];
            if(description.includes(position)){
               return [filtered_names[i],filtered_descriptions[i]];
            }
         }
      }
   }
   return "no match";
}