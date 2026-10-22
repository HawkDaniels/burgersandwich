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
// /Munancho/audio/cues/   Navigation sound cues
// /Munancho/css/Style.css Website appearance
// /Munancho/js/script.js  Album data and player functionality
//
// SECTION GUIDE
// ------------------------------------------------------------
// 01. Album database
// 02. Page elements and saved data
//     02A. Element references
//     02B. Playback state and album progress
//     02C. Saved likes
// 03. Album tile generation
//     03A. Album tiles
//     03B. Album selection
// 04. Tracklist generation
//     04A. Track rows
//     04B. About bubble
// 05. Music playback
// 06. Audio events and initialization
// 07. Navigation cues and page views
//     07A. Cue files
//     07B. Cue playback
//     07C. Page views
// 08. Lore expander
//
// GENERAL RULE
// Edit song names, years, file paths, and about text in Section 01.
// Edit sound cue files in Section 07A.
// Edit the appearance in Style.css, not in this file.
// ============================================================


// ============================================================
// SECTION 01 — ALBUM DATABASE
//
// PURPOSE:
// Stores the albums and their songs in one organized location.
//
// ALBUM SETTINGS:
// id     = Unique album identifier.
// title  = Album title.
// year   = Album release year.
// cover  = Path to the cover image.
// accent = Album color as "red, green, blue" (0-255).
// songs  = Songs belonging to the album.
//
// SONG SETTINGS:
// title = Song title.
// year  = Song release year.
// file  = Path to the song's audio file.
// about = Text shown in the "About this song" bubble.
//
// Track numbers are generated from each song's position.
// The first song is track 01, the second is track 02, etc.
// ============================================================

const albums = [
    {
        id: "album1",
        title: "Munanchosis",
        year: 2026,
        cover: "../Munancho/albums/Munanchosis Lens flare 10k.jpg",
        accent: "255, 140, 66",   // album1: placeholder
        songs: [
            {
                title: "Intro-sis",
                year: 2026,
                file: "../Munancho/audio/Munanchosis/Intro-sis.mp3",
                about: "This track was made by the Cheese and orignally had double the length with a genius skit at the end. This has been removed by a sound surgeon from Interpol."
            },
            {
                title: "Moonlight",
                year: 2026,
                file: "../Munancho/audio/Munanchosis/Moonlight.mp3",
                about: "Based off a freestyle over an instrumental found online, the lyrics of the track are almost entirely improvised."
            },
            {
                title: "KetObama",
                year: 2026,
                file: "../Munancho/audio/Munanchosis/KetObama.mp3",
                about: "Written during the live television ketosis stunt. The Cheese was blacklisted by several countries while recording this song."
            },
            {
                title: "Hotdog Direction",
                year: 2026,
                file: "../Munancho/audio/Munanchosis/Hotdog Direction.mp3",
                about: "Made in one night, this track is an exploration on a direction that was discovered while cooking (although not cooking Hotdogs).Also, the hot dog on the original demo tape has been carbon-dated to 1724."
            },
            {
                title: "Shitting My Pants In Front of Latinas In C Major",
                year: 2026,
                file: "../Munancho/audio/Munanchosis/Shitting My Pants In Front of Latinas In C Major.mp3",
                about: "Based on a real incident from the Crunch on a cruise ship, this song could've only been recorded in international waters."
            },
            {
                title: "The Nice Guy Anthem",
                year: 2026,
                file: "../Munancho/audio/Munanchosis/Nice Guy Anthem.mp3",
                about: "Standing up for the nice guys, this track actually features singing from a real Nice Guy, although he refused to be credited."
            },
            {
                title: "Sex In The City On Ice [feat. Jed Kaczynstein]",
                year: 2026,
                file: "../Munancho/audio/Munanchosis/Sex In The City On Ice [feat. Jed Kaczynstein].mp3",
                about: "A winter spectacular performed on a frozen Mecca, Japan. Jed Kaczynstein recorded his verse in one afternoon and has refused to leave the booth since."
            },
            {
                title: "Big Boss Bars",
                year: 2026,
                file: "../Munancho/audio/Munanchosis/Big Boss Bars.mp3",
                about: "Some people have never found this track, although no attempts were ever made to hide it in the first place. Christopher claims he wrote this on a napkin. Barak claims the napkin wrote it."
            },
            {
                title: "Ladyboy Femboy Trap Newhalf Funtime Summertime",
                year: 2026,
                file: "../Munancho/audio/Munanchosis/Femboy Trap Newhalf Funtime Summertime.mp3",
                about: "Officially rated Summer by the Munancho Ethics Board. Best played at 3 BPM with the windows down."
            },
            {
                title: "Sock Gang Loves You",
                year: 2026,
                file: "../Munancho/audio/Munanchosis/Sock Gang Loves You.mp3",
                about: "Sock Gang has been wanted by the government for over 6 days. Some say their pairs have never matched."
            },
            {
                title: "Abstinance In The Countryside On Fire",
                year: 2026,
                file: "../Munancho/audio/Munanchosis/Absttnence On The Countryside On Fire.mp3",
                about: "The Arbitrators of Abstinance continue to abuse their powers to this day.... for me at least."
            },
            {
                title: "Photos of Synthesis",
                year: 2026,
                file: "../Munancho/audio/Munanchosis/Photosyn-thesis.mp3",
                about: "Made using only the sounds of one houseplant (The Crunch) and one very patient microphone."
            },
            {
                title: "Outro-sis",
                year: 2026,
                file: "../Munancho/audio/Munanchosis/Outro-sis.mp3",
                about: "The last song Munancho recorded before the incident at the Azerbaijan border. The Crunch was not present for this recording, but the sound of a plant can be heard faintly in the background."
            }
        ]
    },

    {
        id: "album2",
        title: "Munanchosis Songs That Were Too Good To Be On The Album",
        year: 2026,
        cover: "../Munancho/albums/Munanchosis Extrude - LowQ.jpg",
        accent: "190, 110, 255",  // album2: placeholder
        songs: [
            {
                title: "Ma Saw My Report Card",
                year: 2026,
                file: "../Munancho/audio/Munanchosis Tracks That Got Cut For Being Too Good/A Time For Reflection (Ma Saw My Report Card).mp3",
                about: "Cut from the album for being too emotionally accurate to The Crunch's trauma... Pope Barak still cannot listen to it."
            },
            {
                title: "Christopher Is A Litterer",
                year: 2026,
                file: "../Munancho/audio/Munanchosis Tracks That Got Cut For Being Too Good/Coming Clean.mp3",
                about: "Originally titled Coming Clean. The new title was added by a very upset The Cheese."
            },
            {
                title: "Barak Is A Creamer",
                year: 2026,
                file: "../Munancho/audio/Munanchosis Tracks That Got Cut For Being Too Good/Barak Is A Creamer.mp3",
                about: "The Crunch wrote this song alone in a cave with nothing but a guitar hero controller. The Cheese was never present, but the sound of him entering Ketosis is rumoured to be audible in the background."
            },
            {
                title: "J-Hope Cow Milker",
                year: 2026,
                file: "../Munancho/audio/Munanchosis Tracks That Got Cut For Being Too Good/J-Hope The Cow Milker.mp3",
                about: "Recorded in a barn at 4 a.m. J-Hope doesn't actually remember recording this track."
            },
            {
                title: "The Happy Cat Arises Part 13",
                year: 2026,
                file: "../Munancho/audio/Munanchosis Tracks That Got Cut For Being Too Good/Happy Cat Rises.mp3",
                about: "Parts 1 through 12 were lost in a shipment of Guitar Hero controllers, and Part 14 only exists as one copy, currently in a museum."
            },
            {
                title: "Cruise of Sadness",
                year: 2026,
                file: "../Munancho/audio/Munanchosis Tracks That Got Cut For Being Too Good/Cruise of Sadness.mp3",
                about: "Written aboard a cruise ship, this track is the only track on album one recorded entirely under the water."
            }
        ]
    },

    {
        id: "album3",
        title: "Munancho Dies (Coming Soon)",
        year: 2027,
        cover: "../Munancho/albums/Munancho Dies Crystallize.jpg",
        accent: "255, 80, 120",   // album3: placeholder
        songs: [
            {
                title: "I Am Going to Kill Myself Today",
                year: 2026,
                file: "../Munancho/audio/no-bones-remaining.mp3",
                about: "This track is currently classified."
            },
            {
                title: "Unrequited Bruv",
                year: 2026,
                file: "../Munancho/audio/dolphin-frequency.mp3",
                about: "This track is currently classified."
            },
            {
                title: "Welcome To Hell",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "The Devil's Soliloquy",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "Sock Gang Does NOT Jelq On Hanukkah",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "Yellow Fever Blues",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "The Goon Company",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "Jelqing For The Greater Good",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "Eyes of Heaven (The Next Goonicide)",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "Gooner's Lament",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "Goth Girl Under The Table iHoP Syrup Slopjob",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "The Decision",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "BBC_Charlie_Kirk_Gaping_Cameltoe_Rule_34_Kevin_Stitt_Cuck_Cum_On_Face_Hentai_ASMR_God_X_Satan_Double_and_Dap_Edging_Loser_Humiliation",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            }
        ]
    },

    {
        id: "album4",
        title: "Munancho Milks The Milkman (Coming Soon)",
        year: 2027,
        cover: "../Munancho/albums/Munancho(1).jpg",
        accent: "255, 80, 120",   // album3: placeholder
        songs: [
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/no-bones-remaining.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/dolphin-frequency.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            }
        ]
    },

    {
        id: "album4",
        title: "Munancho Commits Lunch (Coming Soon)",
        year: 2027,
        cover: "../Munancho/albums/Munancho(2).jpg",
        accent: "255, 80, 120",   // album3: placeholder
        songs: [
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/no-bones-remaining.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/dolphin-frequency.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            }
        ]
    },

    {
        id: "album5",
        title: "Munancho Goes To Rehab In a Whale (Coming Soon)",
        year: 2027,
        cover: "../Munancho/albums/Munancho(3).jpg",
        accent: "255, 80, 120",   // album3: placeholder
        songs: [
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/no-bones-remaining.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/dolphin-frequency.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            },
            {
                title: "18NakedCowboys",
                year: 2026,
                file: "../Munancho/audio/government-cheese.mp3",
                about: "This track is currently classified."
            }
        ]
    }
];


// ============================================================
// SECTION 02 — PAGE ELEMENTS AND SAVED DATA
//
// PURPOSE:
// Connects JavaScript to the HTML and tracks the current
// album, current song, album progress, and saved like counts.
//
// 02A. ELEMENT REFERENCES
// albumGrid       Album tile container.
// trackList       Song row container.
// trackHeading    Selected album heading.
// trackSubheading Album information.
// audioPlayer     Browser audio player.
// player          Fixed bottom player bar.
// siteHeader      Sticky top header.
//
// 02B. PLAYBACK STATE
// selectedAlbumIndex = Currently selected album.
// currentTrackIndex  = Currently selected song.
// albumProgress      = Where each album was left off.
//
// A value of -1 means nothing is selected.
//
// 02C. SAVED LIKES
// Like counts are stored in this browser only.
// ============================================================


// ------------------------------------------------------------
// 02A — ELEMENT REFERENCES
// ------------------------------------------------------------

const albumGrid = document.getElementById("album-grid");
const trackList = document.getElementById("track-list");

const trackHeading = document.getElementById("track-heading");
const trackSubheading = document.getElementById("track-subheading");

const audioPlayer = document.getElementById("audio-player");

const playerTitle = document.getElementById("player-title");
const playerAlbum = document.getElementById("player-album");
const playerArt = document.getElementById("player-art");

const trackSection = document.getElementById("track-section");
const player = document.querySelector(".player");
const siteHeader = document.querySelector(".site-header");


// ------------------------------------------------------------
// 02B — PLAYBACK STATE AND ALBUM PROGRESS
// ------------------------------------------------------------

let selectedAlbumIndex = -1;
let currentTrackIndex = -1;

// Remembers where each album was left off.
// Example: { 0: { trackIndex: 3, time: 41.2 } }
const albumProgress = {};

// Seek position to apply once a loaded song is ready.
let pendingStartTime = 0;

// Save the current album's track and timestamp before leaving it.
function saveAlbumProgress() {
    if (selectedAlbumIndex < 0 || currentTrackIndex < 0) {
        return;
    }

    // A finished album starts over next time.
    if (audioPlayer.ended) {
        delete albumProgress[selectedAlbumIndex];
        return;
    }

    albumProgress[selectedAlbumIndex] = {
        trackIndex: currentTrackIndex,
        // If a seek hasn't applied yet, keep the pending time.
        time: pendingStartTime > 0
            ? pendingStartTime
            : audioPlayer.currentTime
    };
}


// ------------------------------------------------------------
// 02C — SAVED LIKES
// ------------------------------------------------------------

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
// Example: album1-Moonlight identifies that song in album1.

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
// Builds the selectable album tiles from the album database
// and handles album selection.
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
// Clicking a new album starts it at track one, or resumes it
// where it was left off. Clicking the album that is already
// playing never restarts it.
// ============================================================


// ------------------------------------------------------------
// 03A — ALBUM TILES
// ------------------------------------------------------------

function renderAlbums() {
    albumGrid.replaceChildren();

    albums.forEach((album, albumIndex) => {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "album-card";

        // Each album tile uses its own accent color.
        card.style.setProperty("--accent", album.accent);

        card.classList.toggle(
            "selected",
            albumIndex === selectedAlbumIndex
        );

        card.setAttribute(
            "aria-pressed",
            String(albumIndex === selectedAlbumIndex)
        );


        // 03A-1 — Album artwork and fallback design.
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


        // 03A-2 — Album title.
        const title = document.createElement("h3");

        title.className = "album-title";
        title.textContent = album.title;


        // 03A-3 — Album year and number of tracks.
        const details = document.createElement("p");

        details.className = "album-meta";
        details.textContent =
            `${album.year} · ${album.songs.length} tracks`;


        // 03A-4 — Assemble the tile.
        card.append(cover, title, details);


        // Open the selected album and play it.
        card.addEventListener("click", () => {
            selectAlbum(albumIndex);
        });

        albumGrid.appendChild(card);
    });
}


// ------------------------------------------------------------
// 03B — ALBUM SELECTION
// ------------------------------------------------------------

// Select an album and resume it where it was left off.
// A new album starts at track one.

function selectAlbum(albumIndex) {
    const album = albums[albumIndex];

    if (!album) {
        return;
    }

    // Clicking the album that is already loaded never restarts it.
    if (
        albumIndex === selectedAlbumIndex &&
        currentTrackIndex >= 0 &&
        !audioPlayer.ended
    ) {
        if (audioPlayer.paused) {
            audioPlayer.play().catch(() => {});
        }

        trackSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
        return;
    }

    // Save the album being left before switching.
    saveAlbumProgress();

    const saved = albumProgress[albumIndex];

    selectedAlbumIndex = albumIndex;
    currentTrackIndex = -1;

    trackHeading.textContent = album.title;

    trackSubheading.textContent =
        `${album.year} · ${album.songs.length} tracks · Munancho Archive`;

    renderAlbums();
    renderTracks();

    // Resume saved progress, or start at track one.
    if (album.songs.length > 0) {
        playTrack(
            albumIndex,
            saved ? saved.trackIndex : 0,
            saved ? saved.time : 0
        );
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
// Builds one row for every song in the selected album and
// the "About this song" bubble.
//
// 04A. TRACK ROWS
//
// TRACK ROW ORDER:
// 04A-1. Track number (play icon on hover)
// 04A-2. Song title
// 04A-3. Release year ("Right Now" on hover)
// 04A-4. Album name
// 04A-5. About button
// 04A-6. Likes
//
// CSS CLASSES:
// track-row         Entire song row (click anywhere to play).
// playing           Currently selected song.
// track-number      Track number cell.
// track-number-text Track number (default state).
// track-play-icon   Play icon (hover state, drawn by CSS).
// track-name        Song title.
// track-year        Year cell.
// track-year-text   Song year (default state).
// track-year-hover  "Right Now" label (hover state).
// track-album       Album name.
// about-button      Opens the about bubble.
// like-button       Song's like counter.
//
// IMPORTANT:
// Keep this element order consistent with the CSS grid.
//
// 04B. ABOUT BUBBLE
//
// One bubble is created once and reused by every row.
// It closes when you click elsewhere, press Escape, scroll,
// resize the window, or the tracklist redraws.
//
// CSS CLASSES:
// about-bubble   The bubble.
// about-heading  "ABOUT THIS SONG" label.
// about-song     Song title.
// about-text     The song's about text from Section 01.
// ============================================================


// ------------------------------------------------------------
// 04A — TRACK ROWS
// ------------------------------------------------------------

function renderTracks() {
    closeAboutBubble();
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

        // Clicking anywhere on the row plays the song.
        row.addEventListener("click", () => {
            playTrack(selectedAlbumIndex, trackIndex);
        });


        // 04A-1 — Track number (swaps to a play icon on hover).
        const number = document.createElement("span");

        number.className = "track-number";

        const numberText = document.createElement("span");

        numberText.className = "track-number-text";
        numberText.textContent = String(trackIndex + 1).padStart(2, "0");

        // The triangle itself is drawn by CSS.
        const playIcon = document.createElement("span");

        playIcon.className = "track-play-icon";
        playIcon.setAttribute("aria-hidden", "true");

        number.append(numberText, playIcon);


        // 04A-2 — Song title (keyboard-focusable button).
        const title = document.createElement("button");

        title.type = "button";
        title.className = "track-name";
        title.textContent = song.title;


        // 04A-3 — Release year (swaps to "Right Now" on hover).
        const year = document.createElement("span");

        year.className = "track-year";

        const yearText = document.createElement("span");

        yearText.className = "track-year-text";
        yearText.textContent = song.year;

        const yearHover = document.createElement("span");

        yearHover.className = "track-year-hover";
        yearHover.textContent = "Right Now";
        yearHover.setAttribute("aria-hidden", "true");

        year.append(yearText, yearHover);


        // 04A-4 — Album name.
        const albumName = document.createElement("span");

        albumName.className = "track-album";
        albumName.textContent = album.title;


        // 04A-5 — About button (opens the about bubble).
        const aboutButton = document.createElement("button");

        aboutButton.type = "button";
        aboutButton.className = "about-button";
        aboutButton.textContent = "i";

        aboutButton.setAttribute("aria-label", `About ${song.title}`);
        aboutButton.setAttribute("aria-haspopup", "dialog");
        aboutButton.setAttribute("aria-expanded", "false");

        // stopPropagation keeps the row click from playing the song.
        aboutButton.addEventListener("click", (event) => {
            event.stopPropagation();

            // Clicking the open button again closes the bubble.
            if (aboutOpenButton === aboutButton) {
                closeAboutBubble();
                return;
            }

            openAboutBubble(aboutButton, song);
        });


        // 04A-6 — Like counter.
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
        // stopPropagation keeps the row click from playing the song.
        likeButton.addEventListener("click", (event) => {
            event.stopPropagation();

            likes[likeKey] = (likes[likeKey] || 0) + 1;

            saveLikes();
            renderTracks();
        });


        // Assemble the row in the same order as the CSS columns.
        row.append(
            number,
            title,
            year,
            albumName,
            aboutButton,
            likeButton
        );

        trackList.appendChild(row);
    });
}


// ------------------------------------------------------------
// 04B — ABOUT BUBBLE
// ------------------------------------------------------------

// 04B-1 — Build the bubble once and keep it on the page.

const aboutBubble = document.createElement("div");

aboutBubble.className = "about-bubble";
aboutBubble.setAttribute("role", "dialog");
aboutBubble.setAttribute("aria-label", "About this song");
aboutBubble.hidden = true;

const aboutHeading = document.createElement("p");

aboutHeading.className = "about-heading";
aboutHeading.textContent = "ABOUT THIS SONG";

const aboutSong = document.createElement("p");

aboutSong.className = "about-song";

const aboutText = document.createElement("p");

aboutText.className = "about-text";

aboutBubble.append(aboutHeading, aboutSong, aboutText);
document.body.appendChild(aboutBubble);

// The about button whose bubble is currently open (or null).
let aboutOpenButton = null;


// 04B-2 — Open the bubble for one song.

function openAboutBubble(button, song) {
    closeAboutBubble();

    const album = albums[selectedAlbumIndex];

    aboutSong.textContent = song.title;

    aboutText.textContent =
        song.about || "No file on this track yet. The archive is still investigating.";

    // The bubble uses the album's accent color.
    aboutBubble.style.setProperty("--accent", album.accent);

    // Show it first so its size can be measured.
    aboutBubble.hidden = false;

    aboutOpenButton = button;
    button.setAttribute("aria-expanded", "true");

    positionAboutBubble(button);
}


// 04B-3 — Place the bubble beside its button.
// Prefers below the button and flips above when space is tight.

function positionAboutBubble(button) {
    const gap = 14;
    const edge = 12;
    const playerClearance = 100;

    const rect = button.getBoundingClientRect();
    const width = aboutBubble.offsetWidth;
    const height = aboutBubble.offsetHeight;

    // Line the bubble's right edge up with the button,
    // then keep it fully on screen.
    let left = rect.right - width;
    left = Math.max(edge, Math.min(left, window.innerWidth - width - edge));

    const roomBelow = window.innerHeight - rect.bottom - playerClearance;
    const side = roomBelow >= height + gap ? "below" : "above";

    const top = side === "below"
        ? rect.bottom + gap
        : rect.top - height - gap;

    aboutBubble.dataset.side = side;
    aboutBubble.style.left = `${left}px`;
    aboutBubble.style.top = `${top}px`;

    // Point the little arrow at the button.
    aboutBubble.style.setProperty(
        "--arrow-x",
        `${rect.left + rect.width / 2 - left}px`
    );
}


// 04B-4 — Close the bubble.

function closeAboutBubble() {
    if (aboutOpenButton) {
        aboutOpenButton.setAttribute("aria-expanded", "false");
        aboutOpenButton = null;
    }

    aboutBubble.hidden = true;
}


// 04B-5 — Close on outside click, Escape, scroll, or resize.

document.addEventListener("click", (event) => {
    if (!aboutOpenButton) {
        return;
    }

    if (aboutBubble.contains(event.target)) {
        return;
    }

    closeAboutBubble();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeAboutBubble();
    }
});

window.addEventListener("scroll", closeAboutBubble, { passive: true });
window.addEventListener("resize", closeAboutBubble);


// ============================================================
// SECTION 05 — MUSIC PLAYBACK
//
// PURPOSE:
// Loads the selected song and updates the persistent player.
//
// WHAT THIS FUNCTION CHANGES:
// audioPlayer.src   Audio file being played.
// playerTitle       Current song name.
// playerAlbum       Current album name.
// playerArt         Mini album artwork.
// player --accent   Player and header highlight color.
// currentTrackIndex Active track highlight.
//
// Selecting a song also updates the album selection if needed.
// startTime lets an album resume partway through a song.
// ============================================================

function playTrack(albumIndex, trackIndex, startTime = 0) {
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


    // Load the song. startTime is applied once metadata is ready.
    pendingStartTime = startTime;
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

    // Tint the player with the playing album's accent color.
    player.style.setProperty("--accent", album.accent);

    // Tint the top header with the same album color.
    siteHeader.style.setProperty("--accent", album.accent);


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
// Handles track completion, saved positions, reports missing
// audio files, and builds the initial album grid.
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
    } else {
        // Album finished: clicking its tile again starts over.
        delete albumProgress[selectedAlbumIndex];
    }
});


// Jump to the saved position once the song is ready to seek.

audioPlayer.addEventListener("loadedmetadata", () => {
    if (pendingStartTime > 0) {
        audioPlayer.currentTime = pendingStartTime;
    }

    pendingStartTime = 0;
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


// ============================================================
// SECTION 07 — NAVIGATION CUES AND PAGE VIEWS
//
// PURPOSE:
// Plays a short sound cue when a header tab is clicked, and
// switches between the page views (home and The Bing Dingy).
//
// 07A. CUE FILES
// Each header link has a data-cue name in the HTML. The name
// below points to its audio file. To add a voice clip, save
// the file with the exact name and put it in
// /Munancho/audio/cues/. No other code changes are needed.
// A missing file is skipped silently (the browser console
// may show a 404, which is expected until the file exists).
//
// 07B. CUE PLAYBACK
// Cues use their own audio object, so they never interrupt
// the album playing in the bottom player.
//
// 07C. PAGE VIEWS
// view-home        Hero, lore, archive, track manifest, merch.
// view-bing-dingy  The Bing Dingy page.
// Only one view is visible at a time. The player and header
// stay on screen in every view.
// ============================================================


// ------------------------------------------------------------
// 07A — CUE FILES
// ------------------------------------------------------------

const navCues = {
    "lore": "../Munancho/audio/cues/lore.mp3",
    "archive": "../Munancho/audio/cues/archive.mp3",
    "merch": "../Munancho/audio/cues/merch.mp3",
    "bing-dingy": "../Munancho/audio/cues/bing-dingy.mp3",
    "logo": "../Munancho/audio/Munancho.mp3"
};
// Each cue keeps one audio object, so clicking again restarts it
// instead of layering copies on top of each other.

const activeCues = {};

function playNavCue(cueName) {
    const file = navCues[cueName];

    // Links without a cue stay silent.
    if (!file) {
        return;
    }

    if (!activeCues[cueName]) {
        activeCues[cueName] = new Audio(file);
    }

    const cue = activeCues[cueName];

    cue.currentTime = 0;

    // A missing or blocked file should never cause an error.
    cue.play().catch(() => {});
}


// ------------------------------------------------------------
// 07C — PAGE VIEWS
// ------------------------------------------------------------

const siteViews = {
    "home": document.getElementById("view-home"),
    "bing-dingy": document.getElementById("view-bing-dingy")
};

const viewLinks = document.querySelectorAll("[data-view]");

// Show one view, hide the others, and mark the active tab.
function showView(viewName) {
    if (!siteViews[viewName]) {
        return;
    }

    Object.entries(siteViews).forEach(([name, element]) => {
        element.hidden = name !== viewName;
    });

    viewLinks.forEach((link) => {
        link.classList.toggle(
            "active",
            viewName === "bing-dingy" && link.dataset.view === "bing-dingy"
        );
    });
}

// Clicking a header link plays its cue and opens its view.
// The view is shown before the browser scrolls to the link's
// section, so the section is already on screen when it jumps.
viewLinks.forEach((link) => {
    link.addEventListener("click", () => {
        playNavCue(link.dataset.cue);
        showView(link.dataset.view);
    });
});

// Keep the view correct for the back button and direct links.
function syncViewToHash() {
    showView(
        window.location.hash === "#bing-dingy" ? "bing-dingy" : "home"
    );

    const target = document.getElementById(
        window.location.hash.slice(1)
    );

    if (target) {
        target.scrollIntoView();
    }
}

window.addEventListener("hashchange", syncViewToHash);

// Open The Bing Dingy directly if the page loads on its link.
if (window.location.hash === "#bing-dingy") {
    syncViewToHash();
}


// ============================================================
// SECTION 08 — LORE EXPANDER
//
// PURPOSE:
// Opens and closes the rest of the lore text.
//
// HOW IT WORKS:
// Clicking the button toggles the "expanded" class on the
// lore panel. CSS (Style.css Section 06B) does the sliding.
// The button text changes to match.
// ============================================================

const lorePanel = document.getElementById("lore-panel");
const loreToggle = document.getElementById("lore-toggle");
const loreToggleLabel = document.getElementById("lore-toggle-label");

loreToggle.addEventListener("click", () => {
    const expanded = lorePanel.classList.toggle("expanded");

    loreToggle.setAttribute("aria-expanded", String(expanded));

    loreToggleLabel.textContent = expanded
        ? "Collapse The Mythos"
        : "Expand The Mythos";

    // Bring the lore heading back into view after collapsing.
    if (!expanded) {
        document.getElementById("lore").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
});