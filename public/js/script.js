(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    alert("Geolocation is not supported by this browser");
  }
})();

function success(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const date = new Date(position.timestamp).toLocaleDateString("en-GB");
  const time = new Date(position.timestamp).toLocaleTimeString("en-GB");
  const timestamp = `${date} ${time}`;

  drawCoordinates(latitude, longitude);
  getMap(latitude, longitude, timestamp);
}

function error() {
  alert("Unable to retrieve location");
}

function getMap(latitude, longitude, timestamp) {
  const map = L.map("map").setView([latitude, longitude], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  L.marker([latitude, longitude]).bindPopup(`Rope ${timestamp}`).addTo(map);
}

function drawCoordinates(latitude, longitude) {
  document.getElementById("latitude").innerHTML = `Latitude: ${latitude}`;
  document.getElementById("longitude").innerHTML = `Longitude: ${longitude}`;
}
