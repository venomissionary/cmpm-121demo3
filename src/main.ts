import * as L from "leaflet";
import "./leafletWorkaround.ts";

let Usercoins: number = parseInt(
  globalThis.localStorage.getItem("Usercoin") || "0",
  10,
);

let Pastmovement: L.LatLng[] = JSON.parse(
  globalThis.localStorage.getItem("Pastmovements") || "[]",
);

let Movementpath: L.Polyline;
let Userposition = JSON.parse(
  globalThis.localStorage.getItem("Userpositions") ||
    JSON.stringify({ latitude: 36.9895, longitude: -122.063 }),
);

let Storage: Record<string, string> = JSON.parse(
  globalThis.localStorage.getItem("Cachedata") || "{}",
);

// Page container
const Canvascontainer = document.createElement("div");
Canvascontainer.id = "canvascontainer";
Canvascontainer.style.padding = "200px";

// Coin counter display
const CoinCounter = document.createElement("div");
CoinCounter.style.position = "absolute";
CoinCounter.style.top = "150px";
CoinCounter.style.right = "30px";
CoinCounter.style.padding = "10px 20px";
CoinCounter.style.color = "#FFFF00";
CoinCounter.style.fontSize = "42px";
CoinCounter.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.5)";
CoinCounter.textContent = `Coins collected: ${Usercoins}`;
document.body.appendChild(CoinCounter);

const MainTitle = document.createElement("h1");
MainTitle.style.position = "absolute";
MainTitle.style.top = "20px";
MainTitle.style.right = "5px";
MainTitle.style.padding = "10px 20px";
MainTitle.style.color = "#FFFFFF";
MainTitle.style.fontSize = "50px";
MainTitle.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.5)";
MainTitle.textContent = `Geocoin Carrier `;

document.body.appendChild(MainTitle);

// Update the coin counter display
function Updatecounter() {
  CoinCounter.textContent = `Coins collected: ${Usercoins}`;
  globalThis.localStorage.setItem("Usercoin", Usercoins.toString());
}

function Saveuserpostition() {
  globalThis.localStorage.setItem(
    "Userpositions",
    JSON.stringify(Userposition),
  );
}

function Savemovementpath() {
  globalThis.localStorage.setItem(
    "Pastmovements",
    JSON.stringify(Pastmovement),
  );
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

  Movementpath = L.polyline(Pastmovement, { color: "red" }).addTo(map);

  // User movement controls
  const Movementbutton = document.createElement("div");
  Movementbutton.style.position = "absolute";
  Movementbutton.style.top = "340px";
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

      Pastmovement.push([Userposition.latitude, Userposition.longitude]);
      Movementpath.setLatLngs(Pastmovement);

      Saveuserpostition();
      Savemovementpath();
    };

    Movementbutton.appendChild(button);
  });

  //extra user controls
  const Controlbutton = document.createElement("div");
  Controlbutton.style.position = "absolute";
  Controlbutton.style.top = "250px";
  Controlbutton.style.right = "60px";
  Controlbutton.style.padding = "10px 20px";
  Controlbutton.style.color = "#ffffff";
  Controlbutton.style.fontSize = "28px";
  Controlbutton.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.5)";
  document.body.appendChild(Controlbutton);

  // Relocate to custom geolocation
  const Locationbutton = document.createElement("button");
  Locationbutton.textContent = "Custom geolocation";
  Locationbutton.style.margin = "5px";
  Locationbutton.onclick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        Userposition.latitude = position.coords.latitude;
        Userposition.longitude = position.coords.longitude;

        map.setView([Userposition.latitude, Userposition.longitude], 18);
        Pastmovement = [];
        Movementpath.setLatLngs([]);
        const Newallocations = Loadgeneration(
          Userposition.latitude,
          Userposition.longitude,
        );
        Marker(map, Newallocations);

        Saveuserpostition();
        Savemovementpath();
      });
    } else {
      alert("Your browser is not supported :( ");
    }
  };
  Controlbutton.appendChild(Locationbutton);

  // Reset map layout
  const Resetbutton = document.createElement("button");
  Resetbutton.textContent = "Reset map";
  Resetbutton.style.margin = "5px";
  Resetbutton.onclick = () => {
    const Fullreset = confirm(
      "Do you want to reset the map? This will erase all progress. :|",
    );
    if (Fullreset) {
      globalThis.localStorage.clear();
      Usercoins = 0;
      Pastmovement = [];
      Storage = {};
      Movementpath.setLatLngs([]);
      Userposition = { latitude: 36.9895, longitude: -122.063 };

      map.setView([Userposition.latitude, Userposition.longitude], 18);
      const Originalocation = Loadgeneration(
        Userposition.latitude,
        Userposition.longitude,
      );
      Marker(map, Originalocation);
      Updatecounter();
    }
  };
  Controlbutton.appendChild(Resetbutton);

  const Currentlocation = Loadgeneration(
    Userposition.latitude,
    Userposition.longitude,
  );
  Marker(map, Currentlocation);

  globalThis.addEventListener("beforeunload", () => {
    globalThis.localStorage.setItem("Cachedata", JSON.stringify(Storage));
  });
});

// Creates a grid within the map
function Gridsystem(
  latitude: number,
  longitude: number,
): { i: number; j: number } {
  return {
    i: Math.round(latitude * 10000),
    j: Math.round(longitude * 10000),
  };
}

// Stores in cache data
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
      info.innerHTML = `<b>COIN GIFTBOX</b><br>Coins: ${location.coin}`;

      const Coinserial = location.serials.map((serial) => `<li>${serial}</li>`);
      info.innerHTML = `<b>COIN GIFTBOX</b><br>Coins: ${location.coin}<br><ul>${
        Coinserial.join("")
      }</ul>`;

      Information.appendChild(info);

      // Coin collect and placement including serial assignment
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

      const Placeonecoin = document.createElement("button");
      Placeonecoin.textContent = "Place 1";
      Placeonecoin.disabled = Usercoins === 0;
      Placeonecoin.onclick = () => {
        if (Usercoins > 0) {
          location.coin += 1;
          const { i: cordI, j: cordJ } = Gridsystem(
            location.latitude,
            location.longitude,
          );
          const Newserial = `${cordI}:${cordJ}#${location.coin - 1}`;
          location.serials.push(Newserial);
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
      Information.appendChild(Placeonecoin);

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
          const Newserial = Array.from(
            { length: Usercoins },
            (_, serial) => `${cordI}:${cordJ}#${location.coin + serial}`,
          );
          location.serials.push(...Newserial);
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
