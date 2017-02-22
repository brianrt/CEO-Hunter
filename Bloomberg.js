function Bloomberg(){
  chrome.tabs.query({active:true,windowType:"normal", currentWindow: true},function(tabs){
    
    //set global company information
    var url = tabs[0].url;
    setCompany(url);
      var query = "http://www.bing.com/search?q="+companyName+"+private+company+information+bloomberg";
      ajax_page(query,bingCallback);
    });
}

function bingCallback(htmlData){
  console.log(htmlData);
  var search_results = htmlData.getElementsByClassName("b_algo");
  for(var i = 0; i < search_results.length; i++){
    var title = search_results[i].getElementsByTagName("a")[0].innerHTML;
    title = title.toLowerCase();
    title = title.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
    var strippedCompanyName = companyName.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
    console.log(title);
    if(title.includes("privatecompany") && (title.includes(strippedCompanyName))){
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
  bloomberg_company_url = bloomberg_company_url.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
  console.log("url: "+bloomberg_company_url);
  var strippedCompanyName = companyName.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
  if(bloomberg_company_url.includes(strippedCompanyName)){
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