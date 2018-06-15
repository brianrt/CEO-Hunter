function Bloomberg() {
    var query = "https://www.google.com/search?q="+companyDomain+"+private+company+information+bloomberg" + "&oq="+companyDomain+"+private+company+information+bloomberg";
    console.log(query);
    ajax_page(query,BloombergGoogleCallBack);
}

function BloombergGoogleCallBack(htmlData){
    console.log(htmlData);
    if(htmlData == "Error"){
      AngelList();
      return;
    }
    var search_results = htmlData.getElementsByClassName("r");
    // console.log(search_results);
    for(var i = 0; i < search_results.length; i++){
      var result = search_results[i];
      var title = result.getElementsByTagName("a")[0].innerHTML;
      title = title.toLowerCase();
      title = title.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
      console.log(title);
      var trimmedCompanyName = companyName.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
      console.log(trimmedCompanyName);
      if(title.includes("privatecompany") && (title.includes(trimmedCompanyName) || trimmedCompanyName.includes(title))){
        var link = result.getElementsByTagName("a")[0].href;
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
  if(htmlData == "Error"){
    ZoomInfo();
    return;
  }
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
      var name_elements = htmlData.getElementsByClassName("link_sb");
      var names = [];
      for(var i = 1; i < name_elements.length; i++){
        names.push(cleanName(name_elements[i].innerHTML));
      }
      console.log(names);
      var description_elements = htmlData.getElementsByClassName("officerInner");
      var descriptions = [];
      for(var i = 0; i < description_elements.length;i++){
        descriptions.push(description_elements[i].getElementsByTagName("div")[1].innerHTML.trim());
      }
      console.log(descriptions);

      var ceo_potential = checkNamesWithDesciptions(names,descriptions);
      console.log(ceo_potential);
      if(ceo_potential=="different lengths" || ceo_potential=="no match"){
        console.log("no");
        ZoomInfo();
        return;
      }
      listenerCallback({
        greeting: "ceo",
        message_ceo: ceo_potential[0],
        message_description: ceo_potential[1]
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