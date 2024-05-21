class Filter {
  constructor(library) {
    this.library = library;
  }

  getSortedArtists(sortBy, reverse) {
    var artists = this.library.getArtistsBy();
    if (sortBy == "Name") {
      artists.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    } else if (sortBy == "Albums") {
      artists = artists.sort((a, b) => {
        return b.albums.length - a.albums.length;
      });
    } else {
      artists = artists.sort((a, b) => {
        return b.tracks.length - a.tracks.length;
      });
    }

    if(reverse){
        artists.reverse();
    }

    return artists;
  }

  getSortedAlbums(sortBy, reverse) {
    var albums = this.library.getAlbumsBy();
    // albums = albums.
  }
}
