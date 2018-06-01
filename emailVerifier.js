var done = false;
var whoIsUsed = false;
var count = 0;
//Need these in case we get a non-verified first and these are erased and set to not found but we get a verified later
var ceo_name;
var ceo_description;
function verifyEmail(name,email_address){
  console.log(email_address);
  // set endpoint and your access key
  var access_key = 'd7294b9f413ac4e844ac4105b73aa91c';
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
            document.getElementById("confidence").innerHTML="Verified";
            document.getElementById("confidence").style.color="green";

            //Ensure ceo name and description are correct

            document.getElementById("LinkedInName").innerHTML = ceo_name;
            document.getElementById("LinkedInDescription").innerHTML = ceo_description;
            addSuccessFullHunt(ceo_name,ceo_description,email_address,"Verified",false);
            refreshHTML();
            done = true;
            return;
          }
          else{
              document.getElementById("personalEmail").innerHTML="<u>Possible Options:</u><br>"+name.first+"@"+companyDomain+"<br>"+name.first.charAt(0)+name.last.toLowerCase()+"@"+companyDomain+"<br>"+name.first+"."+name.last.toLowerCase()+"@"+companyDomain;
              document.getElementById("confidence").innerHTML="Likely Emails";
              document.getElementById("confidence").style.color="#cccc00";
              addSuccessFullHunt(ceo_name,ceo_description,document.getElementById("personalEmail").innerHTML,"Likely Emails",false);
              refreshHTML();
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
          count++;
          console.log(count);
          if(count==2){ //last one
            addSuccessFullHunt(ceo_name,ceo_description,email_address,"Not Likely",false);
            refreshHTML();
          }
        }
      }
    }
  }
  xhr.send();
}

function generateEmails(ceo,description){
  ceo_name = ceo;
  ceo_description = description;
  count = 0;
  done = false;
  var possibleEmails = [];
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