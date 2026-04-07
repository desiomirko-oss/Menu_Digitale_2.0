// /js/config.js

// Creiamo un oggetto globale per salvare lo stato dell'app
window.AppEngine = {
    state: {
        layoutMode: 'MACRO', // Valore di default
    },

    // Funzione che riceve i dati del CSV formattati come dizionario { Parametro: Valore }
    applyEngineSettings: function(configData) {
        
        // 1. IMPOSTAZIONE DEL LAYOUT
        // Leggiamo la riga "Layout_Mode" dal CSV. 
        // Se non c'è, usiamo 'MACRO' come fallback di sicurezza.
        this.state.layoutMode = configData['Layout_Mode'] || 'MACRO';
        console.log("Motore avviato con Layout Mode:", this.state.layoutMode);

        // 2. GESTIONE DELLO SFONDO (BACKGROUND)
        const root = document.documentElement; // Punta al tag :root dell'HTML
        const bgType = configData['App_Bg_Type'];

        if (bgType === 'COLOR') {
            // Impostiamo il colore (o gradiente) e disattiviamo l'immagine
            // Se metti un gradiente nel CSV, javascript e CSS lo leggeranno nativamente
            root.style.setProperty('--app-bg-color', configData['App_Bg_Color']);
            root.style.setProperty('--app-bg-image', 'none');
        
        } else if (bgType === 'IMAGE') {
            // Impostiamo l'URL dell'immagine e le sue regole
            root.style.setProperty('--app-bg-image', `url('${configData['App_Bg_Image']}')`);
            root.style.setProperty('--app-bg-position', configData['App_Bg_Image_Pos']);
            root.style.setProperty('--app-bg-size', configData['App_Bg_Image_Size']);
            
            // Usiamo il colore come "fallback" mentre l'immagine si carica
            root.style.setProperty('--app-bg-color', configData['App_Bg_Color']);
        }
    }
};
