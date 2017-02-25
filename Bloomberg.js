function Bloomberg(){
  //Let's try using bing
  //The search will need to be "'Company URL' private company information bloomberg"
  var query = "http://www.bing.com/search?q="+companyDomain+"+private+company+information+bloomberg";
  ajax_page(query,bingCallback);
}

function bingCallback(htmlData){
  console.log(htmlData);
  var search_results = htmlData.getElementsByClassName("b_algo");
  for(var i = 0; i < search_results.length; i++){
    var title = search_results[i].getElementsByTagName("a")[0].innerHTML;
    title = title.toLowerCase();
    title = title.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
    console.log(title);
    trimmedCompanyName = companyName.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
    if(title.includes("privatecompany") && (title.includes(trimmedCompanyName) || trimmedCompanyName.includes(title))){
      var link = search_results[i].getElementsByTagName("a")[0];
      link = link.getAttribute("href");
      console.log(link);
      ajax_page(link,bloombergCallback);
      return;
    }
  }
  ZoomInfo();
}

function bloombergCallback(htmlData){
  console.log("bloomberg ajax result");
  console.log(htmlData);
  var bloomberg_company_url = "";
  try{
    bloomberg_company_url = htmlData.getElementsByClassName("link_sb")[0].getAttribute("href");
  }catch(error){
    console.log("bloomberg failed, trying ZoomInfo");
    ZoomInfo();
    return;
  }

  //check if bloomberg url contains a www.
  console.log("url: "+bloomberg_company_url);
  if(bloomberg_company_url.includes(companyDomain)){
    console.log("bloomberg success");
    try{
      var name = htmlData.getElementsByClassName("link_sb")[1].innerHTML;
      name = cleanName(name);
      console.log("name from bloomberg: "+ name);
      var description = htmlData.getElementsByClassName("officerInner")[0].getElementsByTagName("div")[1].innerHTML;
      console.log("description from bloomberg: "+ description);
      //send results to callback function
      listenerCallback({
        greeting: "ceo",
        message_ceo: name,
        message_description: description
      });
    }catch(error){
      ZoomInfo();
      return;
    }
  }
  else{
    console.log("incorrect company on bloomberg, trying ZoomInfo");
    ZoomInfo();
    return;
  }
}

function cleanName(name){
  var names = name.split(" ");
  var result = "";
  for(var i = 0; i < names.length; i++){
    if(!(names[i].includes("."))){
      result+=names[i]+" ";
    }
  }
  result = result.substring(0,result.length-1);
  return result;
}