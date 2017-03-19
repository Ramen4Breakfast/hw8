//Test for browser compatibility
if (window.openDatabase) {
    //Create the database the parameters are 1. the database name 2.version number 3. a description 4. the size of the database (in bytes) 1024 x 1024 = 1MB
    var mydb = openDatabase("places_db1", "0.1", "A Database of Places", 1024 * 1024);
    //create the cars table using SQL for the database using a transaction
    mydb.transaction(function(t) {
        t.executeSql("CREATE TABLE IF NOT EXISTS location (id INTEGER PRIMARY KEY ASC, Location TEXT, Longitude TEXT, Lattitude TEXT)");
    });
} else {
    alert("WebSQL is not supported by your browser!");
}

function addLocation() {
    console.log("inside add location");
    //check to ensure the mydb object has been created
    if (mydb) {
        //get the values of the make and model text inputs
        var location = document.getElementById("loc").value;
        var longitude = document.getElementById("long").value;
        var lattitude = document.getElementById("lat").value;
        //Test to ensure that the user has entered both a make and model
        if (longitude !== "" && lattitude !== "") {
            //Insert the user entered details into the cars table, note the use of the ? placeholder, these will replaced by the data passed in as an array as the second parameter
            mydb.transaction(function(t) {
                t.executeSql("INSERT INTO location (Location, Longitude, Lattitude) VALUES (?, ?, ?)", [location, longitude, lattitude]);
                outputLocations();
            });
        } else {
            alert("You must enter a Longitude and Latitude!");
        }
    } else {
        alert("db not found, your browser does not support web sql!");
    }
}
//function to output the list of cars in the database
function updatePlacesList(transaction, results) {
    //initialise the listitems variable
    var listitems = "";
    //get the car list holder ul
    var listholder = document.getElementById("placeslist");
    //clear cars list ul
    listholder.innerHTML = "";
    var i;
    //Iterate through the results
    for (i = 0; i < results.rows.length; i++) {
        //Get the current row
        var row = results.rows.item(i);
        listholder.innerHTML += "<li>" + row.Location + " : " + row.Longitude + " : " + row.Lattitude + " (<a href='javascript:void(0);' onclick='deleteLocation(" + row.id + ");'>Delete Place</a>)";
    }
    var counter = 0;
    for (var i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(row.Longitude, row.Lattitude),
            map: map
        });
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infowindow.setContent(row.Location);
                infowindow.open(map, marker);
            }
        })(marker, i));
    }
}
//function to get the list of cars from the database
function outputLocations() {
    //check to ensure the mydb object has been created
    if (mydb) {
        //Get all the cars from the database with a select statement, set outputCarList as the callback function for the executeSql command
        mydb.transaction(function(t) {
            t.executeSql("SELECT * FROM location", [], updatePlacesList);
        });
    } else {
        alert("db not found, your browser does not support web sql!");
    }
}
//function to add the car to the database
//function to remove a car from the database, passed the row id as it's only parameter
function deleteLocation(id) {
    //check to ensure the mydb object has been created
    if (mydb) {
        //Get all the cars from the database with a select statement, set outputCarList as the callback function for the executeSql command
        mydb.transaction(function(t) {
            t.executeSql("DELETE FROM location WHERE id=?", [id], outputLocations);
        });
    } else {
        alert("db not found, your browser does not support web sql!");
    }
}
var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: new google.maps.LatLng(48.462925, -123.311903),
    mapTypeId: google.maps.MapTypeId.ROADMAP
});
var infowindow = new google.maps.InfoWindow();