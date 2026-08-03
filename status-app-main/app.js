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
let itemCaptions = {}; 

const feed = document.getElementById('media-feed');
const loadingSpinner = document.getElementById('loading-spinner');
const searchInput = document.getElementById('search-input');
const sentinel = document.getElementById('scroll-sentinel');

// ============================================================================
// 2. SHAYARI / STATUS LIBRARY (FULL VERSION RESTORED)
// ============================================================================
const shayariLibrary = {
    "Love Shayari": [
        "Teri muskaan mein meri duniya basti hai.",
        "Mohabbat wo ehsaas hai jo lafzon mein bayan nahi hota.",
        "Dil ne tujhe apna maana hai, har dua mein tera naam aana hai.",
        "Tere bina adhuri si lagti hai har khushi."
    ],
    "Friendship Shayari": [
        "Dosti dilon ka rishta hai, jo waqt se bhi mazboot hota hai.",
        "Saccha dost har mushkil mein saath khada rehta hai.",
        "Dosti ki khushboo zindagi bhar saath chalti hai.",
        "Har khushi dugni ho jaati hai jab dost saath hote hain."
    ],
    "Motivational Shayari": [
        "Manzil unhi ko milti hai jo raaston se darte nahi.",
        "Hausla rakho, andhera chahe kitna bhi gehra ho.",
        "Mehnat ki roshni kabhi bekaar nahi jaati.",
        "Sapne wahi sach hote hain jinhe jag kar dekha jaye."
    ],
    "Sad Shayari": [
        "Kuch zakhm waqt ke saath bhi nahi bharte.",
        "Teri yaad ka bojh aaj bhi dil par hai.",
        "Khamoshi aksar sabse zyada dard bayan karti hai.",
        "Jo apne the, wahi sabse door chale gaye."
    ],
    "Life Shayari": [
        "Zindagi har roz ek naya sabak sikhati hai.",
        "Har mod par ek nayi kahani milti hai.",
        "Muskurana seekho, zindagi aasaan lagne lagegi.",
        "Waqt se bada koi ustad nahi hota."
    ],
    "Attitude Shayari": [
        "Hum apni pehchaan khud banate hain.",
        "Jhukna humein pasand nahi, tootna manzoor hai.",
        "Jo humein samajh na sake, unhe samjhana zaroori nahi.",
        "Apna andaaz hi hamari pehchaan hai."
    ],
    "Breakup Shayari": [
        "Mohabbat adhuri reh gayi, kahani poori ho gayi.",
        "Tum gaye to laga sab kuch saath le gaye.",
        "Dil ko samjha liya hai, par yaadein ab bhi baaki hain.",
        "Jo kabhi apna tha, aaj ajnabi lagta hai."
    ],
    "Travel Shayari": [
        "Safar hi asli manzil ka maza deta hai.",
        "Raaste naye hon to kahaniyan bhi nayi banti hain.",
        "Har shehar ek nayi yaad de jaata hai.",
        "Musafir ka dil kabhi ek jagah nahi tikta."
    ],
    "Success Shayari": [
        "Mehnat ki buniyad par hi kamyabi ka mahal banta hai.",
        "Girkar uthna hi jeet ki pehli nishani hai.",
        "Kamyabi unhi ko milti hai jo rukte nahi.",
        "Har sangharsh ek nayi jeet ki taraf le jaata hai."
    ],
    "Heart Touching Shayari": [
        "Kuch log dil mein utar jaate hain, yaadon mein nahi.",
        "Rishton ki khoobsurti ehsaason se hoti hai.",
        "Ek muskaan kisi ka din badal sakti hai.",
        "Dil se nikli dua kabhi beasar nahi hoti."
    ],
    "Indian Nature": [
        "Fizaon mein ek alag hi nasha hai, prakriti ka roop sabse sacha hai.",
        "Hawaon se kaho thoda aahista chalein, humein in nazaron mein kho jana hai.",
        "Zindagi ek safar hai, aur ye raaste bahut khoobsurat hain.",
        "Sukoon dhundte dhundte, hum wadiyon mein nikal aaye."
    ],
    "Hindu Devotional": [
        "Mahakal ki sharan mein, har dard bhool gaye.",
        "Jiske nath Bholenath, wo anath kaise?",
        "Karm kiye ja fal ki chinta mat kar, Tera hisaab wo upar wala rakhega.",
        "Radhe Radhe bol, har chinta ko bhool."
    ],
    "Monsoon Rain": [
        "Baarish ki boondon mein aaj bhi teri yaad aati hai.",
        "Ye mausam ki barish, ye aasmaan ka rona, aur ek chai ka cup...",
        "Mitti ki khushboo bata rahi hai, ishq aaj bhi zinda hai.",
        "Bhale hi bheege hain hum barish mein, par aag dil mein aaj bhi lagti hai."
    ],
    "Dark Aesthetic": [
        "Khamoshi mein jo sunai de, wahi asliyat hai.",
        "Hum dard chupana jaante hain, jatana nahi.",
        "Raat jitni gehri hoti hai, sitare utne hi chamakte hain.",
        "Waqt badalta hai, aur uske sath log bhi badal jaate hain.",
        "Akele chalna seekh liya hai, ab mehfilon ki jarurat nahi."
    ],
    "Royal Attitude": [
        "Hum waqt ke saath nahi, waqt hamare saath chalta hai.",
        "Apni pehchaan khud banayi hai, kisi ke sahare nahi.",
        "Shauk unche hain aur soch usse bhi unchi.",
        "Humse jalne walon ki bhi ek alag mehfil hai.",
        "Jahan hamara naam aata hai, kahani wahi se shuru hoti hai."
    ],
    "Village Life": [
        "Gaon ki mitti ki khushboo, shehar mein kahan milti hai.",
        "Kachche raste aur sacche rishte, gaon ki pehchaan hain.",
        "Pedon ki chhaon mein jo sukoon hai, wo mahalon mein nahi.",
        "Subah ki thandi hawa dil ko sukoon de jaati hai.",
        "Gaon ka har kona ek kahani sunata hai."
    ],
    "Mother Love": [
        "Maa ke kadmon mein hi jannat basti hai.",
        "Duniya ka har rishta badal sakta hai, maa ka pyaar nahi.",
        "Maa ki dua har mushkil ko aasaan bana deti hai.",
        "Uske chehre ki muskaan hi meri khushi hai.",
        "Maa ke bina ghar sirf ek makan lagta hai."
    ],
    "Father Respect": [
        "Baap ki mehnat hi bachon ka sahara hoti hai.",
        "Papa ki khamoshi mein bhi hazaar fikrein hoti hain.",
        "Jisne chalna sikhaya, uska karz kabhi nahi utarta.",
        "Baap ek aisa darakht hai jo khud dhoop mein rehkar chhaon deta hai.",
        "Papa ki dua se hi raaste aasaan lagte hain."
    ],
    "Brother Sister": [
        "Bhai behen ka rishta sabse pyara hota hai.",
        "Ladte bahut hain, par pyaar usse bhi zyada karte hain.",
        "Har mushkil mein bhai behen hi saath khade milte hain.",
        "Raksha Bandhan sirf tyohar nahi, ek ehsaas hai.",
        "Bachpan ki yaadein bhai behen ke bina adhuri hain."
    ],
    "Morning Quotes": [
        "Har subah ek nayi umeed lekar aati hai.",
        "Suraj ki pehli kiran nayi shuruaat ka paigam hai.",
        "Aaj ka din kal se behtar ban sakta hai.",
        "Muskurahat ke saath din ki shuruaat karo.",
        "Subah ka sukoon poore din ko khoobsurat bana deta hai."
    ],
    "Night Thoughts": [
        "Raat ki khamoshi dil ki baatein sun leti hai.",
        "Chand bhi tanha lagta hai kabhi kabhi.",
        "Sitaron mein chhupi hoti hain kai kahaniyan.",
        "Raat aur yaadein aksar saath saath aati hain.",
        "Khamosh raat mein dil sabse zyada bolta hai."
    ],
    "Moon Shayari": [
        "Chand ko dekha to tera chehra yaad aa gaya.",
        "Chandni raat aur teri yaad, dono haseen hain.",
        "Chand bhi tere husn ke saamne feeka lagta hai.",
        "Aasmaan ka chand aur dil ka armaan ek jaise hain.",
        "Chand ki roshni mein mohabbat aur bhi gehri lagti hai."
    ],
    "Mountain Vibes": [
        "Pahadon ki hawa mein ek alag hi sukoon hai.",
        "Unchaiyon par pahunch kar duniya chhoti lagti hai.",
        "Pahad sikhate hain mazboot rehna.",
        "Wadiyon mein gum ho jana bhi ek khushi hai.",
        "Pahadon ka safar dil ko azaad kar deta hai."
    ],
    "River Nature": [
        "Nadi ki tarah behte rehna hi zindagi hai.",
        "Har mod par nadi ek nayi kahani likhti hai.",
        "Behta paani kabhi rukna nahi sikhata.",
        "Nadi aur zindagi dono apna raasta khud banati hain.",
        "Lehron mein bhi ek alag sa sukoon hota hai."
    ],
    "Krishna Bhakti": [
        "Radhe Krishna naam mein hi sukoon hai.",
        "Kanha ki murli har dil ko chhoo leti hai.",
        "Jahan Krishna hain, wahan prem hai.",
        "Radha Krishna ka prem amar hai.",
        "Kanha par bharosa rakho, sab theek hoga."
    ],
    "Hanuman Bhakti": [
        "Jai Bajrangbali, har sankat door karne wale.",
        "Hanuman ji ka naam hi himmat deta hai.",
        "Jahan Hanuman ka vaas hai, wahan dar nahi.",
        "Bajrangbali ki kripa se sab sambhav hai.",
        "Sankat Mochan sab dukh har lete hain."
    ],
    "Festival Vibes": [
        "Tyohar khushiyon ka paigam lekar aate hain.",
        "Har diya ek nayi umeed jagata hai.",
        "Rangon mein basi hoti hai khushiyon ki kahani.",
        "Tyohar rishte aur dil dono jodte hain.",
        "Har utsav zindagi ko aur khoobsurat bana deta hai."
    ],
    "Exam Motivation": [
        "Mehnat ka koi shortcut nahi hota.",
        "Kitabon se dosti kamyabi tak le jaati hai.",
        "Aaj ki mehnat kal ka result hai.",
        "Har chapter ek kadam manzil ki taraf hai.",
        "Khud par bharosa rakho, safalta zaroor milegi."
    ],
    "Student Life": [
        "Student life yaadon ka khazana hoti hai.",
        "Classroom mein hi sapne janm lete hain.",
        "Dosti aur padhai dono yahin seekhne ko milte hain.",
        "Har exam ek naya anubhav deta hai.",
        "School aur college ki yaadein kabhi purani nahi hoti."
    ],
    "Tea Lover": [
        "Ek cup chai aur sukoon bhari shaam.",
        "Chai ke saath har baat khaas lagti hai.",
        "Barish aur chai ki jodi kamaal hai.",
        "Chai sirf drink nahi, ek ehsaas hai.",
        "Har thakan ka ilaaj ek garam chai hai."
    ],
    "Alone Feelings": [
        "Tanhai ne bahut kuch sikha diya.",
        "Akele rehkar khud ko pehchana hai.",
        "Khamoshiyon se dosti ho gayi hai.",
        "Ab bheed mein bhi tanha lagta hai.",
        "Akele chalna ab aadat ban gayi hai."
    ],
    "Broken Heart": [
        "Dil toota hai, magar umeed ab bhi zinda hai.",
        "Mohabbat adhuri thi, ya kahani.",
        "Zakhm dikhte nahi, par gehre hote hain.",
        "Yaadein hi ab sahara ban gayi hain.",
        "Toote dil ki awaaz sirf dil hi samajhta hai."
    ],
    "Success Mindset": [
        "Har din khud ko kal se behtar banao.",
        "Jeet unhi ki hoti hai jo haar nahi maante.",
        "Koshish karne walon ki kabhi haar nahi hoti.",
        "Sapne bade rakho aur mehnat usse bhi badi.",
        "Manzil mil hi jaati hai agar irade mazboot hon."
    ],
    "Positive Life": [
        "Muskurahat har mushkil ko halka kar deti hai.",
        "Khush rehna bhi ek kala hai.",
        "Jo hai usmein khush rehna seekho.",
        "Har din ek nayi blessing hai.",
        "Zindagi ko pyaar se jeena hi asli jeet hai."
    ]
};

function getCaption(query, id) {
    const categoryKeywords = {
        "Love Shayari": ["love", "romantic", "couple", "heart", "crush", "girlfriend", "boyfriend"],
        "Friendship Shayari": ["friend", "friendship", "dost", "bestie"],
        "Motivational Shayari": ["motivation", "success", "goal", "dream", "study", "inspire"],
        "Sad Shayari": ["sad", "alone", "pain", "hurt", "cry", "broken"],
        "Life Shayari": ["life", "zindagi", "journey"],
        "Attitude Shayari": ["attitude", "royal", "swag", "king", "queen"],
        "Breakup Shayari": ["breakup", "ex", "separation"],
        "Travel Shayari": ["travel", "trip", "journey", "mountain", "adventure"],
        "Success Shayari": ["success", "winner", "achievement"],
        "Heart Touching Shayari": ["heart", "emotional", "feelings"],
        "Indian Nature": ["nature", "forest", "mountain", "river", "sunrise", "landscape"],
        "Hindu Devotional": ["mahadev", "mahakal", "shiv", "krishna", "radha", "ram", "hanuman", "temple"],
        "Monsoon Rain": ["rain", "monsoon", "baarish", "cloud", "weather"],
        "Dark Aesthetic": ["dark", "alone", "shadow", "night", "black", "mood"],
        "Royal Attitude": ["royal", "king", "queen", "luxury"],
        "Village Life": ["village", "gaon", "farm", "rural"],
        "Mother Love": ["mother", "maa", "mom"],
        "Father Respect": ["father", "papa", "dad"],
        "Brother Sister": ["brother", "sister", "rakhi", "siblings"],
        "Morning Quotes": ["morning", "sunrise", "good morning"],
        "Night Thoughts": ["night", "moon", "sleep", "stars"],
        "Moon Shayari": ["moon", "chand", "moonlight"],
        "Mountain Vibes": ["mountain", "hill", "trek", "peak"],
        "River Nature": ["river", "waterfall", "lake", "stream"],
        "Krishna Bhakti": ["krishna", "kanha", "radhe"],
        "Hanuman Bhakti": ["hanuman", "bajrangbali"],
        "Festival Vibes": ["festival", "diwali", "holi", "celebration"],
        "Exam Motivation": ["exam", "study", "student", "preparation"],
        "Student Life": ["college", "school", "student", "classroom"],
        "Tea Lover": ["tea", "chai", "cup"],
        "Alone Feelings": ["alone", "lonely", "silence"],
        "Broken Heart": ["broken", "heartbreak", "sad love"],
        "Success Mindset": ["mindset", "growth", "winner"],
        "Positive Life": ["positive", "happy", "smile", "hope"]
    };

    let formattedQuery = query.toLowerCase();
    let category = null; 

    const exactMatch = Object.keys(shayariLibrary).find(key => key.toLowerCase() === formattedQuery);
    if (exactMatch) {
        category = exactMatch;
    } else {
        for (const [cat, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => formattedQuery.includes(keyword))) {
                category = cat;
                break;
            }
        }
    }

    const allCategories = Object.keys(shayariLibrary);
    const chosenCategory = category || allCategories[Math.floor(Math.random() * allCategories.length)];
    
    const cacheKey = id + "_" + chosenCategory;
    if (itemCaptions[cacheKey]) return itemCaptions[cacheKey];

    const list = shayariLibrary[chosenCategory];
    const index = currentBatch.findIndex(item => item.id.toString() === id.toString());
    
    // Safety check just in case index is not found
    const safeIndex = index > -1 ? index : Math.floor(Math.random() * list.length);
    const quote = list[safeIndex % list.length];

    itemCaptions[cacheKey] = quote; 
    return quote;
}

// ============================================================================
// 3. CANVAS EDITOR (Responsive High-Res Status Maker)
// ============================================================================
async function renderCanvas(imageUrl, text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    await img.decode();
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    // Dim background slightly for text readability
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // RESPONSIVE TEXT STYLING (Scales based on image width)
    const fontSize = Math.max(Math.floor(canvas.width * 0.065), 40); // 6.5% of width, min 40px
    ctx.fillStyle = "white";
    ctx.font = `italic bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = Math.floor(fontSize * 0.3); // Shadow scales with font
    
    // Responsive Text Wrapping
    const maxWidth = canvas.width * 0.85; // 85% of image width
    const lineHeight = Math.floor(fontSize * 1.4); // Responsive line spacing
    const words = text.split(" ");
    let line = "";
    let y = canvas.height / 2; // Centered
    
    const lines = [];
    words.forEach(word => {
        let testLine = line + word + " ";
        if (ctx.measureText(testLine).width > maxWidth) {
            lines.push(line);
            line = word + " ";
        } else {
            line = testLine;
        }
    });
    lines.push(line);
    
    // Adjust Y to perfectly center the entire block of text
    y -= (lines.length * lineHeight) / 2;
    lines.forEach(l => {
        ctx.fillText(l, canvas.width/2, y);
        y += lineHeight;
    });
    
    return canvas.toDataURL("image/jpeg", 0.9); // Quality set to 90% for efficiency
}

// ============================================================================
// 4. UI NAVIGATION & SEARCH
// ============================================================================
function setTab(tabName) {
    if (currentTab === tabName) return;
    currentTab = tabName;
    ['image', 'video', 'status', 'favorites'].forEach(tab => {
        const btn = document.getElementById(`nav-${tab}`);
        if(!btn) return;
        const icon = btn.querySelector('i');
        btn.className = "flex flex-col items-center py-2 px-4 rounded-full text-gray-500 hover:text-gray-300 transition-all active:scale-95";
        icon.className = `ph ph-${tab === 'image' ? 'image' : tab === 'video' ? 'video-camera' : tab === 'status' ? 'text-aa' : 'heart'} text-2xl mb-0.5`;
    });
    const activeBtn = document.getElementById(`nav-${tabName}`);
    activeBtn.className = "flex flex-col items-center py-2 px-4 rounded-full bg-emerald-500/10 text-emerald-400 transition-all active:scale-95";
    resetAndFetch();
}

function applySuggestion(query) {
    currentQuery = query;
    searchInput.value = query;
    if (currentTab === 'favorites') setTab('image');
    else resetAndFetch();
}

function handleSearch(event) {
    event.preventDefault();
    currentQuery = searchInput.value.trim();
    if (!currentQuery) return;
    if (currentTab === 'favorites') setTab('image');
    else resetAndFetch();
}

function resetAndFetch() {
    feed.innerHTML = '';
    currentPage = 1;
    hasMoreData = true;
    currentBatch = [];
    itemCaptions = {}; // Clear Cache
    
    if (currentTab === 'favorites') {
        sentinel.style.display = 'none'; 
        renderFavorites();
    } else {
        sentinel.style.display = 'flex';
        fetchMedia();
    }
}

// ============================================================================
// 5. FETCH & RENDER ENGINE
// ============================================================================
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

    const isVideo = currentTab === 'video';
    const endpoint = isVideo 
        ? `https://api.pexels.com/videos/search?query=${currentQuery}&per_page=12&page=${currentPage}&orientation=portrait`
        : `https://api.pexels.com/v1/search?query=${currentQuery}&per_page=12&page=${currentPage}&orientation=portrait`;

    try {
        const response = await fetch(endpoint, { headers: { Authorization: PEXELS_API_KEY } });
        if(!response.ok) throw new Error("API Error");
        
        const data = await response.json();
        const items = isVideo ? data.videos : data.photos;
        
        if (!items || items.length === 0) {
            hasMoreData = false;
            if (currentPage === 1) feed.innerHTML = `<div class="col-span-full text-center py-20 text-gray-500 text-sm">No results found for "${currentQuery}"</div>`;
        } else {
            currentBatch = [...currentBatch, ...items];
            isVideo ? renderVideos(items) : renderImages(items);
            currentPage++;
        }
    } catch (error) { console.error("Fetch Error:", error); } finally {
        isFetching = false;
        loadingSpinner.classList.add('hidden');
    }
}

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

    card.innerHTML = mediaElement;
    card.innerHTML += `<div class="absolute inset-0 bg-gradient-to-t from-[#0b0c10]/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>`;
    
    if (currentTab === 'status' && type === 'image') {
        const quote = getCaption(currentQuery, id);
        card.innerHTML += `
            <div class="absolute inset-0 bg-black/50 flex items-center justify-center p-5 pointer-events-none transition-all cursor-pointer" onclick="openModal('${id}', '${type}', '${displayUrl}', '${mediaUrl}')">
                <p class="text-white text-center font-bold text-lg sm:text-xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] leading-snug tracking-wide italic">"${quote}"</p>
            </div>
        `;
    }

    card.innerHTML += `
        <button onclick="toggleFavorite('${id}', '${type}')" class="absolute top-3 right-3 z-30 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 active:scale-90 transition shadow-lg">
            <i id="heart-${id}" class="${isFav ? 'ph-fill text-red-500' : 'ph text-white'} ph-heart text-xl drop-shadow-md"></i>
        </button>
    `;
    
    return card;
}

// ============================================================================
// 6. LIGHTBOX MODAL & SHARE/COPY LOGIC
// ============================================================================
async function openModal(id, type, displayUrl, downloadUrl) {
    const modal = document.getElementById('media-modal');
    const mediaContainer = document.getElementById('modal-media-container');
    const actionsContainer = document.getElementById('modal-actions');
    const isFav = savedFavorites.some(f => f.id.toString() === id.toString());
    
    if (currentTab === 'status' && type === 'image') {
        const quote = getCaption(currentQuery, id);
        mediaContainer.innerHTML = `
            <div class="relative w-full h-full flex flex-col items-center justify-center">
                <img src="${displayUrl}" class="w-full h-full object-cover opacity-80">
                <textarea id="quote-editor" class="absolute w-[80%] bg-transparent text-white text-center font-bold text-xl border-none outline-none resize-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] italic">${quote}</textarea>
            </div>
        `;
        
        actionsContainer.innerHTML = `
            <button onclick="toggleFavorite('${id}', '${type}')" class="w-12 h-12 shrink-0 flex items-center justify-center bg-gray-800 rounded-full border border-gray-700 shadow-inner active:scale-95 transition">
                <i id="modal-heart-${id}" class="${isFav ? 'ph-fill text-red-500' : 'ph text-white'} ph-heart text-2xl drop-shadow-md"></i>
            </button>
            <button onclick="downloadEdited('${downloadUrl}', '${id}')" class="flex-1 h-12 bg-gray-800 text-white rounded-full text-sm font-bold flex items-center justify-center gap-2 border border-gray-700 shadow-md active:scale-95 transition hover:bg-gray-700">
                <i class="ph ph-download-simple text-xl"></i> Save Edit
            </button>
            <button onclick="shareEdited('${downloadUrl}', '${id}')" class="flex-1 h-12 bg-gradient-to-r from-emerald-400 to-teal-400 text-gray-950 rounded-full text-sm font-black flex items-center justify-center gap-2 active:scale-95 transition shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_25px_rgba(16,185,129,0.4)]">
                <i class="ph ph-export text-xl"></i> Share Edit
            </button>
        `;
    } else {
        mediaContainer.innerHTML = type === 'video'
            ? `<video src="${downloadUrl}" controls autoplay playsinline class="w-full h-full object-cover"></video>`
            : `<img src="${displayUrl}" class="w-full h-full object-cover">`;

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
    }
    
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

async function downloadEdited(url, id) {
    const text = document.getElementById('quote-editor').value;
    const dataUrl = await renderCanvas(url, text);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `status_vault_${id}.jpg`;
    link.click();
}

async function shareEdited(url, id) {
    const text = document.getElementById('quote-editor').value;
    const dataUrl = await renderCanvas(url, text);
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `status_vault_${id}.jpg`, { type: "image/jpeg" });
    if(navigator.canShare && navigator.canShare({files: [file]})) {
        await navigator.share({files: [file], text: text});
    } else {
        alert("Sharing is not supported on this browser.");
    }
}

// ============================================================================
// 7. FAVORITES & NATIVE ACTIONS
// ============================================================================
function toggleFavorite(id, type) {
    const existingIndex = savedFavorites.findIndex(fav => fav.id.toString() === id.toString());
    const gridHeart = document.getElementById(`heart-${id}`);
    const modalHeart = document.getElementById(`modal-heart-${id}`);
    let isNowFav = false;

    if (existingIndex > -1) {
        savedFavorites.splice(existingIndex, 1);
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
            currentBatch.push({ id: fav.id, src: { original: fav.downloadUrl, large: fav.previewUrl }, video_files: [{quality: 'hd', link: fav.downloadUrl}] });
        }
        feed.appendChild(createMediaCardHTML(fav.downloadUrl, fav.id, fav.type, true, fav.previewUrl));
    });
}

async function shareFile(fileUrl, id, type) {
    try {
        const extension = type === 'video' ? 'mp4' : 'jpg';
        const mimeType = type === 'video' ? 'video/mp4' : 'image/jpeg';
        if (!navigator.canShare) return alert("Native share not supported.");

        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const file = new File([blob], `status_vault_${id}.${extension}`, { type: mimeType });

        let shareData = { files: [file], title: 'Status' };
        await navigator.share(shareData);
    } catch (error) { console.error("Share failed:", error); }
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
    } catch (error) { console.error("Download failed:", error); }
}

// PWA Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW setup failed: ', err));
    });
}