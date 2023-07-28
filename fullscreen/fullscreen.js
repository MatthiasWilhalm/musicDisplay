
let URL = '';

const titleDisplay = document.getElementById('title');
const artistDisplay = document.getElementById('artist');
const albumDisplay = document.getElementById('album');
const albumDisplayImg = document.getElementById('cover');
const background = document.getElementById('background');

let updateIntervatFunction = null;

const makeRequest = async () => {

    console.log('Making request...');

    try {
        const res  = await fetch(URL);
        if(!res.ok) throw new Error('Request not OK');

        const data = await res.json();
        console.log(data);
        if(data.recenttracks.track?.length) {
            const track = data.recenttracks.track[0];
            const { 
                artist: { '#text': artist },
                name,
                album: {'#text': album }
            } = track;
            const image = track.image?.at(-1)['#text'];
            console.log(artist, name, album, image);
            updateDisplay({ artist, name, album, image });
        } else {
            throw new Error('No track found');
        }

    } catch (error) {
        console.log(error);
    }
}

const updateDisplay = (track) => {
    const { artist, name, album, image } = track;

    titleDisplay.textContent = name;

    artistDisplay.textContent = artist;
    albumDisplay.textContent = album;

    if(isImage(image)) {
        albumDisplayImg.src = image;
        albumDisplayImg.style.display = 'unset';
        updateBackground(image);
    } else {
        albumDisplayImg.style.display = 'none';
        updateBackground();
    }
}

const updateBackground = (image) => {
    if(image) {
        background.style.backgroundImage = `url(${image})`;
        background.style.backgroundColor = 'unset';
        return;
    }
    background.style.backgroundImage = 'unset';
    background.style.backgroundColor = getColor();
}

const isImage = (url) => {
    if(!url) return false;
    if(url==='https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png')
        return false;
    return true;
}

const getColor = () => {
    return 'rgba(141, 47, 241, 1)';
    // return 'rgba(241, 47, 66, 1)';
}

const init = () => {
    updateBackground();
    makeRequest();
    updateIntervatFunction = setInterval(makeRequest, 15000);
}

fetch('../environment.json').then(res => res.json()).then(data => {
    const { apiKey, username } = data;
    if(!apiKey || !username) throw new Error('Missing environment.json');
    URL = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&limit=1&nowplaying="true"&api_key=${apiKey}&user=${username}&format=json`;
    init();
}).catch(err => console.log('Error fetching environment.json'));