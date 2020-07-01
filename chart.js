//Arrays to hold tick info
var redPoints = [];
var redPointDates = [];
var redPointGrades = [];
var redPointNames = [];
var allTicks = JSON.parse(localStorage.getItem("allTicks"));
var tickArray = [];


var gradeArray = [];
var gradeCount = {
    "V-easy": 0
};
 
var dateOrder = "unsorted"
var gradeOrder = "unsorted"
var nameOrder = "unsorted"
var areaOrder = "unsorted"


var defaultGrades = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'];
var defaultCount = [];

var userKey = localStorage.getItem('key');
var userEmail = localStorage.getItem('email');
var rememberMe = localStorage.getItem('remember');
var fetchURL = localStorage.getItem('url2');

var mpName = localStorage.getItem('mpName');
var mpLocation = localStorage.getItem('location');
var mpURL = localStorage.getItem('mpURL');
var mpPic = localStorage.getItem('mpPic');


//Chart element
var ctx = document.getElementById('myChart').getContext('2d');
var ctx2 = document.getElementById('myChart2').getContext('2d')
//Tick table
var ticktable = document.getElementById('ticktable');


//Main function on load
var callback = function(){
    newChart(defaultCount, defaultGrades, ctx);
    newLine([], [], ctx2);
    cardInfo();
    fetchMPData(fetchURL);
  };
  

//vanilla JS doc ready check
  if (
      document.readyState === "complete" ||
      (document.readyState !== "loading" && !document.documentElement.doScroll)
  ) {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }


//function for adding route grades and names to route json array
addRouteInfo = (json, arr) => {
    for (i = 0; i < arr.length; i++){
        var name = json[i].name;
        var grade = json[i].rating;
        var type = json[i].type;
        var location = json[i].location;
        arr[i].name = name;
        arr[i].grade = grade;
        arr[i].type = type;
        arr[i].location = location;
    }
}

//Sort tick list by key
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

//Catch fetch errors
function CheckError(response) {
    if (!response.ok) {
        msg.innerHTML = "Please enter a valid Mountain Project API Key and Email Address";
        throw Error(response.statusText);
    }
    return response.json();
  }

// Personal Ticks HTTP Request
function fetchMPData(url1){
    //fetch user tick list
    fetch(url1)
                .then(CheckError)
                .then(function(data2){
                    //append route name and grade to user tick list json array
                    addRouteInfo(data2.routes, allTicks);
                    findRedPoints(allTicks);
                    allTicks.sort(GetSortOrder("grade"));
                    //console.log(allTicks)
                    //create individual arrays from json array for chart data
                    allTicks.forEach(tick => {
                        //console.log(gradeCount)
                        //console.log(tick.name +" "+ tick.type +" " + tick.grade)
                        if(tick.type == 'Boulder'){
                            var grade = tick.grade.replace(' PG13', '');
                            if(grade.includes('5.')){var idx = grade.indexOf('V'); grade = grade.slice(idx)}
                            if(grade.includes('-') && !grade.includes('easy')){grade = grade.slice(0,2)}
                            if (!gradeCount.hasOwnProperty(grade)){
                                gradeCount[grade] = 1;
                                //console.log("new grade")
                            }
                            else{
                                gradeCount[grade] = gradeCount[grade]+=1;
                                //console.log("incrememnt existing grade")
                            }
                        }
                    });
                    newChart(Object.values(gradeCount), Object.keys(gradeCount), ctx)
                    newLine(redPointDates, redPointGrades, ctx2)
                    fillTable(allTicks, ticktable);
                }
                ).catch(function(error){
                    console.log(error)
                })
            }
    
    function newChart(count, grades, chart){
        var myChart = new Chart(chart, {
            type: 'bar',
            data: {
                //labels: Array.from(new Set(tickDates)),
                datasets: [{
                    label: 'Number of ticks',
                    backgroundColor: '#36a2eb',
                    borderColor: '#36a2eb',
                    xAxisID: 'Grade',
                    yAxisID: 'Count',
                    data: count,
                    fill: false
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Boulder Tick List'
                },
                animation: false,
                scales:{
                    xAxes:[{
                        id: 'Grade',
                        type: 'category', 
                        labels: grades//['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7'],
                        //position: 'left'
                    }],
                    yAxes: [{
                        id: 'Count',
                        type: 'linear',
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1
                        }
                    }]
                    
                }
            }
        });
    }
    
    function newLine(dates, grades, chart){
        var myChart = new Chart(chart, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Redpoint Grade',
                    backgroundColor: 'red',
                    borderColor: 'red',
                    //xAxisID: 'Date',
                    yAxisID: 'Grade',
                    data: grades,
                    fill: false
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Redpoint Over Time'
                },
                animation: false,
                scales:{
                    // xAxes:[{
                    //     id: 'Date',
                    //     type: 'time', 
                    //     time: {
                    //         unit: 'month'
                    //     }
                    // }],
                    yAxes: [{
                        id: 'Grade',
                        type: 'category',
                        labels: ['V7', 'V6', 'V5', 'V4', 'V3', 'V2', 'V1', 'V0'],
                    }]
                    
                }
            }
        });
    }
    
    
    function findRedPoints(jsonArray){
        jsonArray.sort(GetSortOrder("date"))
        var redpointGrade = ""
        jsonArray.forEach(tick => {
            if(tick.type == 'Boulder'){
                var grade = tick.grade.replace(' PG13', '');
                if(grade.includes('5.')){var idx = grade.indexOf('V'); grade = grade.slice(idx)}
                if(grade.includes('-') && !grade.includes('easy')){grade = grade.slice(0,2)}
                if(grade > redpointGrade){
                    redpointGrade = grade;
                    redPoints.push(
                        {
                            "x": new Date(tick.date),
                            "y": grade
                        }
                    )
                    redPointDates.push(tick.date);
                    redPointGrades.push(grade);
                    redPointNames.push(tick.name);
                }
            }
        })
    }
    
    function fillTable(jsonArray, table){
        jsonArray.forEach(tick => {
            if(tick.type == 'Boulder'){
                var grade = tick.grade.replace(' PG13', '');
                if(grade.includes('5.')){var idx = grade.indexOf('V'); grade = grade.slice(idx)}
                if(grade.includes('-') && !grade.includes('easy')){grade = grade.slice(0,2)}
                addTableRow(table, tick.date, grade, tick.name, tick.location[2])
            }
        })
    }
    
    
    function addTableRow(table, date, grade, name, area){
        var row = table.insertRow(0);
    
        var dateCol = row.insertCell(0);
        dateCol.innerHTML = date;
        var gradeCol = row.insertCell(1);
        gradeCol.innerHTML = grade;
        var nameCol = row.insertCell(2);
        nameCol.innerHTML = name;
        var areaCol = row.insertCell(3);
        areaCol.innerHTML = area;
    
    }
    
    
    function resetTable(table){
        var newBody = document.createElement('tbody');
        newBody.id = 'ticktable';
        table.parentNode.replaceChild(newBody, table);
    }
    
    function sortTable(table, column, order){
        switching = true;
        while (switching) {
          switching = false;
          rows = table.rows;
          for (i = 0; i < (rows.length-1); i++) {
           shouldSwitch = false;
            var x = rows[i].getElementsByTagName("TD")[column];
            var y = rows[i + 1].getElementsByTagName("TD")[column];
            if (x.innerHTML > y.innerHTML && (order == "unsorted" || order == "descending")) {
              shouldSwitch = true;
              break;
            }
            if(x.innerHTML < y.innerHTML && (order == "ascending")){
                shouldSwitch = true;
                break;
            }
          }
          if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
          }
        }
        if(order == "unsorted" || order == "descending"){
            return "ascending"
        }
        else return "descending"
    }


function cardInfo(){
    document.getElementById("cardName").innerHTML = mpName;
    document.getElementById("cardLocation").innerHTML = mpLocation;
    document.getElementById("cardURL").href = mpURL;
    document.getElementById("mpPic").src = mpPic;
}

function logOut(){
    if(!rememberMe){
        localStorage.removeItem('key');
        localStorage.removeItem('email');
    }
    window.location = "index.html";
}