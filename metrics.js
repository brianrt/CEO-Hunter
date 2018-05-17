function getMetrics(shouldCheckCrunchBase, shouldCheckLinkedIn){
	if(shouldCheckCrunchBase){
		console.log("Need to perform CrunchBaseMetrics")
		CrunchBaseMetrics();
		return;
	}
	if(shouldCheckLinkedIn){
		console.log("Need to perform LinkedInMetrics")
		LinkedInMetrics();
		return;
	}

	//Update Metrics
	if(capitalRaised == "-1"){
		capitalRaised = "N/A";
	} else {
		capitalRaised = capitalRaised.substring(1); // Remove '$''
	}
	if(Revenue == "-1"){
		Revenue = "N/A";
	}
	if(numEmployees == "-1"){
		numEmployees = "N/A";
	}
	if(Location == "-1"){
		Location = "N/A";
	}
  	$("#capital_raised").html(capitalRaised).css('color','#0061BC');
	$("#revenue").html(Revenue).css('color','#00B247');
	$("#employees").html(numEmployees).css('color','red');
	$("#location").html(Location).css('color','#710097');

  	refreshHTML();
	//Script finishes here
	console.log("locking down");
  	preventFromLaunching = true;//prevent extension from launching until user clicks again
}

//LinkedIn Helper functions
function LinkedInMetrics(){
  var query = "http://www.bing.com/search?q="+companyDomain+"+LinkedIn";
  console.log("LinkedIn bing search: "+query);
  ajax_page(query,LinkedInBingCallBackMetrics);
}

function LinkedInBingCallBackMetrics(htmlData){
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
            openCompanyPageMetrics(link);
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
      messageNumEmployees: "-1"
    });
}

function openCompanyPageMetrics(url){
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
              chrome.tabs.executeScript(newTab.id, {"file": "scrapeLinkedInMetrics.js", allFrames: false});
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