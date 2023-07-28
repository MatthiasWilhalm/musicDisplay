let URL = '';

const titleDisplay = document.getElementById('trackTitle');
const artistDisplay = document.getElementById('trackArtist');
const albumDisplay = document.getElementById('trackAlbum');
const albumDisplayImg = document.getElementById('trackAlbumImg');
const trackDisplay = document.getElementById('trackDisplay');
const trackTitleCloneDisplay = document.getElementById('trackTitleClone');
const trackTitlesPanel = document.getElementById('trackTitles');

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
    trackTitleCloneDisplay.textContent = name;
    updateTitleScrollBehaviour(name.length > 20);

    artistDisplay.textContent = artist;
    albumDisplay.textContent = album;

    if(image) {
        albumDisplayImg.src = image;
        albumDisplayImg.style.display = 'unset';
    } else
        albumDisplayImg.style.display = 'none';
}

const toggleUpdate = e => {
    if(updateIntervatFunction) {
        clearInterval(updateIntervatFunction);
        updateIntervatFunction = null;
        trackDisplay.style.background = 'rgba(241, 47, 66, 0.74)';
    } else {
        makeRequest();
        updateIntervatFunction = setInterval(makeRequest, 15000);
        trackDisplay.style.background = 'rgba(141, 47, 241, 0.74)';
    }
}

const updateTitleScrollBehaviour = (isMarquee) => {
    if(isMarquee) {
        trackTitlesPanel.classList.add('trackDisplayMarquee');
        trackTitleCloneDisplay.style.display = 'unset';
        const text = titleDisplay.textContent + ' //';
        titleDisplay.textContent = text;
        trackTitleCloneDisplay.textContent = text;
    } else {
        trackTitlesPanel.classList.remove('trackDisplayMarquee');
        trackTitleCloneDisplay.style.display = 'none';
    }
}

const init = () => {
    makeRequest();
    updateIntervatFunction = setInterval(makeRequest, 15000);
    trackDisplay.addEventListener('click', toggleUpdate);
}

fetch('../environment.json').then(res => res.json()).then(data => {
    const { apiKey, username } = data;
    if(!apiKey || !username) throw new Error('Missing environment.json');
    URL = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&limit=1&nowplaying="true"&api_key=${apiKey}&user=${username}&format=json`;
    init();
}).catch(err => console.log('Error fetching environment.json'));