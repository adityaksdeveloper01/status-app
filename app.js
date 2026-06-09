// ============================================================================
// 1. CONFIGURATION & STATE
// ============================================================================
const PEXELS_API_KEY = "DfZq0m89s6nNdmIe7YWcGbUM7NOtw7UiPBuXje2xeYzTBReSURGtwVUk"; 

let currentTab = 'image'; 
let currentQuery = 'Indian Nature';
let currentPage = 1;
let isFetching = false;
let hasMoreData = true;

let currentBatch = []; 
let savedFavorites = JSON.parse(localStorage.getItem('statusVaultFavorites')) || [];

const feed = document.getElementById('media-feed');
const loadingSpinner = document.getElementById('loading-spinner');
const searchInput = document.getElementById('search-input');
const sentinel = document.getElementById('scroll-sentinel');

// ============================================================================
// 2. UI NAVIGATION & SUGGESTIONS
// ============================================================================
function setTab(tabName) {
    if (currentTab === tabName) return;
    currentTab = tabName;
    
    // Reset Navigation Icons (Modern Floating Pill Style)
    ['image', 'video', 'favorites'].forEach(tab => {
        const btn = document.getElementById(`nav-${tab}`);
        const icon = btn.querySelector('i');
        btn.className = "flex flex-col items-center py-2 px-6 rounded-full text-gray-500 hover:text-gray-300 transition-all active:scale-95";
        icon.className = `ph ph-${tab === 'image' ? 'image' : tab === 'video' ? 'video-camera' : 'heart'} text-2xl mb-0.5`;
    });

    // Set Active State
    const activeBtn = document.getElementById(`nav-${tabName}`);
    const activeIcon = activeBtn.querySelector('i');
    
    if (tabName === 'favorites') {
        activeBtn.className = "flex flex-col items-center py-2 px-6 rounded-full bg-red-500/10 text-red-500 transition-all active:scale-95";
        activeIcon.className = "ph-fill ph-heart text-2xl mb-0.5 drop-shadow-md";
    } else {
        activeBtn.className = "flex flex-col items-center py-2 px-6 rounded-full bg-emerald-500/10 text-emerald-400 transition-all active:scale-95";
        activeIcon.className = `ph-fill ph-${tabName === 'image' ? 'image' : 'video-camera'} text-2xl mb-0.5 drop-shadow-md`;
    }

    feed.innerHTML = '';
    currentPage = 1;
    hasMoreData = true;

    if (tabName === 'favorites') {
        sentinel.style.display = 'none'; 
        renderFavorites();
    } else {
        sentinel.style.display = 'flex';
        fetchMedia();
    }
}

function applySuggestion(query) {
    currentQuery = query;
    searchInput.value = query;
    
    document.querySelectorAll('.chip').forEach(chip => {
        chip.className = "chip whitespace-nowrap bg-gray-900 text-gray-400 px-4 py-1.5 rounded-full text-xs font-medium border border-gray-800 transition hover:bg-gray-800 hover:text-gray-200";
    });
    event.target.className = "chip whitespace-nowrap bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold border border-emerald-500/30 shadow-sm transition";

    if (currentTab === 'favorites') setTab('image');
    else resetAndFetch();
}

function handleSearch(event) {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;
    currentQuery = query;
    searchInput.blur();
    
    document.querySelectorAll('.chip').forEach(chip => chip.className = "chip whitespace-nowrap bg-gray-900 text-gray-400 px-4 py-1.5 rounded-full text-xs font-medium border border-gray-800 transition hover:bg-gray-800 hover:text-gray-200");
    if (currentTab === 'favorites') setTab('image');
    else resetAndFetch();
}

function resetAndFetch() {
    feed.innerHTML = '';
    currentPage = 1;
    hasMoreData = true;
    currentBatch = [];
    fetchMedia();
}

// ============================================================================
// 3. BULLETPROOF INFINITE SCROLL
// ============================================================================
// Increased rootMargin to 600px to trigger the fetch much earlier before scrolling hits the bottom
const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isFetching && hasMoreData && currentTab !== 'favorites') {
        fetchMedia();
    }
}, { rootMargin: "600px" });

document.addEventListener('DOMContentLoaded', () => {
    observer.observe(sentinel);
    searchInput.value = currentQuery;
    fetchMedia();
});

async function fetchMedia() {
    if (isFetching || !hasMoreData) return;
    isFetching = true;
    loadingSpinner.classList.remove('hidden');

    const endpoint = currentTab === 'video' 
        ? `https://api.pexels.com/videos/search?query=${currentQuery}&per_page=12&page=${currentPage}&orientation=portrait`
        : `https://api.pexels.com/v1/search?query=${currentQuery}&per_page=12&page=${currentPage}&orientation=portrait`;

    try {
        const response = await fetch(endpoint, { headers: { Authorization: PEXELS_API_KEY } });
        if(!response.ok) throw new Error("API Limit or Auth Error");
        
        const data = await response.json();
        const items = currentTab === 'image' ? data.photos : data.videos;
        
        if (!items || items.length === 0) {
            hasMoreData = false;
            if (currentPage === 1) feed.innerHTML = `<div class="col-span-full text-center py-20 text-gray-500 text-sm">No results found for "${currentQuery}"</div>`;
        } else {
            currentBatch = [...currentBatch, ...items];
            currentTab === 'image' ? renderImages(items) : renderVideos(items);
            currentPage++;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        if (currentPage === 1) feed.innerHTML = `<div class="col-span-full text-center py-10 text-red-400 text-sm">Error loading content. Check API key.</div>`;
    } finally {
        isFetching = false;
        loadingSpinner.classList.add('hidden');
    }
}

// ============================================================================
// 4. MASONRY RENDER ENGINE (MODERN BUTTONS)
// ============================================================================
function renderImages(photos) {
    photos.forEach(photo => {
        const isFav = savedFavorites.some(f => f.id.toString() === photo.id.toString());
        feed.appendChild(createMediaCardHTML(photo.src.original, photo.id, 'image', isFav, photo.src.large));
    });
}

function renderVideos(videos) {
    videos.forEach(video => {
        const hdVideo = video.video_files.find(f => f.quality === 'hd' && f.width < f.height) || video.video_files[0];
        const isFav = savedFavorites.some(f => f.id.toString() === video.id.toString());
        feed.appendChild(createMediaCardHTML(hdVideo.link, video.id, 'video', isFav, hdVideo.link));
    });
}

function createMediaCardHTML(mediaUrl, id, type, isFav, displayUrl) {
    const card = document.createElement('div');
    card.className = "masonry-item fade-in group relative bg-gray-900 rounded-[2rem] overflow-hidden shadow-xl border border-gray-800/40 hover:border-gray-700 transition-colors";
    
    const mediaElement = type === 'video' 
        ? `<video src="${displayUrl}" autoplay loop muted playsinline class="w-full h-auto object-cover cursor-pointer" onclick="openModal('${id}', '${type}', '${displayUrl}', '${mediaUrl}')"></video>`
        : `<img src="${displayUrl}" loading="lazy" class="w-full h-auto object-cover cursor-pointer" onclick="openModal('${id}', '${type}', '${displayUrl}', '${mediaUrl}')">`;

    card.innerHTML = `
        ${mediaElement}
        <div class="absolute inset-0 bg-gradient-to-t from-[#0b0c10]/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        <button onclick="toggleFavorite('${id}', '${type}')" class="absolute top-3 right-3 z-30 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 active:scale-90 transition shadow-lg">
            <i id="heart-${id}" class="${isFav ? 'ph-fill text-red-500' : 'ph text-white'} ph-heart text-xl drop-shadow-md"></i>
        </button>
    `;
    return card;
}

// ============================================================================
// 5. LIGHTBOX MODAL LOGIC (MODERN PILL BUTTONS)
// ============================================================================
function openModal(id, type, displayUrl, downloadUrl) {
    const modal = document.getElementById('media-modal');
    const mediaContainer = document.getElementById('modal-media-container');
    const actionsContainer = document.getElementById('modal-actions');
    const isFav = savedFavorites.some(f => f.id.toString() === id.toString());
    
    mediaContainer.innerHTML = type === 'video'
        ? `<video src="${downloadUrl}" controls autoplay playsinline class="max-w-full max-h-[70vh] object-contain"></video>`
        : `<img src="${displayUrl}" class="max-w-full max-h-[70vh] object-contain">`;
        
    actionsContainer.innerHTML = `
        <button onclick="toggleFavorite('${id}', '${type}')" class="w-12 h-12 shrink-0 flex items-center justify-center bg-gray-800 rounded-full border border-gray-700 shadow-inner active:scale-95 transition">
            <i id="modal-heart-${id}" class="${isFav ? 'ph-fill text-red-500' : 'ph text-white'} ph-heart text-2xl drop-shadow-md"></i>
        </button>
        <button onclick="triggerDownload('${downloadUrl}', '${id}', '${type}')" class="flex-1 h-12 bg-gray-800 text-white rounded-full text-sm font-bold flex items-center justify-center gap-2 border border-gray-700 shadow-md active:scale-95 transition hover:bg-gray-700">
            <i class="ph ph-download-simple text-xl"></i> Save
        </button>
        <button onclick="shareFile('${downloadUrl}', '${id}', '${type}')" class="flex-1 h-12 bg-gradient-to-r from-emerald-400 to-teal-400 text-gray-950 rounded-full text-sm font-black flex items-center justify-center gap-2 active:scale-95 transition shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_25px_rgba(16,185,129,0.4)]">
            <i class="ph ph-export text-xl"></i> Share
        </button>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 
}

function closeModal() {
    const modal = document.getElementById('media-modal');
    const mediaContainer = document.getElementById('modal-media-container');
    modal.classList.add('hidden');
    mediaContainer.innerHTML = ''; 
    document.body.style.overflow = 'auto';
}

// ============================================================================
// 6. FAVORITES LOGIC
// ============================================================================
function toggleFavorite(id, type) {
    const existingIndex = savedFavorites.findIndex(fav => fav.id.toString() === id.toString());
    const gridHeart = document.getElementById(`heart-${id}`);
    const modalHeart = document.getElementById(`modal-heart-${id}`);
    let isNowFav = false;

    if (existingIndex > -1) {
        savedFavorites.splice(existingIndex, 1);
        isNowFav = false;
    } else {
        const itemData = currentBatch.find(item => item.id.toString() === id.toString());
        if (itemData) {
            const newFav = {
                id: itemData.id,
                type: type,
                previewUrl: type === 'image' ? itemData.src.large : itemData.video_pictures[0].picture,
                downloadUrl: type === 'image' ? itemData.src.original : itemData.video_files.find(f => f.quality === 'hd').link
            };
            savedFavorites.unshift(newFav);
            isNowFav = true;
        }
    }
    
    const heartClasses = isNowFav ? "ph-fill ph-heart text-red-500" : "ph ph-heart text-white";
    if (gridHeart) gridHeart.className = `${heartClasses} text-xl drop-shadow-md`; 
    if (modalHeart) modalHeart.className = `${heartClasses} text-2xl drop-shadow-md`; 
    
    localStorage.setItem('statusVaultFavorites', JSON.stringify(savedFavorites));
    
    if (currentTab === 'favorites' && !isNowFav) {
        renderFavorites();
        closeModal(); 
    }
}

function renderFavorites() {
    feed.innerHTML = '';
    if (savedFavorites.length === 0) {
        feed.innerHTML = `
            <div class="col-span-full text-center py-20 text-gray-500 flex flex-col items-center">
                <i class="ph ph-heart-break text-5xl mb-3 opacity-50"></i>
                <p class="text-sm font-medium">No favorites saved yet.</p>
            </div>`;
        return;
    }

    savedFavorites.forEach(fav => {
        if(!currentBatch.find(i => i.id === fav.id)) {
            currentBatch.push({
                id: fav.id, src: { original: fav.downloadUrl, large: fav.previewUrl }, 
                video_files: [{quality: 'hd', link: fav.downloadUrl}]
            });
        }
        feed.appendChild(createMediaCardHTML(fav.downloadUrl, fav.id, fav.type, true, fav.previewUrl));
    });
}

// ============================================================================
// 7. NATIVE DEVICE ACTIONS
// ============================================================================
async function shareFile(fileUrl, id, type) {
    try {
        const extension = type === 'video' ? 'mp4' : 'jpg';
        const mimeType = type === 'video' ? 'video/mp4' : 'image/jpeg';
        
        if (!navigator.canShare) return alert("Native share not supported on this device/browser. Use Save.");

        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const file = new File([blob], `status_vault_${id}.${extension}`, { type: mimeType });

        await navigator.share({ files: [file], title: 'Awesome Status' });
    } catch (error) {
        console.error("Share failed:", error);
    }
}

async function triggerDownload(fileUrl, id, type) {
    try {
        const extension = type === 'video' ? 'mp4' : 'jpg';
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `status_vault_${id}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
    } catch (error) {
        console.error("Download failed:", error);
    }
}

// ============================================================================
// 8. PWA REGISTRATION
// ============================================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW setup failed: ', err));
    });
}