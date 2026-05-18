const API_KEY = "AIzaSyDNHqERli0UuPqruQwd2UPIBg7nikrjqNE";
const CHANNEL_ID = "UCFJvAGjel1N2QWyOu50pNeQ";

let allVideos = [];
let filteredVideos = [];
let currentVideoIndex = 0;

let player;

async function getUploadsPlaylist(){

const url =
`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`;

const response = await fetch(url);

const data = await response.json();

return data.items[0]
.contentDetails
.relatedPlaylists
.uploads;

}

async function fetchAllVideos(){

showLoading(true);

const uploadsPlaylist =
await getUploadsPlaylist();

let nextPageToken = "";
let loadedVideos = [];

while(true){

const url =
`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylist}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`;

const response = await fetch(url);

const data = await response.json();

loadedVideos.push(...data.items);

document.getElementById('loadingText')
.innerText =
`Catalogando ${loadedVideos.length} vídeos...`;

nextPageToken = data.nextPageToken;

if(!nextPageToken){
break;
}

}

allVideos = loadedVideos;
filteredVideos = allVideos;

renderVideos(filteredVideos);

setupHero(filteredVideos[0]);

loadContinueWatching();

loadSubscribeButton();

showLoading(false);

}

function renderVideos(videos){

const grid =
document.getElementById('videoGrid');

grid.innerHTML = '';

videos.forEach((video,index)=>{

grid.innerHTML += createCard(video,index);

});

}

function createCard(video,index){

const videoId =
video.snippet.resourceId.videoId;

return `

<div
class="video-card"
onclick="playVideo(${index})"
>

<img
src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg"
>

<div class="video-info">

<h3>
${video.snippet.title}
</h3>

</div>

</div>

`;

}

function setupHero(video){

const videoId =
video.snippet.resourceId.videoId;

document.getElementById('hero').style.backgroundImage =
`url(https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg)`;

document.getElementById('heroTitle').innerText =
video.snippet.title;

document.getElementById('heroDescription').innerText =
video.snippet.description;

}

function onYouTubeIframeAPIReady(){

player = new YT.Player('player',{

height:'100%',
width:'100%',

playerVars:{
'autoplay':1,
'rel':0
},

events:{
'onStateChange':onPlayerStateChange
}

});

}

function playVideo(index){

currentVideoIndex = index;

const video =
filteredVideos[index];

const videoId =
video.snippet.resourceId.videoId;

player.loadVideoById(videoId);

setupHero(video);

saveContinueWatching(video);

window.scrollTo({
top:0,
behavior:'smooth'
});

}

function playCurrentVideo(){

playVideo(currentVideoIndex);

}

function onPlayerStateChange(event){

if(event.data === 0){

currentVideoIndex++;

if(currentVideoIndex >= filteredVideos.length){
currentVideoIndex = 0;
}

playVideo(currentVideoIndex);

}

}

function searchVideos(){

const term =
document.getElementById('searchInput')
.value
.toLowerCase();

filteredVideos =
allVideos.filter(video =>
video.snippet.title
.toLowerCase()
.includes(term)
);

renderVideos(filteredVideos);

document.getElementById('catalogTitle')
.innerText =
`Resultados: ${filteredVideos.length}`;

}

function clearSearch(){

document.getElementById('searchInput').value = '';

filteredVideos = allVideos;

renderVideos(filteredVideos);

document.getElementById('catalogTitle')
.innerText =
'Todos os Vídeos';

}

function loadSubscribeButton(){

document.getElementById('subscribeBtn').href =
`https://youtube.com/channel/${CHANNEL_ID}`;

}

function addFavorite(){

const current =
filteredVideos[currentVideoIndex];

let favorites =
JSON.parse(
localStorage.getItem('favorites')
) || [];

const exists =
favorites.find(video =>
video.snippet.resourceId.videoId ===
current.snippet.resourceId.videoId
);

if(!exists){

favorites.unshift(current);

localStorage.setItem(
'favorites',
JSON.stringify(favorites)
);

alert('Favoritado');

}

}

function showFavorites(){

const favorites =
JSON.parse(
localStorage.getItem('favorites')
) || [];

filteredVideos = favorites;

renderVideos(filteredVideos);

document.getElementById('catalogTitle')
.innerText =
'Favoritos';

}

function showAllVideos(){

filteredVideos = allVideos;

renderVideos(filteredVideos);

document.getElementById('catalogTitle')
.innerText =
'Todos os Vídeos';

}

function saveContinueWatching(video){

let continueList =
JSON.parse(
localStorage.getItem('continueWatching')
) || [];

continueList =
continueList.filter(v =>
v.snippet.resourceId.videoId !==
video.snippet.resourceId.videoId
);

continueList.unshift(video);

continueList = continueList.slice(0,15);

localStorage.setItem(
'continueWatching',
JSON.stringify(continueList)
);

loadContinueWatching();

}

function loadContinueWatching(){

const container =
document.getElementById('continueWatching');

container.innerHTML = '';

const continueList =
JSON.parse(
localStorage.getItem('continueWatching')
) || [];

continueList.forEach((video,index)=>{

container.innerHTML +=
createCard(video,index);

});

}

function showLoading(show){

document.getElementById('loading').style.display =
show ? 'flex' : 'none';

}

fetchAllVideos();
