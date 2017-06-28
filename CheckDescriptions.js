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

function checkNamesWithDesciptions(names,descriptions){
   console.log("in checkNamesWithDesciptions: ",targeted_position);
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