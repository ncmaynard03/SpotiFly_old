function containsIdenticalObject(array, obj) {
  return array.some((item) => item.name === obj.name);
}

function getIdenticalObject(array, obj) {
  var identObject = null;
  array.forEach((item) => {
    if (item.name.localeCompare(obj.name) == 0) {
      identObject = item;
    }
  });
  return identObject;
}

class Library {
  constructor() {
    this.artists = new Map();
    this.selectedArtistIds = [];
    this.albums = new Map();
    this.selectedAlbumIds = [];
    this.tracks = new Map();
  }

  addAlbum(json) {
    var album = new Album(json);
    this.albums.set(album.id, album);

    var artistId = json.artists[0].id;
    if (!this.artists.has(artistId)) {
      this.artists.set(artistId, new Artist(json.artists[0]));
    }
    var artist = this.artists.get(artistId);

    album.artist = artist;
    artist.addAlbum(album);
  }

  addTrack(json) {
    let track = new Track(json);
    this.tracks.set(track.id, track);

    let artistId = json.artists[0].id;
    var artist = this.artists.get(artistId);
    if (!this.artists.has(artistId)) {
      artist = new Artist(json.artists[0]);
      this.artists.set(artistId, artist);
    }
    track.artist = artist;
    artist.addTrack(track);

    let albumId = json.album.id;
    var album = this.albums.get(albumId);
    if (!this.albums.has(albumId)) {
      album = new Album(json.album);
      album.artist = artist;
      this.albums.set(albumId, album);
      artist.addAlbum(album);
    }
    track.album = album;
  }

  getAlbumsBy() {
    var tempAlbums = Array.from(this.albums, (item) => item[1]);
    if (this.selectedArtistIds.length > 0) {
      tempAlbums = tempAlbums.filter((album) =>
        this.selectedArtistIds.includes(album.artist.id)
      );
    }

    return tempAlbums;
  }

  getArtistsBy() {
    var tempArtists = Array.from(this.artists, (item) => item[1]);
    return tempArtists;
  }

  getTracksBy() {
    var tempTracks = Array.from(this.tracks, (item) => item[1]);
    if (this.selectedArtistIds.length > 0) {
      tempTracks = tempTracks.filter((track) =>
        this.selectedArtistIds.includes(track.artist.id)
      );
    }

    if (this.selectedAlbumIds.length > 0) {
      tempTracks = tempTracks.filter((track) =>
        this.selectedAlbumIds.includes(track.album.id)
      );
    }

    return tempTracks;
  }

  handleArtistClick(artistId, ctrl) {
    if (this.selectedArtistIds.includes(artistId)) {
      let index = this.selectedArtistIds.indexOf(artistId);
      this.selectedArtistIds.splice(index, 1);
      let artist = this.artists.get(artistId);
      artist.albums.forEach((album) => {
        if(this.selectedAlbumIds.includes(album.id)){
          let albumInd = this.selectedAlbumIds.indexOf(album.id);
          this.selectedAlbumIds.splice(albumInd, 1);
        }
      })
    } else {
      if (!ctrl) {
        this.selectedArtistIds = [];
        this.selectedAlbumIds = [];
      }
      this.selectedArtistIds.push(artistId);
    }
  }

  handleAlbumClick(albumId, ctrl) {
    console.log("handling click: " + this.albums.get(albumId).name)
    if (this.selectedAlbumIds.includes(albumId)) {
      let index = this.selectedAlbumIds.indexOf(albumId);
      this.selectedAlbumIds.splice(index, 1);
    } else {
      if (!ctrl) {
        this.selectedAlbumIds = [];
      }
      this.selectedAlbumIds.push(albumId);
    }
  }
}

class Album {
  constructor(json) {
    this.name = json.name;
    this.id = json.id;
    this.artist = null;
    this.imageUrl = json.images[0].url;
  }
}

class Artist {
  constructor(json) {
    this.name = json.name;
    this.id = json.id;
    this.albums = [];
    this.tracks = [];
  }

  addAlbum(album) {
    this.albums.push(album);
  }

  addTrack(track) {
    this.tracks.push(track);
  }
}

class Track {
  constructor(json) {
    this.album = null;
    this.artist = null;
    this.id = json.id;
    this.name = json.name;
  }
}
