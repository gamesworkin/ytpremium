const API_KEY = "SUA_API_KEY";
const CHANNEL_ID = "SEU_CHANNEL_ID";

let videos = [];
let filteredVideos = [];
let currentVideoIndex = 0;
let player;

async function fetchVideos(){

showLoading(true);

const url =
`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=50&order=date&type=video&key=${API_KEY}`;

const response = await fetch(url);

const data = await response.json();

videos = data.items;
filteredVideos = videos;

renderVideos(videos);

setupHero(videos[0]);

loadContinueWatching();

loadSubscribeButton();

showLoading(false);

}

function showLoading(show){

document.getElementById('loading').style.display =
show ? 'flex' : 'none';

}

function renderVideos(videoList){

const grid =
document.getElementById('videoGrid');

const oldGrid =
document.getElementById('oldVideoGrid');

grid.innerHTML = '';
oldGrid.innerHTML = '';

videoList.forEach((video,index)=>{

const html = createVideoCard(video,index);

if(index < 12){
grid.innerHTML += html;
}else{
oldGrid.innerHTML += html;
}

});

}

function createVideoCard(video,index){

return `
<div class="video-card"
onclick="playVideo(${index})">

<img src="${video.snippet.thumbnails.high.url}">

<div class="video-info">

<h3>
${video.snippet.title}
</h3>

</div>

</div>
`;

}

function setupHero(video){

document.getElementById('hero').style.backgroundImage =
`url(${video.snippet.thumbnails.high.url})`;

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

const video = filteredVideos[index];

const videoId = video.id.videoId;

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
videos.filter(video =>
video.snippet.title
.toLowerCase()
.includes(term)
);

renderVideos(filteredVideos);

}

function loadSubscribeButton(){

document.getElementById('subscribeBtn').href =
`https://youtube.com/channel/${CHANNEL_ID}`;

}

function addFavorite(){

const video =
filteredVideos[currentVideoIndex];

let favorites =
JSON.parse(localStorage.getItem('favorites')) || [];

const exists =
favorites.find(v =>
v.id.videoId === video.id.videoId
);

if(!exists){

favorites.push(video);

localStorage.setItem(
'favorites',
JSON.stringify(favorites)
);

alert('Vídeo favoritado');

}

}

function toggleFavorites(){

const favorites =
JSON.parse(localStorage.getItem('favorites')) || [];

if(favorites.length === 0){

alert('Nenhum favorito');

return;

}

filteredVideos = favorites;

renderVideos(filteredVideos);

}

function saveContinueWatching(video){

let continueList =
JSON.parse(
localStorage.getItem('continueWatching')
) || [];

continueList =
continueList.filter(v =>
v.id.videoId !== video.id.videoId
);

continueList.unshift(video);

continueList = continueList.slice(0,10);

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
createVideoCard(video,index);

});

}

fetchVideos();