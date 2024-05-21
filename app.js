// Elements
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");
const contentSection = document.getElementById("content-section");
const artistsSortBtn = document.getElementById("artists-sort-button");
const artistsReverse = document.getElementById("artists-reversed");


// Configuration variables
let CLIENT_ID;
let REDIRECT_URI;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPE = "user-library-read";

let library = new Library();
let api = new ApiInterface(null, library);
let filter = new Filter(library);

// Fetch environment variables from the server
fetch("/env")
  .then((response) => response.json())
  .then((data) => {
    CLIENT_ID = data.SPOTIFY_CLIENT_ID;
    REDIRECT_URI = data.SPOTIFY_REDIRECT_URI;
  })
  .catch((error) =>
    console.error("Error fetching environment variables:", error)
  );

// Check for token in URL or local storage
let token = localStorage.getItem("token");
const hash = window.location.hash;

if (!token && hash) {
  const hashParams = new URLSearchParams(hash.substring(1));
  token = hashParams.get("access_token");
  window.location.hash = "";
  localStorage.setItem("token", token);
}

if (token) {
  api.token = token;
  showContent();
} else {
  showLogin();
}

// Event listeners
loginButton.addEventListener("click", () => {
  window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("token");
  token = null;
  api.token = token;
  showLogin();
});

artistsSortBtn.addEventListener("click", () => {
  var options = ["Name", "Albums", "Tracks"]
  var index = Math.max(0, options.indexOf(artistsSortBtn.innerText));
  artistsSortBtn.innerHTML = options[(index + 1) % options.length];
  renderArtists()
})

artistsReverse.addEventListener('click', () => {
  renderArtists()
})

// Functions
function showLogin() {
  loginButton.disabled = false;
  logoutButton.disabled = true;
  contentSection.style.display = "none";
}

async function showContent() {
  loginButton.disabled = true;
  logoutButton.disabled = false;
  contentSection.style.display = "flex";

  await api.fetchFromSpotify();

  renderAlbums();
  renderArtists();
  renderTracks();
}

function renderArtists() {
  let artists = filter.getSortedArtists(artistsSortBtn.innerText, artistsReverse.checked);
  let selected = library.selectedArtistIds;

  artistsList = document.getElementById("artists-list");
  artistsList.innerHTML = "";
  
  artists.forEach((artist) => {
    const artistDiv = document.createElement("div");
    artistDiv.className = "artist";
    artistDiv.setAttribute("key", artist.id);

    if (selected.includes(artist.id)) {
      artistDiv.classList.add("selected");
    }

    artistDiv.addEventListener("click", (e) => {
      library.handleArtistClick(artist.id, e.ctrlKey);

      // Remove selected class from all elements if Ctrl is not pressed
      if (!e.ctrlKey) {
        document.querySelectorAll('.artist.selected').forEach(el => {
          el.classList.remove('selected');
        });
      }

      // Toggle the selected class on the clicked element
      artistDiv.classList.toggle("selected", library.selectedArtistIds.includes(artist.id));
      renderAlbums()
      renderTracks()
    });

    const artistInfoDiv = document.createElement("div");
    artistInfoDiv.className = "artist-info";

    const artistNameP = document.createElement("p");
    artistNameP.className = "artist-name";
    artistNameP.innerHTML = `<b>${artist.name}</b>`;
    artistInfoDiv.appendChild(artistNameP);

    const artistStatsDiv = document.createElement("div");
    artistStatsDiv.className = "artist-stats";

    const albumsCountP = document.createElement("p");
    albumsCountP.textContent = `${artist.albums.length} Albums`;
    artistStatsDiv.appendChild(albumsCountP);

    const tracksCountP = document.createElement("p");
    tracksCountP.textContent = `${artist.tracks.length} Tracks`;
    artistStatsDiv.appendChild(tracksCountP);

    artistDiv.appendChild(artistInfoDiv);
    artistDiv.appendChild(artistStatsDiv);

    artistsList.appendChild(artistDiv);
  });
}

function renderAlbums() {
  console.log("Rendering albums")
  let albums = library.getAlbumsBy()
  let selected = library.selectedAlbumIds;

  artistsList = document.getElementById("albums-list");
  artistsList.innerHTML = "";

  //appends each album div to the list
  albums.forEach((album) => {
    const albumDiv = document.createElement("div");
    albumDiv.className = "album";
    albumDiv.setAttribute("key", album.id);

    albumDiv.addEventListener("click", (e) => {
      library.handleAlbumClick(album.id, e.ctrlKey);

      // Remove selected class from all elements if Ctrl is not pressed
      if (!e.ctrlKey) {
        document.querySelectorAll('.album.selected').forEach(el => {
          el.classList.remove('selected');
        });
      }

      // Toggle the selected class on the clicked element
      albumDiv.classList.toggle("selected", library.selectedAlbumIds.includes(album.id));
      renderTracks()
    });

    const img = document.createElement("img");
    img.src = album.imageUrl;
    img.alt = album.name;
    albumDiv.appendChild(img);

    const albumInfoDiv = document.createElement("div");
    albumInfoDiv.className = "album-info";

    const albumNameP = document.createElement("p");
    albumNameP.className = "album-name";
    albumNameP.innerHTML = `<b>${album.name}</b>`;
    albumInfoDiv.appendChild(albumNameP);

    const artistNameP = document.createElement("p");
    artistNameP.className = "album-name";
    artistNameP.textContent = album.artist.name;
    albumInfoDiv.appendChild(artistNameP);

    albumDiv.appendChild(albumInfoDiv);

    artistsList.appendChild(albumDiv);
  });
}

function renderTracks() {
  tracks = library.getTracksBy()
  artistsList = document.getElementById("tracks-list");
  artistsList.innerHTML = "";

  //appends each track div to the list

  tracks.forEach((track) => {
    const trackDiv = document.createElement("div");
    trackDiv.className = "track";
    trackDiv.setAttribute("key", track.id);
    // trackDiv.onclick((e) => {
    //   library.handleSelectedTrack(track);
    // })

    const img = document.createElement("img");
    img.src = track.album.imageUrl;
    img.alt = track.album.name;
    trackDiv.appendChild(img);

    const trackInfoDiv = document.createElement("div");
    trackInfoDiv.className = "track-info";

    const trackNameP = document.createElement("p");
    trackNameP.className = "track-name";
    trackNameP.innerHTML = `<b>${track.name}</b>`;
    trackInfoDiv.appendChild(trackNameP);

    const albumNameP = document.createElement("p");
    albumNameP.className = "track-name";
    albumNameP.innerHTML = track.album.name;
    trackInfoDiv.appendChild(albumNameP);

    const artistNameP = document.createElement("p");
    artistNameP.className = "track-name";
    artistNameP.textContent = track.artist.name;
    trackInfoDiv.appendChild(artistNameP);

    trackDiv.appendChild(trackInfoDiv);

    artistsList.appendChild(trackDiv);
  });
}
