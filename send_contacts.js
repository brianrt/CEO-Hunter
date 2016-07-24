// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var contacts;
var foundPhone = false;
function getEmail(text){
  var emailRe = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(emailRe.test(text)){
    return text;
  }
  return "";
}

function getPhoneNumber(text){
  var phoneRe = /\(?\d{3}\)?[-. –](\d{3})[-. –](\d{4})/;
  if (phoneRe.test(text))
    return text.match(phoneRe)[0];
  return "";
}

function openContactUsURL(){
  urls = [].slice.apply(document.querySelectorAll('a'));
  for(var i = 0; i < urls.length; i++){
    if(urls[i].innerText.toLowerCase().includes("contact")){
      chrome.extension.sendRequest(urls[i].href);
      console.log(urls[i].innerText);
    }
  }
}

// Send back to the popup a sorted deduped list of valid link URLs on this page.
// The popup injects this script into all frames in the active tab.
contacts = [].slice.apply(document.querySelectorAll('p,li,a,div'));
contacts = contacts.map(function(element) {
  // console.log(element);
  var text = element.innerText;
  var html = element.innerHTML;
  if(!foundPhone){
    var phone = getPhoneNumber(text)
    if(phone.length>0){
      foundPhone = true;
      return "Phone: "+phone;
    }
  }
  var email = getEmail(text)
  if(email.length>0){
    return "Email: "+email;
  }
  return "";
});

openContactUsURL();
contacts.sort();

chrome.extension.sendRequest(contacts);
