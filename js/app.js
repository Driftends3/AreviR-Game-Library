// ========================
// SHADOW HUB APP
// ========================

async function start(){

    console.log("================================");
    console.log("SHADOW HUB");
    console.log("Starting...");
    console.log("================================");

    window.showLoading?.();

    try{

        const data = await scanAll();

        console.log("Games found:", data.length);

        window.initUI?.(data);

    } catch(e){

        console.error(e);

        window.hideLoading?.();

        window.icon.src = "";

        window.status.innerHTML = `
            <span class="installed">
                ERROR AL CARGAR
            </span>
        `;

    }

}

// ========================
// START
// ========================

window.onload = () => {
    start();
};