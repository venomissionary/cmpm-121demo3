import * as L from "leaflet";
import "./leafletWorkaround.ts";

let usercoins = 0;

// Page container
const Canvascontainer = document.createElement("div");
Canvascontainer.id = "canvascontainer";
Canvascontainer.style.padding = "200px";

// Coin counter display
const CoinCounter = document.createElement("div");
CoinCounter.style.position = "absolute";
CoinCounter.style.top = "10px";
CoinCounter.style.right = "10px";
CoinCounter.style.padding = "10px 20px";
CoinCounter.style.color = "#ffffff";
CoinCounter.style.fontSize = "28px";
CoinCounter.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.5)";
CoinCounter.textContent = `Coins collected: ${usercoins}`;
document.body.appendChild(CoinCounter);

// Update the coin counter display
function Updatecounter() {
  CoinCounter.textContent = `Coins collected: ${usercoins}`;
}

// Load the map
document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map", {}).setView([36.9895, -122.0630], 18);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker([36.9895, -122.0628]).addTo(map).bindPopup("Current location");

  const locations = Loadgeneration(36.9895, -122.0630);
  Marker(map, locations);

  setTimeout(() => {
    map.invalidateSize();
  }, 300);
});

// Generates cache/coin locations around the area
function Loadgeneration(
  lat: number,
  long: number,
): { latitude: number; longitude: number; coin: number }[] {
  const radius = 8;
  const degrees = 0.0001;
  const locations: { latitude: number; longitude: number; coin: number }[] = [];

  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      if (Math.random() < 0.1) {
        const latitude = lat + i * degrees;
        const longitude = long + j * degrees;
        const coin = Math.floor(Math.random() * 10) + 1;
        locations.push({ latitude, longitude, coin });
      }
    }
  }
  return locations;
}

// Creates markers for each cache location
function Marker(
  map: L.Map,
  locations: { latitude: number; longitude: number; coin: number }[],
) {
  locations.forEach((location) => {
    const marker = L.marker([location.latitude, location.longitude]).addTo(map);

    const Memo = () => {
      const Information = document.createElement("div");
      const info = document.createElement("p");
      info.innerHTML = `<b>GiftBox</b><br>Coins: ${location.coin}`;
      Information.appendChild(info);

      //coin collect and placement
      const Collectonecoin = document.createElement("button");
      Collectonecoin.textContent = "Collect 1";
      Collectonecoin.onclick = () => {
        if (location.coin > 0) {
          usercoins += 1;
          location.coin -= 1;
          Updatecounter();
          Memo();
        }
      };
      Information.appendChild(Collectonecoin);

      const placeonecoin = document.createElement("button");
      placeonecoin.textContent = "Place 1";
      placeonecoin.disabled = usercoins === 0;
      placeonecoin.onclick = () => {
        if (usercoins > 0) {
          location.coin += 1;
          usercoins -= 1;
          Updatecounter();
          Memo();
        }
      };
      Information.appendChild(placeonecoin);

      const Collectallcoins = document.createElement("button");
      Collectallcoins.textContent = "Take all";
      Collectallcoins.onclick = () => {
        if (location.coin > 0) {
          usercoins += location.coin;
          location.coin = 0;
          Updatecounter();
          Memo();
        }
      };

      Information.appendChild(Collectallcoins);

      const Placeallcoins = document.createElement("button");
      Placeallcoins.textContent = "Place all";
      Placeallcoins.disabled = usercoins === 0;
      Placeallcoins.onclick = () => {
        if (usercoins > 0) {
          location.coin += usercoins;
          usercoins = 0;
          Updatecounter();
          Memo();
        }
      };
      Information.appendChild(Placeallcoins);

      marker.bindPopup(Information).openPopup();
    };

    Memo();
  });
}

document.body.appendChild(Canvascontainer);
