const API_KEY = "AIzaSyDNHqERli0UuPqruQwd2UPIBg7nikrjqNE";
const CHANNEL_ID = "UCFJvAGjel1N2QWyOu50pNeQ";

let allVideos = [];
let filteredVideos = [];
let currentVideoIndex = 0;

let player;

async function fetchRSSVideos(){

showLoading(true);

try{

const rssUrl =
`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const api =
`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

const response = await ffetch(api;

const data = await response.json();

allVideos = data.items;

filteredVideos = allVideos;

renderVideos(filteredVideos);

setupHero(filteredVideos[0]);

loadContinueWatching();

loadSubscribeButton();

}catch(error){

alert('Erro ao carregar vídeos do RSS');

}

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
extractVideoId(video.link);

return `

<div
class="video-card"
onclick="playVideo(${index})"
>

<img
loading="lazy"
src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg"
>

<div class="video-info">

<h3>
${video.title}
</h3>

</div>

</div>

`;

}

function extractVideoId(url){

const match =
url.match(/v=([^&]+)/);

return match ? match[1] : '';

}

function setupHero(video){

const videoId =
extractVideoId(video.link);

document.getElementById('hero').style.backgroundImage =
`url(https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg)`;

document.getElementById('heroTitle').innerText =
video.title;

document.getElementById('heroDescription').innerText =
video.description
.replace(/<[^>]*>/g,'');

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
extractVideoId(video.link);

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

async function searchVideos(){

const term =
document.getElementById('searchInput')
.value
.trim();

if(term === ''){

filteredVideos = allVideos;

renderVideos(filteredVideos);

document.getElementById('catalogTitle')
.innerText =
'Vídeos Recentes';

return;

}

showLoading(true);

try{

const url =
`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${CHANNEL_ID}&maxResults=50&q=${encodeURIComponent(term)}&key=${API_KEY}`;

const response = await fetch(url);

const data = await response.json();

filteredVideos = data.items.map(item => {

return {
title:item.snippet.title,
description:item.snippet.description,
link:`https://www.youtube.com/watch?v=${item.id.videoId}`
};

});

renderVideos(filteredVideos);

document.getElementById('catalogTitle')
.innerText =
`Resultados para: "${term}"`;

}catch(error){

alert('Erro na pesquisa');

}

showLoading(false);

}

function clearSearch(){

document.getElementById('searchInput').value = '';

filteredVideos = allVideos;

renderVideos(filteredVideos);

document.getElementById('catalogTitle')
.innerText =
'Vídeos Recentes';

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

const currentId =
extractVideoId(current.link);

const exists =
favorites.find(video =>
extractVideoId(video.link) === currentId
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
'Vídeos Recentes';

}

function saveContinueWatching(video){

let continueList =
JSON.parse(
localStorage.getItem('continueWatching')
) || [];

const currentId =
extractVideoId(video.link);

continueList =
continueList.filter(v =>
extractVideoId(v.link) !== currentId
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

fetchRSSVideos();
