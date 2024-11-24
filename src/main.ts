import * as L from "leaflet";
import "./leafletWorkaround.ts";

let Usercoins = 0;
const Userposition = { latitude: 36.9895, longitude: -122.063 };
const Storage: Record<string, string> = {};

// Page container
const Canvascontainer = document.createElement("div");
Canvascontainer.id = "canvascontainer";
Canvascontainer.style.padding = "200px";

// Coin counter display
const CoinCounter = document.createElement("div");
CoinCounter.style.position = "absolute";
CoinCounter.style.top = "10px";
CoinCounter.style.right = "80px";
CoinCounter.style.padding = "10px 20px";
CoinCounter.style.color = "#ffffff";
CoinCounter.style.fontSize = "28px";
CoinCounter.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.5)";
CoinCounter.textContent = `Coins collected: ${Usercoins}`;
document.body.appendChild(CoinCounter);

// Update the coin counter display
function Updatecounter() {
  CoinCounter.textContent = `Coins collected: ${Usercoins}`;
}

// Load the map
document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map", {
    dragging: false,
    zoomControl: false,
    minZoom: 18,
    maxZoom: 18,
  }).setView([Userposition.latitude, Userposition.longitude], 18);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  //User movement controls
  const Movementbutton = document.createElement("div");
  Movementbutton.style.position = "absolute";
  Movementbutton.style.top = "80px";
  Movementbutton.style.right = "30px";
  Movementbutton.style.padding = "10px 20px";
  Movementbutton.style.color = "#ffffff";
  Movementbutton.style.fontSize = "28px";
  Movementbutton.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.5)";
  document.body.appendChild(Movementbutton);

  ["Up", "Left", "Right", "Down"].forEach((label) => {
    const button = document.createElement("button");
    button.textContent = label;
    button.style.fontSize = "16px";
    button.style.padding = "10px 15px";
    button.style.margin = "5px";

    button.onclick = () => {
      if (label === "Up") Userposition.latitude += 0.0001;
      if (label === "Left") Userposition.longitude -= 0.0001;
      if (label === "Down") Userposition.latitude -= 0.0001;
      if (label === "Right") Userposition.longitude += 0.0001;

      map.setView([Userposition.latitude, Userposition.longitude], 18);
    };

    Movementbutton.appendChild(button);
  });
  const Initallocations = Loadgeneration(
    Userposition.latitude,
    Userposition.longitude,
  );
  Marker(map, Initallocations);
});

//creates a grid within the map
function Gridsystem(
  latitude: number,
  longitude: number,
): { i: number; j: number } {
  return {
    i: Math.round(latitude * 10000),
    j: Math.round(longitude * 10000),
  };
}

//stores in cache data
class Mapcache {
  constructor(
    public latitude: number,
    public longitude: number,
    public coin: number,
    public serials: string[],
  ) {}

  toMomento(): string {
    return JSON.stringify({ coin: this.coin, serials: this.serials });
  }

  fromMomento(momento: string): void {
    const { coin, serials } = JSON.parse(momento);
    this.coin = coin;
    this.serials = serials;
  }
}

// Generates cache/coin/serial locations around the area
function Loadgeneration(lat: number, long: number): Mapcache[] {
  const radius = 8;
  const degrees = 0.0001;
  const locations: Mapcache[] = [];

  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      if (Math.random() < 0.1) {
        const latitude = lat + i * degrees;
        const longitude = long + j * degrees;
        const coin = Math.floor(Math.random() * 10) + 1;

        const { i: cordI, j: cordJ } = Gridsystem(latitude, longitude);
        const serials = Array.from(
          { length: coin },
          (_, serial) => `${cordI}:${cordJ}#${serial}`,
        );

        const mapCache = new Mapcache(latitude, longitude, coin, serials);
        const key = `${cordI}:${cordJ}`;
        if (Storage[key]) {
          mapCache.fromMomento(Storage[key]);
        } else {
          Storage[key] = mapCache.toMomento();
        }

        locations.push(mapCache);
      }
    }
  }

  return locations;
}

// Creates markers for each cache location
function Marker(map: L.Map, locations: Mapcache[]) {
  const group = L.layerGroup().addTo(map);
  locations.forEach((location) => {
    const marker = L.marker([location.latitude, location.longitude]).addTo(
      group,
    );

    const Memo = () => {
      const Information = document.createElement("div");
      const info = document.createElement("p");
      info.innerHTML = `<b>GiftBox</b><br>Coins: ${location.coin}`;

      const Coinserial = location.serials.map((serial) => `<li>${serial}</li>`);
      info.innerHTML = `<b>GiftBox</b><br>Coins: ${location.coin}<br><ul>${
        Coinserial.join("")
      }</ul>`;

      Information.appendChild(info);

      //coin collect and placement including serial assignment
      const Collectonecoin = document.createElement("button");
      Collectonecoin.textContent = "Collect 1";
      Collectonecoin.onclick = () => {
        if (location.coin > 0) {
          Usercoins += 1;
          location.serials.pop();
          location.coin -= 1;
          Storage[
            `${Gridsystem(location.latitude, location.longitude).i}:${
              Gridsystem(location.latitude, location.longitude).j
            }`
          ] = location.toMomento();
          Updatecounter();
          Memo();
        }
      };
      Information.appendChild(Collectonecoin);

      const placeonecoin = document.createElement("button");
      placeonecoin.textContent = "Place 1";
      placeonecoin.disabled = Usercoins === 0;
      placeonecoin.onclick = () => {
        if (Usercoins > 0) {
          location.coin += 1;
          const { i: cordI, j: cordJ } = Gridsystem(
            location.latitude,
            location.longitude,
          );
          const ThisSerial = `${cordI}:${cordJ}#${location.coin - 1}`;
          location.serials.push(ThisSerial);
          Usercoins -= 1;
          Storage[
            `${Gridsystem(location.latitude, location.longitude).i}:${
              Gridsystem(location.latitude, location.longitude).j
            }`
          ] = location.toMomento();
          Updatecounter();
          Memo();
        }
      };
      Information.appendChild(placeonecoin);

      const Collectallcoins = document.createElement("button");
      Collectallcoins.textContent = "Take all";
      Collectallcoins.onclick = () => {
        if (location.coin > 0) {
          Usercoins += location.coin;
          location.serials = [];
          location.coin = 0;
          Storage[
            `${Gridsystem(location.latitude, location.longitude).i}:${
              Gridsystem(location.latitude, location.longitude).j
            }`
          ] = location.toMomento();
          Updatecounter();
          Memo();
        }
      };

      Information.appendChild(Collectallcoins);

      const Placeallcoins = document.createElement("button");
      Placeallcoins.textContent = "Place all";
      Placeallcoins.disabled = Usercoins === 0;
      Placeallcoins.onclick = () => {
        if (Usercoins > 0) {
          const { i: cordI, j: cordJ } = Gridsystem(
            location.latitude,
            location.longitude,
          );
          const ThisSerial = Array.from(
            { length: Usercoins },
            (_, serial) => `${cordI}:${cordJ}#${location.coin + serial}`,
          );
          location.serials.push(...ThisSerial);
          location.coin += Usercoins;
          Usercoins = 0;
          Storage[
            `${Gridsystem(location.latitude, location.longitude).i}:${
              Gridsystem(location.latitude, location.longitude).j
            }`
          ] = location.toMomento();
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
