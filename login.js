var lsKey = localStorage.getItem('key');
var lsEmail = localStorage.getItem('email');
var rememberMe = localStorage.getItem('remember');

var allTicks = [];
var fetchStatus = false;

//MP getRoutes URL base
var routesURL = 'https://www.mountainproject.com/data/get-routes?routeIds='

var msg = document.getElementById('submitMessage')


var callback = function(){
    if(lsKey && lsEmail && rememberMe == "true"){
        var userKey = lsKey;
        var userEmail = lsEmail;
        document.getElementById('userKey').value = userKey;
        document.getElementById('userEmail').value = userEmail;
        document.getElementById('saveInfo').checked = true;
    }
    console.log("callback complete")
  };


if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  callback();
} else {
  document.addEventListener("DOMContentLoaded", callback);
}


function loginCheck(){
    var userKey = document.getElementById('userKey').value;
    var userEmail = document.getElementById('userEmail').value;
    var remember = document.getElementById('saveInfo').checked;
    if (userEmail == '' || userKey == ''){
        msg.innerHTML = "Please enter a valid Mountain Project API Key and Email Address";
        return false
    }
    else{
        localStorage.setItem('key', userKey)
        localStorage.setItem('email', userEmail)
        localStorage.setItem('remember', remember)
        ticksURL = 'https://www.mountainproject.com/data/get-ticks?email='+userEmail+'&key='+userKey;
        userURL = 'https://www.mountainproject.com/data/get-user?email='+userEmail+'&key='+userKey;
        userCheck(userURL);
        mpCheck(ticksURL);
    }
}



//Catch fetch errors
function CheckError(response) {
    if (!response.ok) {
        msg.innerHTML = "Please enter a valid Mountain Project API Key and Email Address";
        throw Error(response.statusText);
    }
    return response.json();
  }

appendRoutesAndKey = (arr, url) => {
    for ( i = 0; i < arr.length; i++){
        url += arr[i].routeId.toString() +","
    }
    url = url.slice(0, url.length - 1)
    url += "&key="+document.getElementById('userKey').value;
    return url
}

function GetSortOrder(prop) {    
    return function(a, b) {    
        if (a[prop] > b[prop]) {    
            return 1;    
        } else if (a[prop] < b[prop]) {    
            return -1;    
        }    
        return 0;    
    }    
}    

function mpCheck(url1){
        //fetch user tick list
        fetch(url1)
            //return response from MP as json
            .then(CheckError)
            .then(function(data1){
                //Create JSON array of ticks, and sort by route ID
                allTicks = data1.ticks; 
                allTicks.sort(GetSortOrder("routeId"));
                localStorage.setItem('allTicks', JSON.stringify(allTicks));
                //Append tick IDs and user key to getRoutes URL
                localStorage.setItem("url2", appendRoutesAndKey(allTicks, routesURL)) 
                msg.innerHTML = '';
                window.location = "chart.html";
                
            }
            ).catch(function(error){
                console.log(error)
                msg.innerHTML = "Please enter a valid Mountain Project API Key and Email Address";
            })
}

function userCheck(url){
    fetch(url)
            //return response from MP as json
            .then(CheckError)
            .then(function(data1){
                localStorage.setItem("mpName", data1.name);
                localStorage.setItem("location", data1['location']);
                localStorage.setItem("mpURL", data1.url);
                localStorage.setItem("mpPic", data1.avatar);
                console.log("usercheck executed");
            }
            ).catch(function(error){
                console.log(error)
                msg.innerHTML = "Please enter a valid Mountain Project API Key and Email Address";
            })
}