const VERSION = "3.1-DEBUG-LOGO";
console.log("Versione App: " + VERSION);

const urlParams = new URLSearchParams(window.location.search);
const SHEET_ID = urlParams.get('id'); 
let appConfig = {};
let fullData = [];

// --- PULIZIA STRINGHE (Elimina virgole e virgolette extra) ---
function cleanString(val) {
    if (!val) return '';
    return String(val).trim().replace(/^["']|["']$/g, '').replace(/,+$/, '').trim();
}

// --- LETTURA CONFIG ---
function getVal(key, def) {
    const searchKey = key.toLowerCase();
    for (let k in appConfig) {
        if (k.toLowerCase() === searchKey) return appConfig[k] || def;
    }
    return def;
}

async function fetchConfig() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=config&t=${Date.now()}`;
    try {
        const response = await fetch(url);
        const csv = await response.text();
        const rows = csv.split(/\r?\n/).slice(1);
        rows.forEach(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split intelligente per CSV
            if (cols.length >= 2) {
                const k = cleanString(cols[0]);
                const v = cleanString(cols[1]);
                if (k) appConfig[k] = v;
            }
        });
        console.log("Configurazione caricata con successo:", appConfig);
    } catch (e) {
        console.error("Errore nel caricamento del Config:", e);
    }
}

function applyConfig() {
    const logoCont = document.getElementById('logo-container');
    const url = getVal('Logo_Image_URL', '');
    
    if (!url) {
        console.warn("ATTENZIONE: Nessun URL trovato nel foglio Config per 'Logo_Image_URL'.");
        return;
    }

    const align = getVal('Logo_Align', 'center').toLowerCase();
    logoCont.style.justifyContent = align === 'left' ? 'flex-start' : (align === 'right' ? 'flex-end' : 'center');
    logoCont.style.marginTop = getVal('Logo_Margin_Top', '0px');
    logoCont.style.marginBottom = getVal('Logo_Margin_Bottom', '0px');
    
    logoCont.innerHTML = `<img src="${url}" style="max-height:${getVal('Logo_Height', '60px')}; object-fit:contain;" alt="Logo" onload="updateLayout()">`;
}

// (Le altre funzioni fetchMenu, render, etc. rimangono come prima)
// ... inserisci qui le funzioni fetchMenu(), updateLayout() e init() del messaggio precedente ...

async function init() {
    if (!SHEET_ID) return;
    await fetchConfig();
    applyConfig();
    // fetchMenu(); // Riattiva dopo aver sistemato il logo
}
init();
