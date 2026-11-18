/* GESTIONE DELLE COPIE */
// DATI UTILIZZATI PER LA RICERCA
let copieCaricate = [];
let libriCaricati = [];
// CARICAMENTO DEI LIBRI NEL MENU
async function caricaLibri() {
    const menu = document.getElementById("id_libro");
    try {
        const risposta = await fetch("api/gestione_libri.php", {
            cache: "no-store"
        });
        if (!risposta.ok) 
        {
            throw new Error("Errore nel caricamento dei libri.");
        }
        const libri = await risposta.json();
        libriCaricati = libri;
        menu.innerHTML = '<option value="">Seleziona un libro...</option>';
        libri.forEach(function(libro) {
            const opzione = document.createElement("option");
            opzione.value = libro.id_libro;
            opzione.textContent = libro.titolo;
            menu.appendChild(opzione);
        });
    } catch (errore) {
        console.error(errore);
        alert("Impossibile caricare il menu dei libri.");
    }
}
// CARICAMENTO DELLE COPIE
async function caricaCopie() {
    const elenco = document.getElementById("elenco-copie");
    try {
        const risposta = await fetch("api/gestione_copie.php", {
            cache: "no-store"
        });
        if (!risposta.ok) {
            throw new Error("Errore nel caricamento delle copie.");
        }
        copieCaricate = await risposta.json();
        mostraCopie();
    } catch (errore) {
        console.error(errore);
        elenco.innerHTML =
            '<tr><td colspan="7">Impossibile caricare le copie.</td></tr>';
    }
}
// RICERCA DELLE COPIE PER TITOLO O AUTORE
const ricercaCopie = document.getElementById("ricerca-copie");
ricercaCopie.addEventListener("input", function() {
    mostraCopie();
});
// VISUALIZZAZIONE DELLE COPIE
function mostraCopie() {
    const elenco = document.getElementById("elenco-copie");
    const messaggio = document.getElementById("nessuna-copia");
    const testoRicerca = ricercaCopie.value.trim().toLowerCase();
    elenco.innerHTML = "";
    messaggio.style.display = "none";
    const copieFiltrate = copieCaricate.filter(function(copia) {
        const titolo = String(copia.titolo || "").toLowerCase();
        const autore = String(copia.autore || "").toLowerCase();
        return titolo.includes(testoRicerca) || autore.includes(testoRicerca);
    });
    // Nessuna copia registrata
    if (copieCaricate.length === 0) {
        elenco.innerHTML = '<tr><td colspan="7">Nessuna copia presente.</td></tr>';
        return;
    }
    // Nessun risultato della ricerca
    if (copieFiltrate.length === 0) 
    {
        messaggio.style.display = "block";
        return;
    }
    // Creazione delle righe della tabella
    copieFiltrate.forEach(function(copia) {
        const riga = document.createElement("tr");
        // Convertiamo gli stati in testi leggibili
        let statoVisualizzato;
        if (copia.stato === "in_prestito") 
        {
            statoVisualizzato = "In prestito";
        } else if (copia.stato === "non_disponibile") {
            statoVisualizzato = "Non più disponibile";
        } else {
            statoVisualizzato = "Disponibile";
        }
        // Informazioni del libro e della singola copia
        const dati = [copia.titolo,copia.autore,copia.editore,copia.id_copia,statoVisualizzato];
        dati.forEach(function(valore) {
            const cella = document.createElement("td");
            cella.textContent = valore ?? "";
            riga.appendChild(cella);
        });
        // PULSANTE MODIFICA STATO
        const cellaModifica = document.createElement("td");
        const pulsanteModifica = document.createElement("button");
        pulsanteModifica.type = "button";
        pulsanteModifica.textContent = "Modifica stato";
        if (copia.stato === "in_prestito") {
            pulsanteModifica.disabled = true;
            pulsanteModifica.title =
                "La copia deve essere restituita prima di modificarne lo stato.";
        } else {
            pulsanteModifica.addEventListener("click", function() {
                modificaStatoCopia(copia);
            });
        }
        cellaModifica.appendChild(pulsanteModifica);
        riga.appendChild(cellaModifica);
        // PULSANTE ELIMINA
        const cellaElimina = document.createElement("td");
        const pulsanteElimina = document.createElement("button");
        pulsanteElimina.type = "button";
        pulsanteElimina.textContent = "Elimina";
        if (copia.stato === "in_prestito") {
            pulsanteElimina.disabled = true;
            pulsanteElimina.title = "Non è possibile eliminare una copia attualmente in prestito.";
        } else {
            pulsanteElimina.addEventListener("click", function() {
                eliminaCopia(copia);
            });
        }
        cellaElimina.appendChild(pulsanteElimina);
        riga.appendChild(cellaElimina);
        elenco.appendChild(riga);
    });
}
// MODIFICA DELLO STATO DI UNA COPIA
async function modificaStatoCopia(copia) {
    let nuovoStato;
    let messaggioConferma;
    if (copia.stato === "disponibile") 
    {
        nuovoStato = "non_disponibile";
        messaggioConferma = "Vuoi rendere non più disponibile la copia n. " + copia.id_copia + " del libro \"" + copia.titolo + "\"?";
    } else if (copia.stato === "non_disponibile") {
        nuovoStato = "disponibile";
        messaggioConferma ="Vuoi rendere nuovamente disponibile la copia n. " + copia.id_copia + " del libro \"" + copia.titolo + "\"?";
    } else {
        alert("Non è possibile modificare questa copia.");
        return;
    }
    if (!confirm(messaggioConferma)) 
    {
        return;
    }
    const dati = new FormData();
    dati.append("id_copia", copia.id_copia);
    dati.append("stato", nuovoStato);
    try {
        const risposta = await fetch("api/modifica_stato_copia.php", {
            method: "POST",
            body: dati
        });
        const risultato = await risposta.json();
        if (risposta.ok) 
        {
            alert(risultato.messaggio);
            await caricaCopie();
        } else {
            alert(risultato.errore || "Impossibile modificare lo stato.");
        }
    } catch (errore) {
        console.error(errore);
        alert("Impossibile modificare lo stato della copia.");
    }
}
// ELIMINAZIONE DI UNA SINGOLA COPIA
async function eliminaCopia(copia) {
    const conferma = confirm("Vuoi eliminare definitivamente la copia n. " 
        + copia.id_copia + " del libro \"" + copia.titolo + "\"?\n\n" 
        +"L'eliminazione è consentita soltanto se la copia " +
        "non è mai stata associata a un prestito."
    );
    if (!conferma) 
    {
        return;
    }
    const dati = new FormData();
    dati.append("id_copia", copia.id_copia);
    try {
        const risposta = await fetch("api/elimina_copia.php", {
            method: "POST",
            body: dati
        });
        const risultato = await risposta.json();
        if (risposta.ok) 
        {
            alert(risultato.messaggio);
            await caricaCopie();
        } else {
            alert(risultato.errore || "Impossibile eliminare la copia.");
        }
    } catch (errore) {
        console.error(errore);
        alert("Impossibile eliminare la copia.");
    }
}
// AGGIUNTA DI UNA NUOVA COPIA
const formCopia = document.getElementById("form-copia");
formCopia.addEventListener("submit", async function(evento) {
    evento.preventDefault();
    const dati = new FormData(formCopia);
    try {
        const risposta = await fetch("api/aggiungi_copia.php", {
            method: "POST",
            body: dati
        });
        const risultato = await risposta.json();
        if (risposta.ok) 
        {
            alert(risultato.messaggio);
            formCopia.reset();
            await caricaCopie();
        } else {
            alert(risultato.errore || "Impossibile aggiungere la copia.");
        }
    } catch (errore) {
        console.error(errore);
        alert("Impossibile aggiungere la copia.");
    }
});
// CONTROLLO DELL'ACCESSO DEL BIBLIOTECARIO
async function controllaBibliotecario() {
    try {
        const risposta = await fetch("api/sessione.php", {
            cache: "no-store"
        });

        if (!risposta.ok) 
        {
            window.location.replace("login.html");
            return;
        }
        const utente = await risposta.json();
        if (!utente.autenticato || utente.ruolo !== "bibliotecario") 
        {
            window.location.replace("login.html");
            return;
        }
        // Nome e cognome del bibliotecario
        const nomeCompleto = [utente.nome, utente.cognome].filter(Boolean).join(" ");
        document.getElementById("nome-utente").textContent = nomeCompleto;
        // Informazioni del profilo
        document.getElementById("profilo-nome").textContent = utente.nome || "";
        document.getElementById("profilo-cognome").textContent = utente.cognome || "";
        document.getElementById("profilo-email").textContent = utente.email || "";
        // Carica i libri e le copie
        await caricaLibri();
        await caricaCopie();
    } catch (errore) {
        console.error(errore);
        window.location.replace("login.html");
    }
}
// APERTURA E CHIUSURA DEL MENU DEL PROFILO
const pulsanteProfilo = document.getElementById("pulsante-profilo-dashboard");
const menuProfilo = document.getElementById("menu-profilo-dashboard");
pulsanteProfilo.addEventListener("click", function() {
    menuProfilo.hidden = !menuProfilo.hidden;
    pulsanteProfilo.setAttribute("aria-expanded", String(!menuProfilo.hidden));
});
// Chiude il menu cliccando fuori dal profilo
document.addEventListener("click", function(evento) {
    if (!evento.target.closest(".profilo-dashboard")) 
    {
        menuProfilo.hidden = true;
        pulsanteProfilo.setAttribute("aria-expanded", "false");
    }
});
// Chiudiamo il menu premendo Esc
document.addEventListener("keydown", function(evento) {
    if (evento.key === "Escape") 
    {
        menuProfilo.hidden = true;
        pulsanteProfilo.setAttribute("aria-expanded", "false");
    }
});
// LOGOUT DEL BIBLIOTECARIO
const pulsanteEsci = document.getElementById("pulsante-esci");
pulsanteEsci.addEventListener("click", async function() {
    try {
        const risposta = await fetch("api/logout.php", {
            method: "POST"
        });
        if (!risposta.ok) 
        {
            throw new Error("Errore durante la disconnessione.");
        }
        window.location.replace("login.html");
    } catch (errore) {
        console.error(errore);
        alert("Impossibile effettuare la disconnessione.");
    }
});
// AVVIO DELLA PAGINA
controllaBibliotecario();
