// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This extension demonstrates using chrome.downloads.download() to
// download URLs.

var allContacts = [];
var visibleContacts = [];
var contactopened = false;
var companyUrl;
var companyDomain;
var tabid="";
var linkedintab;
var tabsToClose = [];
var ceoEmail = {};
var verified=false;

//Todo: finish implimenting this
function setCompany(url){
  if(url.includes("www.")){
    url = url.substring(url.indexOf("www.")+4,url.length);
  }
  if(url.includes("://")){
      url = url.substring(url.indexOf("://")+3,url.length);
  }
  companyDomain = url.substring(0,url.indexOf("/"))
  companyName = url.substring(0,url.indexOf("."));
  console.log("domain: "+companyDomain);
  console.log("name: "+companyName);
}

function closeTabs(){
    chrome.tabs.remove(tabsToClose, function() { });
}

function verifyEmail(name,email_address){
  console.log(email_address);
  var catch_all = false;
  // set endpoint and your access key
  var access_key = 'df707e20dd449f6e3e72a33230ff5de1';
  var url = 'http://apilayer.net/api/check?access_key=' + access_key + '&email=' + email_address+'&catch_all=1';
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      console.log(xhr);
      var resp = JSON.parse(xhr.responseText);
      if(resp.smtp_check && resp.format_valid && resp.score>0.5){
        if(resp.score > ceoEmail.score){
          verified=true;
          ceoEmail.email = email_address;
          ceoEmail.score = parseFloat(resp.score);
          console.log("Valid email: "+email_address + " with confidence " + resp.score*100+"%");
          if(resp.catch_all==false){
            document.getElementById("personalEmail").innerHTML=ceoEmail.email;
            document.getElementById("confidence").innerHTML="Verified";
          }
          else{
            catch_all = true;
            document.getElementById("personalEmail").innerHTML=name.first.charAt(0)+name.last.toLowerCase()+"@"+companyDomain;
            document.getElementById("confidence").innerHTML="Risky";
          }
        }
      }
    }
    else if(!verified){
      document.getElementById("personalEmail").innerHTML=name.first.charAt(0)+name.last.toLowerCase()+"@"+companyDomain;
      document.getElementById("confidence").innerHTML="Not Likely";
    }
    return catch_all;

  }
  xhr.send();
}

function generateEmails(ceo){
  var possibleEmails = []
  var tokens = ceo.split(" ");
  var name = {first:tokens[0],last:tokens[tokens.length-1]}
  possibleEmails.push(name.first+"@"+companyDomain);
  possibleEmails.push(name.first.charAt(0)+name.last.toLowerCase()+"@"+companyDomain);
  possibleEmails.push(name.first+"."+name.last.toLowerCase()+"@"+companyDomain);

  for(var i = 0; i < possibleEmails.length;i++){
    console.log(possibleEmails[i]);
    var catch_all = verifyEmail(name,possibleEmails[i]);
    if(catch_all)
      break;
  }
}

function LinkedIn(){
  console.log("in linkedin function");
  var url;
  chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
      var url = tabs[0].url;
      setCompany(url);
      document.getElementById("url").innerHTML="www."+companyDomain;
      var query = "https://www.google.com/#q="+companyDomain+"+LinkedIn";
      chrome.tabs.create({ url: query, active:false },function(tab){
          tabsToClose.push(tab.id);
          setTimeout(function(){ 
            chrome.tabs.executeScript(tab.id,{file: 'googleResults.js',allFrames: true},function(){
                chrome.tabs.sendMessage(tab.id, {greeting: url}, function(response) {
                    var linkedinUrl = response.farewell;
                    chrome.tabs.create({ url: linkedinUrl, active:false },function(tab){
                        tabsToClose.push(tab.id);
                        setTimeout(function(){ 
                            chrome.tabs.executeScript(tab.id, {file: 'LinkedInScraper.js', allFrames: true}, function(){
                            chrome.tabs.sendMessage(tab.id, {greeting: url}, function(response) {
                                var companyUrl = response.farewell;
                                chrome.tabs.create({ url: companyUrl, active:false },function(tab){
                                    tabsToClose.push(tab.id);
                                    setTimeout(function(){ 
                                      chrome.tabs.executeScript(tab.id,{file: 'searchResult.js',allFrames: true},function(){
                                          chrome.tabs.sendMessage(tab.id, {greeting: "url"}, function(response) {
                                              var ceo = response.farewell;
                                              generateEmails(ceo);
                                          });
                                      });
                                    }, 4000);
                                });
                            });
                        });
                        }, 4000);
                        
                    });
                });
            });
          }, 3000);

      });
  });
}

function setFailedFields(){
  if(document.getElementById('LinkedInDescription').innerHTML=="Loading CEO Description...")
    document.getElementById('LinkedInDescription').innerHTML="CEO description not found";
}

chrome.extension.onRequest.addListener(function(contacts) {
  if(typeof contacts === 'string'){
    var needtoclose = false;
    if(contacts.includes("name")){
      document.getElementById("LinkedInName").innerHTML=contacts.substring(4);
      needtoclose=true;
    }
    if(contacts.includes("description")){
      document.getElementById("LinkedInDescription").innerHTML=contacts.substring(11);
      needtoclose=true;
    }
    if(needtoclose){
      closeTabs();
      needtoclose=false;
    }
    else if(!contactopened){
      chrome.tabs.create({ url: contacts, active:false },function(tab){
        chrome.tabs.executeScript(tab.id, {file: 'contactPageScript.js', allFrames: true});
        tabid = tab.id;
        tabsToClose.push(tabid);
      });
      contactopened=true;
    }
  }
  else if(contacts.constructor === Array){
    if(contacts.length>0)
      visibleContacts=[];
    for (var index in contacts) {
      var element=contacts[index];
      console.log(element);
      if(element.includes("Email"))
        document.getElementById("companyEmail").innerHTML=element.substring(7);
      else if(element.includes("Phone"))
        document.getElementById("companyPhone").innerHTML=element.substring(7);
    }
  }
});

// Set up event handlers and inject send_contacts.js into all frames in the active
// tab.
window.onload = function() {
 LinkedIn();
 ceoEmail = { email:"Not found", score:-1.0};
  chrome.windows.getCurrent(function (currentWindow) {
    var script = 'send_contacts.js';
    chrome.tabs.getSelected(null,function(tab) {
      if(tab.url.toLowerCase().includes("contact"))
        script = 'contactPageScript.js';
    });
    chrome.tabs.query({active: true, windowId: currentWindow.id},function(activeTabs) {
      chrome.tabs.executeScript(
        activeTabs[0].id, {file: script, allFrames: true});
    });
  });
};
