var companyWindowCreated = false;
var employeeWindowCreated = false;
var googleWindowCreated = false;
var companyWindowId;
var employeeWindowId;
var googleWindowId;
var currWindowId;

function LinkedIn(){
  var query = "http://www.bing.com/search?q="+companyDomain+"+LinkedIn";
  console.log("LinkedIn bing search: "+query);
  ajax_page(query,LinkedInBingCallBack);
}

function LinkedInBingCallBack(htmlData){
    console.log(htmlData);
    var search_results = htmlData.getElementsByClassName("b_algo");
    for(var i = 0; i < search_results.length; i++){
      var title_possibilites = search_results[i].getElementsByTagName("a");
      for(var j = 0; j < title_possibilites.length; j++){
        title = title_possibilites[j].innerHTML;
        if(title != ""){
          title = title.toLowerCase();
          title = title.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
          console.log(title);
          trimmedCompanyName = companyName.replace(/[.,\/#!' $%\^&\*;:{}=\-_`~()]/g,"");
          console.log(trimmedCompanyName);
          var link = title_possibilites[j].href;
          if(link.includes("linkedin.com/company/") && title.includes("linkedin") && title.includes(trimmedCompanyName)){
            console.log("link: "+link);
            openCompanyPage(link);
            return;
          }
        }
      }
    }
    //No linkedin bing results, send back failed metrics
    listenerCallback({
      greeting: "linkedInMetrics",
      messageRevenue: "-1",
      messageLocation: "-1",
      messageDateFounded: "-1",
      messageNumEmployees: "-1"
    });
    
    listenerCallback({
      greeting: "who.is",
      message: "result"
    });
}

function openCompanyPage(url){
  if(!companyWindowCreated){
    chrome.tabs.create({ url: url, active: false}, function (newTab) {
      chrome.windows.getCurrent(function(currentWindow) {
        chrome.windows.create({
          tabId: newTab.id,
          type: 'popup',
          focused: false,
          width: 100,
          height: 100,
          left: currentWindow.left,
          top: currentWindow.top,
        }, function (w) {
          companyWindowCreated=true;
          companyWindowId = w.id;
          currWindowId = currentWindow.id;
            setTimeout(function(){
              chrome.tabs.executeScript(newTab.id, {"file": "scrapeLinkedIn.js", allFrames: false});
            },3000);
            chrome.windows.update(currentWindow.id, {focused:true});
        });
      });
    });
  }
  else{
    chrome.tabs.create({ url: url, active: false, windowId : companyWindowId }, function (newTab) {
      setTimeout(function(){
        chrome.tabs.executeScript(newTab.id, {"file": "scrapeLinkedIn.js", allFrames: false});
      },3000);
      chrome.windows.update(currWindowId, {focused:true});
    });
  }
}

function openEmployeePage(url){
  if(!employeeWindowCreated){
    chrome.tabs.create({ url: url, active: false}, function (newTab) {
      chrome.windows.getCurrent(function(currentWindow) {
        chrome.windows.create({
          tabId: newTab.id,
          type: 'popup',
          focused: false,
          width: 100,
          height: 100,
          left: currentWindow.left,
          top: currentWindow.top,
        }, function (w) {
          employeeWindowCreated=true;
          employeeWindowId = w.id;
          currWindowId = currentWindow.id;
            setTimeout(function(){
              chrome.tabs.executeScript(newTab.id, {"file": "searchResult.js", allFrames: false},function(){
                chrome.tabs.sendMessage(newTab.id, {"greeting" : companyName, "targeted_position" : targeted_position});
              });
            },000);
            chrome.windows.update(currentWindow.id, {focused:true});
        });
      });
    });
  }
  else{
    chrome.tabs.create({ url: url, active: false, windowId : employeeWindowId }, function (newTab) {
      setTimeout(function(){
        chrome.tabs.executeScript(newTab.id, {"file": "searchResult.js", allFrames: false},function(){
                chrome.tabs.sendMessage(newTab.id, {"greeting" : companyName, "targeted_position" : targeted_position});
              });
      },000);
      chrome.windows.update(currWindowId, {focused:true});
    });
  }
}