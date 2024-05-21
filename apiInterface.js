class ApiInterface {
  constructor(token, library) {
    this.token = token;
    this.library = library;
    this.albumJson = [];
    this.trackJson = [];
  }

  async fetchFromSpotify() {
    var shortFetch = false;
    // Clear existing album and track data
    this.albumJson = [];
    this.trackJson = [];

    // Fetch albums from Spotify
    let fetchUrl = "https://api.spotify.com/v1/me/albums";

    while (fetchUrl) {
      try {
        const response = await axios.get(fetchUrl, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params: {
            limit: 50,
          },
        });

        const { items, next } = response.data;
        items.forEach((item) => {
          this.library.addAlbum(item.album);
        });

        fetchUrl = next;
        if (shortFetch) fetchUrl = null; //uncomment to limit to 50 tracks
      } catch (error) {
        console.error("Failed to fetch albums:", error);
        break;
      }
    }
    console.log("Pulled albums from Spotify");

    // Fetch tracks from Spotify
    fetchUrl = "https://api.spotify.com/v1/me/tracks";
    while (fetchUrl) {
      try {
        const response = await axios.get(fetchUrl, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params: {
            limit: 50,
          },
        });

        const { items, next } = response.data;
        items.forEach((item) => {
          this.library.addTrack(item.track);
        });

        fetchUrl = next;
        if (shortFetch) fetchUrl = null; //uncomment to limit to 50 tracks
      } catch (error) {
        console.error("Failed to fetch tracks:", error);
        break;
      }
    }
    console.log("Pulled tracks from Spotify");

    // Save library data to local storage
    // this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    localStorage.setItem("albums", JSON.stringify(this.albumJson));
    localStorage.setItem("tracks", JSON.stringify(this.trackJson));

    console.log("Saved library data to local storage");
  }

  async fetchDataFromLocalStorage() {
    const storedAlbums = JSON.parse(localStorage.getItem("albums"));
    const storedTracks = JSON.parse(localStorage.getItem("tracks"));

    if (storedAlbums && storedTracks) {
      // Clear existing library data
      this.library.clear();

      // Add albums and tracks to the library
      storedAlbums.forEach((albumJson) => {
        this.library.addAlbum(albumJson);
      });

      storedTracks.forEach((trackJson) => {
        this.library.addTrack(trackJson);
      });

      console.log("Pulled library data from local storage");
    } else {
      console.log("No local storage data: pulling from API");
      this.fetchFromSpotify();
    }
  }
}
