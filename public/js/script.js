(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    alert("Geolocation is not supported by this browser");
  }
})();

var wmap;

function success(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const date = new Date(position.timestamp).toLocaleDateString("en-GB");
  const time = new Date(position.timestamp).toLocaleTimeString("en-GB");
  const timestamp = `${date} ${time}`;

  drawCoordinates(latitude, longitude);

  var isAuthenticated;
  var email;

  fetch("/user").then(res => {
    return res.json()
  }).then(function(user){
    if(Object.keys(user).length != 0){
      isAuthenticated = true;
      email = user.email
    }

    getMap(latitude, longitude, timestamp, email);

    if(isAuthenticated){
      addUser(email, latitude, longitude, timestamp);
      drawMarkers(email);
    } 
  }).catch(error => {
    console.log(error);
  });
}

function error() {
  alert("Unable to retrieve location");
}

function getMap(latitude, longitude, timestamp, email) {
  L.Map.addInitHook(function(){
    wmap = this;
  });

  const map = L.map("map").setView([latitude, longitude], 16);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker([latitude, longitude]).bindPopup(`${email} ${timestamp}`).addTo(map);
}

function drawCoordinates(latitude, longitude) {
  document.getElementById("latitude").innerHTML = `Latitude: ${latitude}`;
  document.getElementById("longitude").innerHTML = `Longitude: ${longitude}`;
}

function addUser(email, latitude, longitude, timestamp) {
  fetch('/users', {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      latitude: latitude,
      longitude: longitude,
      timestamp: timestamp
    })
  }).then(res => console.log(res));
}

function drawMarkers(email) {
  fetch("/users", {
  }).then(res => {
    return res.json()
  }).then(users => {
    
    users.pop();
    users.slice(Math.max(users.length -5, 0)).forEach(user => {
      L.marker([user.latitude, user.longitude]).bindPopup(`${user.email} ${user.timestamp}`).addTo(wmap);
    });
  }).catch(error => {
    console.log(error);
  });
}