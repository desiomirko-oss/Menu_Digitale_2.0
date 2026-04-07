// ==========================================
// 1. CONFIGURAZIONE MASTER
// Incolla qui il link "Pubblica sul web" (.csv) del tuo Google Sheet!
const GOOGLE_SHEET_URL = 'INCOLLA_QUI_IL_TUO_LINK_CSV_PUBBLICATO'; 
// ==========================================

// --- REGISTRAZIONE SERVICE WORKER (Per PWA) ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('Service Worker registrato con successo.', reg);
    }).catch(err => console.log('Errore Service Worker:', err));
  });
}

// --- LOGICA INSTALLAZIONE PWA (Banner) ---
let deferredPrompt;
const installBanner = document.getElementById('install-banner');
const installBtn = document.getElementById('install-btn');
const closeBannerBtn = document.getElementById('close-banner-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBanner.classList.remove('hidden'); // Mostra il banner
});

installBtn.addEventListener('click', () => {
  installBanner.classList.add('hidden');
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('L\'utente ha accettato l\'installazione');
    }
    deferredPrompt = null;
  });
});

closeBannerBtn.addEventListener('click', () => {
  installBanner.classList.add('hidden');
});

// --- MOTORE DATI: PARSING CSV DA GOOGLE SHEETS ---
async function caricaMenuDalCSV() {
  if (GOOGLE_SHEET_URL === 'INCOLLA_QUI_IL_TUO_LINK_CSV_PUBBLICATO') {
    document.getElementById("dishes-section").innerHTML = "<p style='text-align:center;'>Devi inserire il link di Google Sheets nel file app.js!</p>";
    return;
  }

  try {
    const response = await fetch(GOOGLE_SHEET_URL); 
    if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
    
    const csvTesto = await response.text();
    const menuDati = convertiCSVInJSON(csvTesto);
    generaHTMLPiatti(menuDati);
  } catch (error) {
    console.error("Errore fatale:", error);
  }
}

function convertiCSVInJSON(csvText) {
  const righe = csvText.split(/\r\n|\n/);
  if (righe.length < 2) return [];
  const headers = parseCSVLine(righe[0]);
  const risultato = [];

  for (let i = 1; i < righe.length; i++) {
    if (!righe[i].trim()) continue;
    const valori = parseCSVLine(righe[i]);
    const oggettoPiatto = {};
    headers.forEach((header, index) => {
      oggettoPiatto[header.trim()] = valori[index] ? valori[index].trim() : "";
    });
    risultato.push(oggettoPiatto);
  }
  return risultato;
}

function parseCSVLine(testo) {
  let risultati = [''], i = 0, p = '', s = true;
  for (let l = testo.length; i < l; i++) {
    let c = testo[i];
    if (c === '"') { s = !s; if (p === '"') { risultati[risultati.length - 1] += '"'; p = '-'; } else p = c; } 
    else if (c === ',' && s) { c = ''; risultati.push(''); p = c; } 
    else { risultati[risultati.length - 1] += c; p = c; }
  }
  return risultati;
}

function generaHTMLPiatti(datiMenu) {
  const container = document.getElementById("dishes-section");
  container.innerHTML = '';

  datiMenu.forEach(piatto => {
    if (piatto.Attivo && piatto.Attivo.toUpperCase() === "NO") return;

    const isGF = (piatto['Senza Glutine'] && piatto['Senza Glutine'].toUpperCase() === "SI") ? "true" : "false";
    const isVegan = (piatto.Vegano && piatto.Vegano.toUpperCase() === "SI") ? "true" : "false";
    const isVeg = (piatto.Vegetariano && piatto.Vegetariano.toUpperCase() === "SI") ? "true" : "false";
    const isNA = (piatto.Analcolico && piatto.Analcolico.toUpperCase() === "SI") ? "true" : "false";

    const allergeniTesto = piatto.Allerg_IT ? `Allergeni: ${piatto.Allerg_IT}` : "";
    const prezzoFormattato = piatto.Prezzo ? `€ ${piatto.Prezzo}` : "";

    const cardHTML = `
      <div class="dish-card hidden-by-macro" 
           data-macro="${piatto.Macro}" 
           data-gf="${isGF}" data-vegan="${isVegan}" data-veg="${isVeg}" data-na="${isNA}">
        <h3 class="dish-name">${piatto.Nome_IT}</h3>
        ${piatto.Desc_IT ? `<p class="dish-desc">${piatto.Desc_IT}</p>` : ''}
        ${allergeniTesto ? `<p class="dish-allerg">${allergeniTesto}</p>` : ''}
        <div class="dish-price">${prezzoFormattato}</div>
      </div>`;
    container.insertAdjacentHTML('beforeend', cardHTML);
  });
}

// --- LOGICA FILTRI E VISTE ---
function filtraPerMacro(macroSelezionata) {
  document.getElementById("btn-back").style.display = "block"; // Mostra tasto indietro
  
  const allDishes = document.querySelectorAll(".dish-card");
  allDishes.forEach(dish => {
    if (dish.getAttribute("data-macro") === macroSelezionata) {
      dish.classList.remove("hidden-by-macro");
    } else {
      dish.classList.add("hidden-by-macro");
    }
  });
  applicaFiltri(); // Riapplica i filtri (es. Veg) sulla nuova vista
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", function() {
    this.classList.toggle("active");
    applicaFiltri();
  });
});

function applicaFiltri() {
  const activeFilters = Array.from(document.querySelectorAll(".filter-btn.active")).map(btn => btn.getAttribute("data-filter"));
  const allDishes = document.querySelectorAll(".dish-card:not(.hidden-by-macro)"); // Filtra solo quelli visibili nella Macro attuale

  allDishes.forEach(dish => {
    let showDish = true;
    if (activeFilters.length > 0) {
      activeFilters.forEach(filter => {
        if (dish.getAttribute(`data-${filter}`) !== "true") showDish = false;
      });
    }
    if (showDish) dish.classList.remove("hidden-by-filter");
    else dish.classList.add("hidden-by-filter");
  });
}

// --- LOGICA PULSANTI NAVIGAZIONE ---
window.onscroll = function() {
  const btnTop = document.getElementById("btn-top");
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) btnTop.style.display = "block";
  else btnTop.style.display = "none";
};

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
  // Nasconde tutto e torna alla vista Macro principale
  document.querySelectorAll(".dish-card").forEach(dish => dish.classList.add("hidden-by-macro"));
  document.getElementById("btn-back").style.display = "none";
}

// --- INIZIALIZZAZIONE ---
document.addEventListener("DOMContentLoaded", () => {
  caricaMenuDalCSV();
});
