var done = false;
var whoIsUsed = false;
function verifyEmail(name,email_address){
  console.log(email_address);
  // set endpoint and your access key
  var access_key = 'df707e20dd449f6e3e72a33230ff5de1';
  var url = 'http://apilayer.net/api/check?access_key=' + access_key + '&email=' + email_address+'&catch_all=1';
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if(done)
        return;
      console.log(xhr);
      var resp = JSON.parse(xhr.responseText);
      if(resp.smtp_check && resp.format_valid && resp.score>0.5){
          console.log("Valid email: "+email_address + " with confidence " + resp.score*100+"%");
          if(resp.catch_all==false){
            console.log("verified true");
            document.getElementById("personalEmail").innerHTML=email_address;
            $("#mailTo").attr("type","button");
            $("#mailTo").val("Email CEO");
            $("#mailTo").attr("onclick","location.href='mailto:"+email_address+"';");
            document.getElementById("confidence").innerHTML="Verified";
            document.getElementById("confidence").style.color="green";
            chrome.tabs.sendMessage(tab_id, {greeting: "update data",message:document.getElementById("ceo_hunter").innerHTML});
            done = true;
            return;
          }
          else{
              document.getElementById("personalEmail").innerHTML="<u>Possible Options:</u><br>"+name.first+"@"+companyDomain+"<br>"+name.first.charAt(0)+name.last.toLowerCase()+"@"+companyDomain+"<br>"+name.first+"."+name.last.toLowerCase()+"@"+companyDomain;
              $("#mailTo").attr("onclick","location.href='mailto:"+name.first.charAt(0)+name.last.toLowerCase()+"@"+companyDomain+"'");
              $("#mailTo").attr("type","button");
              $("#mailTo").attr("target","_blank");
              document.getElementById("mailTo").value="Email CEO";
              document.getElementById("confidence").innerHTML="Risky";
              document.getElementById("confidence").style.color="#cccc00";
              chrome.tabs.sendMessage(tab_id, {greeting: "update data",message:document.getElementById("ceo_hunter").innerHTML});
              done = true;
              return;
          }
      }
      else{
        if(whoIsUsed){
          console.log("who.is used");
          document.getElementById("LinkedInName").innerHTML = "Not Found";
          document.getElementById("LinkedInDescription").innerHTML = "Not found";
          displayNotFound();
        } else{
          document.getElementById("personalEmail").innerHTML=name.first.charAt(0)+name.last.toLowerCase()+"@"+companyDomain;
          document.getElementById("confidence").innerHTML="Not Likely";
          document.getElementById("confidence").style.color="red";
          chrome.tabs.sendMessage(tab_id, {greeting: "update data",message:document.getElementById("ceo_hunter").innerHTML});
        }
      }
    }
  }
  xhr.send();
}

function generateEmails(ceo){
  done = false;
  var possibleEmails = []
  var tokens = ceo.split(" ");
  var name = {first:tokens[0],last:tokens[tokens.length-1]}
  possibleEmails.push(name.first+"@"+companyDomain);
  possibleEmails.push(name.first.charAt(0)+name.last.toLowerCase()+"@"+companyDomain);
  possibleEmails.push(name.first+"."+name.last.toLowerCase()+"@"+companyDomain);
  console.log(possibleEmails.length);
  for(var i = 0; i < possibleEmails.length;i++){
    console.log(possibleEmails[i]);
    verifyEmail(name,possibleEmails[i]);
  }
}