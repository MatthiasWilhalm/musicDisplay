let URL = '';

const titleDisplay = document.getElementById('trackTitle');
const artistDisplay = document.getElementById('trackArtist');
const albumDisplay = document.getElementById('trackAlbum');
const albumDisplayImg = document.getElementById('trackAlbumImg');
const trackDisplay = document.getElementById('trackDisplay');
const trackTitleCloneDisplay = document.getElementById('trackTitleClone');
const trackTitlesPanel = document.getElementById('trackTitles');
const imgFade = document.getElementById('imgFade');

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

const updateDisplay = async (track) => {
    const { artist, name, album, image } = track;

    titleDisplay.textContent = name;
    trackTitleCloneDisplay.textContent = name;
    updateTitleScrollBehaviour(name.length > 20);

    artistDisplay.textContent = artist;
    albumDisplay.textContent = album;

    if(isImage(image)) {
        albumDisplayImg.src = image;
        albumDisplayImg.style.display = 'unset';
        const color = await updateColor(null, image);
        updateTextColor(color);
    } else {
        albumDisplayImg.style.display = 'none';
        const color = await updateColor();
        updateTextColor(color);
    }
}

const updateColor = async (color, imgUrl) => {
    color = await getColor(imgUrl);
    trackDisplay.style.backgroundColor = color;
    imgFade.style.background = `linear-gradient(270deg, rgba(255,255,255,0) 49%, ${color} 100%)`;
    return color;
}

const updateTextColor = (color) => {
    const brightness = getBrightness(color);
    if(brightness < 125 || !color) {
        titleDisplay.style.color = "white";
        trackTitleCloneDisplay.style.color = "white";
        artistDisplay.style.color = "white";
        albumDisplay.style.color = "white";
    } else {
        titleDisplay.style.color = "black";
        trackTitleCloneDisplay.style.color = "black";
        artistDisplay.style.color = "black";
        albumDisplay.style.color = "black";
    }
}

const isImage = (url) => {
    if(!url) return false;
    if(url==='https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png')
        return false;
    return true;
}

const toggleUpdate = async e => {
    if(updateIntervatFunction) {
        clearInterval(updateIntervatFunction);
        updateIntervatFunction = null;
        await updateColor('rgba(56, 56, 56, 1)');
    } else {
        makeRequest();
        updateIntervatFunction = setInterval(makeRequest, 15000);
        await updateColor();
    }
}

const getColor = async (imgUrl) => {
    if(!imgUrl) return 'rgba(141, 47, 241, 1)';

    return await getPrimaryColor(imgUrl);
    // return 'rgba(241, 47, 66, 1)';
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

// document.getElementById('trackAlbumImg').addEventListener('change', e => updateBgColor(e.target.src));

const getPrimaryColor = async (imageUrl) => {
    return new Promise((resolve, reject) => {
        console.log('Image URL:', imageUrl);
    
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // This is important for cross-origin images
        img.src = imageUrl;
        img.onload = () => {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
    
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const colorCount = {};
            let maxCount = 0;
            let primaryColor = '';
    
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const color = `rgb(${r},${g},${b})`;
    
                if (!colorCount[color]) {
                    colorCount[color] = 0;
                }
                colorCount[color]++;
    
                if (colorCount[color] > maxCount) {
                    maxCount = colorCount[color];
                    primaryColor = color;
                }
            }
    
            console.log('Primary Color:', primaryColor);
            resolve(primaryColor);
        };

    });
}

const getBrightness = (color) => {
    const rgb = color.match(/\d+/g);
    const r = parseInt(rgb[0]);
    const g = parseInt(rgb[1]);
    const b = parseInt(rgb[2]);
    return (r * 299 + g * 587 + b * 114) / 1000;
}