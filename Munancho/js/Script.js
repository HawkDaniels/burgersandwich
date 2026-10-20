// JAVASCRIPT
// ============================================================
// MUNANCHO DIGITAL ARCHIVE
// FILE: /Munancho/js/script.js
//
// PROJECT STRUCTURE
// ------------------------------------------------------------
// /pages/Munancho.html          Main webpage
// /Munancho/albums/       Album cover images
// /Munancho/audio/        Song audio files
// /Munancho/css/Style.css Website appearance
// /Munancho/js/script.js  Album data and player functionality
//
// SECTION GUIDE
// ------------------------------------------------------------
// 01. Album database
// 02. Page elements and saved data
// 03. Album tile generation
// 04. Tracklist generation
// 05. Music playback
// 06. Audio events and initialization
//
// GENERAL RULE
// Edit song names, years, and file paths in Section 01.
// Edit the appearance in Style.css, not in this file.
// ============================================================


// ============================================================
// SECTION 01 — ALBUM DATABASE
//
// PURPOSE:
// Stores the albums and their songs in one organized location.
//
// ALBUM SETTINGS:
// id    = Unique album identifier.
// title = Album title.
// year  = Album release year.
// cover = Path to the cover image.
// songs = Songs belonging to the album.
//
// SONG SETTINGS:
// title = Song title.
// year  = Song release year.
// file  = Path to the song's audio file.
//
// Track numbers are generated from each song's position.
// The first song is track 01, the second is track 02, etc.
// ============================================================

const albums = [
    {
        id: "album1",
        title: "Munanchosis",
        year: 2026,
        cover: "/Munancho/albums/Munanchosis Lens flare 10k.jpg",
        songs: [
            {
                title: "Intro-sis",
                year: 2026,
                file: "/Munancho/audio/Munanchosis/Intro-sis.mp3"
            },
            {
                title: "Moonlight",
                year: 2026,
                file: "/Munancho/audio/Munanchosis/Moonlight.mp3"
            },
            {
                title: "KetObama",
                year: 2026,
                file: "/Munancho/audio/Munanchosis/KetObama.mp3"
            },
            {
                title: "Hotdog Direction",
                year: 2026,
                file: "/Munancho/audio/Munanchosis/Hotdog Direction.mp3"
            },
            {
                title: "Shitting My Pants In Front of Latinas In C Major",
                year: 2026,
                file: "/Munancho/audio/Munanchosis/Shitting My Pants In Front of Latinas In C Major.mp3"
            },
            {
                title: "The Nice Guy Anthem",
                year: 2026,
                file: "/Munancho/audio/Munanchosis/Nice Guy Anthem.mp3"
            },
            {
                title: "Sex In The City On Ice [feat. Jed Kaczynstein]",
                year: 2026,
                file: "/Munancho/audio/Munanchosis/Sex In The City On Ice [feat. Jed Kaczynstein].mp3"
            },
            {
                title: "Big Boss Bars",
                year: 2026,
                file: "/Munancho/audio/Munanchosis/Big Boss Bars.mp3"
            },
            {
                title: "Ladyboy Femboy Trap Newhalf Funtime Summertime",
                year: 2026,
                file: "/Munancho/audio/Munanchosis/Femboy Trap Newhalf Funtime Summertime.mp3"
            },
            {
                title: "Sock Gang Loves You",
                year: 2026,
                file: "/Munancho/audio/Munanchosis/Sock Gang Loves You.mp3"
            },
            {
                title: "Abstinance In The Countryside On Fire",
                year: 2026,
                file: "/Munancho/audio/Munanchosis/Absttnence On The Countryside On Fire.mp3"
            },
            {
                title: "Photos of Synthesis",
                year: 2026,
                file: "/Munancho/audio/Munanchosis/Photosyn-thesis.mp3"
            },
            {
                title: "Outro-sis",
                year: 2026,
                file: "/Munancho/audio/Munanchosis/Outro-sis.mp3"
            }
        ]
    },

    {
        id: "album2",
        title: "Munanchosis Songs That Were Too Good To Be On The Album",
        year: 2026,
        cover: "/Munancho/albums/Munanchosis Extrude - LowQ.jpg",
        songs: [
            {
                title: "Ma Saw My Report Card",
                year: 2026,
                file: "/Munancho/audio/Munanchosis Tracks That Got Cut For Being Too Good/A Time For Reflection (Ma Saw My Report Card).mp3"
            },
            {
                title: "Christopher Is A Litterer",
                year: 2026,
                file: "/Munancho/audio/Munanchosis Tracks That Got Cut For Being Too Good/Coming Clean.mp3"
            },
            {
                title: "Barak Is A Creamer",
                year: 2026,
                file: "/Munancho/audio/Munanchosis Tracks That Got Cut For Being Too Good/Barak Is A Creamer.mp3"
            },
            {
                title: "J-Hope Cow Milker",
                year: 2026,
                file: "/Munancho/audio/Munanchosis Tracks That Got Cut For Being Too Good/J-Hope The Cow Milker.mp3"
            },
            {
                title: "The Happy Cat Arises Part 13",
                year: 2026,
                file: "/Munancho/audio/Munanchosis Tracks That Got Cut For Being Too Good/Happy Cat Rises.mp3"
            },
            {
                title: "Cruise of Sadness",
                year: 2026,
                file: "/Munancho/audio/Munanchosis Tracks That Got Cut For Being Too Good/Cruise of Sadness.mp3"
            }
        ]
    },

    {
        id: "album3",
        title: "Munancho Dies (Coming Soon)",
        year: 2027,
        cover: "/Munancho/albums/Munancho Dies Crystallize.jpg",
        songs: [
            {
                title: "I Am Going to Kill Myself Today",
                year: 2026,
                file: "/Munancho/audio/no-bones-remaining.mp3"
            },
            {
                title: "Unrequited Bruv",
                year: 2026,
                file: "/Munancho/audio/dolphin-frequency.mp3"
            },
            {
                title: "Welcome To Hell",
                year: 2026,
                file: "/Munancho/audio/government-cheese.mp3"
            },
            {
                title: "The Devil's Soliloquy",
                year: 2026,
                file: "/Munancho/audio/government-cheese.mp3"
            },
            {
                title: "Sock Gang Does NOT Jelq On Hanukkah",
                year: 2026,
                file: "/Munancho/audio/government-cheese.mp3"
            },
            {
                title: "Yellow Fever Blues",
                year: 2026,
                file: "/Munancho/audio/government-cheese.mp3"
            },
            {
                title: "The Goon Company",
                year: 2026,
                file: "/Munancho/audio/government-cheese.mp3"
            },
            {
                title: "Jelqing For The Greater Good",
                year: 2026,
                file: "/Munancho/audio/government-cheese.mp3"
            },
            {
                title: "Eyes of Heaven (The Next Goonicide)",
                year: 2026,
                file: "/Munancho/audio/government-cheese.mp3"
            },
            {
                title: "Gooner's Lament",
                year: 2026,
                file: "/Munancho/audio/government-cheese.mp3"
            },
            {
                title: "Goth Girl Under The Table iHoP Syrup Slopjob",
                year: 2026,
                file: "/Munancho/audio/government-cheese.mp3"
            },
            {
                title: "The Decision",
                year: 2026,
                file: "/Munancho/audio/government-cheese.mp3"
            },
            {
                title: "BBC_Charlie_Kirk_Gaping_Cameltoe_Rule_34_Kevin_Stitt_Cuck_Cum_On_Face_Hentai_ASMR_God_X_Satan_Double_and_Dap_Edging_Loser_Humiliation",
                year: 2026,
                file: "/Munancho/audio/government-cheese.mp3"
            }
        ]
    }
];


// ============================================================
// SECTION 02 — PAGE ELEMENTS AND SAVED DATA
//
// PURPOSE:
// Connects JavaScript to the HTML and tracks the current
// album, current song, and saved like counts.
//
// ELEMENT REFERENCES:
// albumGrid       Album tile container.
// trackList       Song row container.
// trackHeading    Selected album heading.
// trackSubheading Album information.
// audioPlayer     Browser audio player.
//
// STATE VARIABLES:
// selectedAlbumIndex = Currently selected album.
// currentTrackIndex  = Currently selected song.
//
// A value of -1 means nothing is selected.
// ============================================================

const albumGrid = document.getElementById("album-grid");
const trackList = document.getElementById("track-list");

const trackHeading = document.getElementById("track-heading");
const trackSubheading = document.getElementById("track-subheading");

const audioPlayer = document.getElementById("audio-player");

const playerTitle = document.getElementById("player-title");
const playerAlbum = document.getElementById("player-album");
const playerArt = document.getElementById("player-art");

const trackSection = document.getElementById("track-section");

let selectedAlbumIndex = -1;
let currentTrackIndex = -1;


// Load locally saved likes.
// If saved data is missing or unreadable, use an empty object.

function loadLikes() {
    try {
        const saved = localStorage.getItem("munancho-likes");
        const parsed = JSON.parse(saved || "{}");

        if (
            parsed !== null &&
            typeof parsed === "object" &&
            !Array.isArray(parsed)
        ) {
            return parsed;
        }
    } catch (error) {
        console.warn("Unable to load saved likes.", error);
    }

    return {};
}

let likes = loadLikes();


// Generate a unique key for each song's like counter.
// Example: album1-track-0 identifies the first song in album1.

function getLikeKey(albumIndex, trackIndex) {
    const album = albums[albumIndex];
    const song = album.songs[trackIndex];

    return `${album.id}-${song.title}`;
}


// Save likes in this browser.
// These counts are local, not shared between visitors.

function saveLikes() {
    try {
        localStorage.setItem("munancho-likes", JSON.stringify(likes));
    } catch (error) {
        console.warn("Unable to save likes.", error);
    }
}


// ============================================================
// SECTION 03 — ALBUM TILE GENERATION
//
// PURPOSE:
// Builds the selectable album tiles from the album database.
//
// CSS CLASSES:
// album-card             Album tile.
// selected               Selected album state.
// album-art              Cover image.
// album-art-placeholder  Fallback artwork.
// album-title            Album name.
// album-meta             Release year and track count.
//
// HOW IT WORKS:
// Each album becomes a button containing artwork and details.
// Clicking the button opens the album and starts track one.
// ============================================================

function renderAlbums() {
    albumGrid.replaceChildren();

    albums.forEach((album, albumIndex) => {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "album-card";

        card.classList.toggle(
            "selected",
            albumIndex === selectedAlbumIndex
        );

        card.setAttribute(
            "aria-pressed",
            String(albumIndex === selectedAlbumIndex)
        );


        // Album artwork and fallback design.
        const artwork = document.createElement("div");

        artwork.className = "album-art album-art-placeholder";
        artwork.textContent = "M//";
        artwork.setAttribute("aria-hidden", "true");

        const cover = document.createElement("img");

        cover.className = "album-art";
        cover.src = album.cover;
        cover.alt = `${album.title} album artwork`;

        cover.addEventListener("error", () => {
            if (cover.isConnected) {
                cover.replaceWith(artwork);
            }
        }, { once: true });


        // Album title.
        const title = document.createElement("h3");

        title.className = "album-title";
        title.textContent = album.title;


        // Album year and number of tracks.
        const details = document.createElement("p");

        details.className = "album-meta";
        details.textContent =
            `${album.year} · ${album.songs.length} tracks`;


        // Assemble the tile.
        card.append(cover, title, details);


        // Open the selected album and start its first song.
        card.addEventListener("click", () => {
            selectAlbum(albumIndex);
        });

        albumGrid.appendChild(card);
    });
}


// Select an album, update the interface, and optionally play it.

function selectAlbum(albumIndex) {
    const album = albums[albumIndex];

    if (!album) {
        return;
    }

    selectedAlbumIndex = albumIndex;
    currentTrackIndex = -1;

    trackHeading.textContent = album.title;

    trackSubheading.textContent =
        `${album.year} · ${album.songs.length} tracks · Munancho Archive`;

    renderAlbums();
    renderTracks();

    // Start at track one when the album tile is selected.
    if (album.songs.length > 0) {
        playTrack(albumIndex, 0);
    }

    trackSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ============================================================
// SECTION 04 — TRACKLIST GENERATION
//
// PURPOSE:
// Builds one row for every song in the selected album.
//
// TRACK ROW ORDER:
// 01. Track number
// 02. Song title
// 03. Release year
// 04. Album name
// 05. Likes
//
// CSS CLASSES:
// track-row      Entire song row.
// playing        Currently selected song.
// track-number   Track number.
// track-name     Clickable song title.
// track-year     Song year.
// track-album    Album name.
// like-button    Song's like counter.
//
// IMPORTANT:
// Keep this element order consistent with the CSS grid.
// ============================================================

function renderTracks() {
    trackList.replaceChildren();

    // Show a message when no album is selected.
    if (
        selectedAlbumIndex < 0 ||
        !albums[selectedAlbumIndex]
    ) {
        const message = document.createElement("p");

        message.className = "empty-message";
        message.textContent = "Awaiting archive selection...";

        trackList.appendChild(message);
        return;
    }

    const album = albums[selectedAlbumIndex];

    album.songs.forEach((song, trackIndex) => {
        const row = document.createElement("div");

        row.className = "track-row";

        if (trackIndex === currentTrackIndex) {
            row.classList.add("playing");
        }


        // COLUMN 01 — Track number.
        const number = document.createElement("span");

        number.className = "track-number";
        number.textContent = String(trackIndex + 1).padStart(2, "0");


        // COLUMN 02 — Clickable song title.
        const title = document.createElement("button");

        title.type = "button";
        title.className = "track-name";
        title.textContent = song.title;

        title.addEventListener("click", () => {
            playTrack(selectedAlbumIndex, trackIndex);
        });


        // COLUMN 03 — Release year.
        const year = document.createElement("span");

        year.className = "track-year";
        year.textContent = song.year;


        // COLUMN 04 — Album name.
        const albumName = document.createElement("span");

        albumName.className = "track-album";
        albumName.textContent = album.title;


        // COLUMN 05 — Like counter.
        const likeKey = getLikeKey(selectedAlbumIndex, trackIndex);
        const count = likes[likeKey] || 0;

        const likeButton = document.createElement("button");

        likeButton.type = "button";
        likeButton.className = "like-button";
        likeButton.textContent = `♡ ${count}`;

        likeButton.setAttribute(
            "aria-label",
            `Like ${song.title}. ${count} likes`
        );


        // Increase the count and save it locally.
        likeButton.addEventListener("click", () => {
            likes[likeKey] = (likes[likeKey] || 0) + 1;

            saveLikes();
            renderTracks();
        });


        // Assemble the row in the same order as the CSS columns.
        row.append(number, title, year, albumName, likeButton);

        trackList.appendChild(row);
    });
}


// ============================================================
// SECTION 05 — MUSIC PLAYBACK
//
// PURPOSE:
// Loads the selected song and updates the persistent player.
//
// WHAT THIS FUNCTION CHANGES:
// audioPlayer.src  Audio file being played.
// playerTitle      Current song name.
// playerAlbum      Current album name.
// playerArt        Mini album artwork.
// currentTrackIndex Active track highlight.
//
// Selecting a song also updates the album selection if needed.
// ============================================================

function playTrack(albumIndex, trackIndex) {
    const album = albums[albumIndex];

    if (!album || !album.songs[trackIndex]) {
        return;
    }

    const song = album.songs[trackIndex];

    selectedAlbumIndex = albumIndex;
    currentTrackIndex = trackIndex;


    // Keep the archive heading synchronized with the player.
    trackHeading.textContent = album.title;

    trackSubheading.textContent =
        `${album.year} · ${album.songs.length} tracks · Munancho Archive`;


    // Load the song.
    audioPlayer.src = song.file;
    audioPlayer.load();


    // Update the persistent player text.
    playerTitle.textContent = song.title;
    playerAlbum.textContent = album.title;


    // Update the mini artwork.
    playerArt.textContent = "M//";
    playerArt.style.backgroundImage = `url("${album.cover}")`;
    playerArt.style.backgroundSize = "cover";
    playerArt.style.backgroundPosition = "center";


    // Refresh the album selection and track highlight.
    renderAlbums();
    renderTracks();


    // Attempt playback. Browser policies or missing files can
    // prevent playback, so provide a useful fallback message.
    audioPlayer.play().catch((error) => {
        if (error.name === "AbortError") {
            return;
        }

        playerAlbum.textContent =
            `${album.title} · Press play to start`;

        console.warn("Playback failed. Check the audio file path.", error);
    });
}


// ============================================================
// SECTION 06 — AUDIO EVENTS AND INITIALIZATION
//
// PURPOSE:
// Handles track completion, reports missing audio files,
// and builds the initial album grid.
//
// AUTO-ADVANCE:
// Finished songs advance to the next song in the same album.
// The final song does not loop back to track one.
// ============================================================


// Automatically play the next song when the current one ends.

audioPlayer.addEventListener("ended", () => {
    const album = albums[selectedAlbumIndex];

    if (
        !album ||
        currentTrackIndex < 0 ||
        currentTrackIndex >= album.songs.length
    ) {
        return;
    }

    if (currentTrackIndex < album.songs.length - 1) {
        playTrack(selectedAlbumIndex, currentTrackIndex + 1);
    }
});


// Show a helpful message if an audio file fails to load.

audioPlayer.addEventListener("error", () => {
    if (!audioPlayer.currentSrc) {
        return;
    }

    playerAlbum.textContent =
        "Audio unavailable · Check the file path";
});


// Draw the album tiles and initial empty tracklist.

renderAlbums();
renderTracks();