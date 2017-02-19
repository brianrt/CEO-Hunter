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