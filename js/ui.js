// ========================
// SHADOW HUB UI ENGINE v2
// ========================

let state = {
    games: [],
    filtered: [],
    selected: 0,
    filter: "ALL",
    ready: false
};

// ========================
// ELEMENTS
// ========================

const el = {
    bgA: document.getElementById("bgA"),
    bgB: document.getElementById("bgB"),
    icon: document.getElementById("icon"),
    status: document.getElementById("status"),
    carousel: document.getElementById("carousel"),
    loading: document.getElementById("loading"),
    clock: document.getElementById("clock"),
    tabs: document.querySelectorAll(".tab")
};

// ========================
// SAFE HELPERS
// ========================

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function safeArray(arr) {
    return Array.isArray(arr) ? arr : [];
}

// ========================
// LOADING SYSTEM
// ========================

function showLoading() {
    if (el.loading) el.loading.style.display = "flex";
}

function hideLoading() {
    if (el.loading) el.loading.style.display = "none";
}

// ========================
// CLOCK
// ========================

function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    if (!el.clock) return;

    const now = new Date();
    el.clock.innerText = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ========================
// FILTER SYSTEM
// ========================

function applyFilter() {

    const games = state.games;

    switch (state.filter) {

        case "PS5":
            state.filtered = games.filter(g => g?.type === "PS5");
            break;

        case "PS4":
            state.filtered = games.filter(g => g?.type === "PS4");
            break;

        case "SHADOW":
            state.filtered = games.filter(g => g?.mounted === true);
            break;

        default:
            state.filtered = games;
            break;
    }

    state.selected = 0;
    render();
}

function setFilter(filter) {
    state.filter = filter;

    el.tabs.forEach(tab => {
        tab.classList.toggle(
            "active",
            tab.dataset.filter === filter
        );
    });

    applyFilter();
}

// ========================
// BACKGROUND
// ========================

function setBackground(src) {

    if (!src || !el.bgA || !el.bgB) return;

    el.bgB.style.backgroundImage = `url("${src}")`;
    el.bgB.style.opacity = 1;

    setTimeout(() => {
        el.bgA.style.backgroundImage = `url("${src}")`;
        el.bgB.style.opacity = 0;
    }, 500);
}

// ========================
// GAME VIEW
// ========================

function showGame(game) {

    if (!game) return;

    el.icon.src = game.logo || game.icon || "";

    el.status.innerHTML = game.mounted
        ? `<span class="shadow">● SHADOW</span>`
        : `<span class="installed">● ${game.type || "UNKNOWN"}</span>`;

    setBackground(game.pic0 || game.bg || "");
}

// ========================
// CAROUSEL
// ========================

function renderCarousel() {

    const games = state.filtered;

    if (!el.carousel) return;

    el.carousel.innerHTML = "";

    const VISIBLE_RANGE = 2; 
    // 2 = 5 juegos (2 izq + centro + 2 der)
    // 3 = 7 juegos si querés más ancho

    for (let offset = -VISIBLE_RANGE; offset <= VISIBLE_RANGE; offset++) {

        const index = state.selected + offset;

        if (index < 0 || index >= games.length) continue;

        const game = games[index];

        const item = document.createElement("div");

        const isCenter = offset === 0;

        item.className = "game" + (isCenter ? " selected" : "");

        const label = game?.mounted ? "SHADOW" : (game?.type || "");

        item.innerHTML = `
            <div class="case">
                <div class="caseHeader">${label}</div>
                <img src="${game?.cover || game?.icon || ""}">
            </div>
            <span>${game?.title || "Unknown"}</span>
        `;

        const dist = offset;

        item.style.transform = `
            scale(${isCenter ? 1.15 : 0.9})
            translateX(${dist * 120}px)
            rotateY(${dist * 10}deg)
        `;

        item.style.zIndex = isCenter ? 10 : 1;

        item.onclick = () => {
            state.selected = index;
            render();
        };

        el.carousel.appendChild(item);
    }
}

// ========================
// MAIN RENDER (ONE SOURCE OF TRUTH)
// ========================

function render() {

    const games = state.filtered;

    if (!games || games.length === 0) {

        if (el.icon) el.icon.src = "";
        if (el.status) el.status.innerText = "No games";
        if (el.carousel) el.carousel.innerHTML = "";

        hideLoading();
        return;
    }

    state.selected = clamp(state.selected, 0, games.length - 1);

    const game = games[state.selected];

    showGame(game);
    renderCarousel();

    hideLoading();
}

// ========================
// NAVIGATION
// ========================

document.addEventListener("keydown", (e) => {

    const games = state.filtered;
    if (!games.length) return;

    if (e.key === "ArrowRight") {
        state.selected = (state.selected + 1) % games.length;
        render();
    }

    if (e.key === "ArrowLeft") {
        state.selected = (state.selected - 1 + games.length) % games.length;
        render();
    }

    if (e.key === "Enter") {
        if (typeof launch === "function") {
            launch(games[state.selected]);
        }
    }
});

// ========================
// INIT UI
// ========================

function initUI(data) {

    state.games = safeArray(data);

    startClock();
    setFilter("ALL");

    requestAnimationFrame(() => {
        render();
        hideLoading();
        state.ready = true;
    });
}

// ========================
// EXPORTS (IMPORTANT)
// ========================

window.initUI = initUI;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.setFilter = setFilter;