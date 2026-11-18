// STORICO DEI PRESTITI
let prestitiConclusiCaricati = [];
// CARICAMENTO DELLO STORICO
async function caricaStoricoPrestiti() {
    const elenco = document.getElementById("elenco-prestiti-restituiti");
    const contatore = document.getElementById("totale-prestiti-conclusi");
    try {
        const risposta = await fetch("api/gestione_prestiti.php", {
            cache: "no-store"
        });
        if (!risposta.ok) 
        {
            throw new Error("Errore nel caricamento dello storico.");
        }
        const prestiti = await risposta.json();
        if (!Array.isArray(prestiti)) 
        {
            throw new Error("Formato dei dati non valido.");
        }
        // Seleziona soltanto i prestiti restituiti
        prestitiConclusiCaricati = prestiti.filter(function(prestito) {
            return prestito.data_restituzione !== null;
        });
        contatore.textContent = prestitiConclusiCaricati.length;
        mostraStoricoPrestiti();
    } catch (errore) {
        console.error(errore);
        prestitiConclusiCaricati = [];
        contatore.textContent = "—";
        elenco.innerHTML = '<tr><td colspan="6">Impossibile caricare lo storico dei prestiti.</td></tr>';
    }
}
// FORMATTAZIONE DELLE DATE
function formattaData(data) {
    if (!data) 
    {
        return "";
    }
    // Convertiamo AAAA-MM-GG in GG/MM/AAAA
    const parti = String(data).substring(0, 10).split("-");
    if (parti.length === 3) {
        return parti[2] + "/" + parti[1] + "/" + parti[0];
    }
    return String(data);
}
// RICERCA PER TITOLO, AUTORE, LETTORE O DATA
const ricercaStorico = document.getElementById("ricerca-storico");
ricercaStorico.addEventListener("input", function() {
    mostraStoricoPrestiti();
});
// VISUALIZZAZIONE DELLO STORICO
function mostraStoricoPrestiti() {
    const elenco = document.getElementById("elenco-prestiti-restituiti");
    const testoRicerca = ricercaStorico.value.trim().toLowerCase();
    elenco.innerHTML = "";
    const prestitiFiltrati = prestitiConclusiCaricati.filter(function(prestito) {
        const lettore = [prestito.nome,prestito.cognome].filter(Boolean).join(" ").toLowerCase();
        const titolo = String(prestito.titolo || "").toLowerCase();
        const autore = String(prestito.autore || "").toLowerCase();
        const date = [prestito.data_prestito,prestito.data_scadenza, prestito.data_restituzione];
        // Cerca sia nelle date nel formato GG/MM/AAAA sia nel formato AAAA/MM/GG
        const dateRicercabili = date.map(function(data) {return String(data || "") + " " + formattaData(data);}).join(" ").toLowerCase();
        return (lettore.includes(testoRicerca) ||titolo.includes(testoRicerca) || autore.includes(testoRicerca) ||dateRicercabili.includes(testoRicerca));
    });
    // NESSUN PRESTITO CONCLUSO
    if (prestitiConclusiCaricati.length === 0) 
    {
        elenco.innerHTML ='<tr><td colspan="6">Nessun prestito restituito.</td></tr>';
        return;
    }
    // NESSUN RISULTATO DELLA RICERCA
    if (prestitiFiltrati.length === 0) {
        elenco.innerHTML ='<tr><td colspan="6">Nessun prestito trovato.</td></tr>';
        return;
    }
    // CREAZIONE DELLE RIGHE DELLA TABELLA
    prestitiFiltrati.forEach(function(prestito) {
        const riga = document.createElement("tr");
        const nomeLettore = [prestito.nome,prestito.cognome].filter(Boolean).join(" ");
        const dati = [nomeLettore,prestito.titolo,prestito.autore,formattaData(prestito.data_prestito),formattaData(prestito.data_scadenza),formattaData(prestito.data_restituzione)];
        dati.forEach(function(valore) {
            const cella = document.createElement("td");
            cella.textContent = valore ?? "";
            riga.appendChild(cella);
        });
        elenco.appendChild(riga);
    });
}
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
        // NOME E COGNOME DEL BIBLIOTECARIO
        const nomeCompleto = [utente.nome,utente.cognome].filter(Boolean).join(" ");
        document.getElementById("nome-utente").textContent =nomeCompleto;
        // INFORMAZIONI PERSONALI
        document.getElementById("profilo-nome").textContent = utente.nome || "";
        document.getElementById("profilo-cognome").textContent = utente.cognome || "";
        document.getElementById("profilo-email").textContent = utente.email || "";
        // CARICa LO STORICO DOPO LA VERIFICA DEL RUOLO
        await caricaStoricoPrestiti();
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
    pulsanteProfilo.setAttribute("aria-expanded",String(!menuProfilo.hidden));
});
// CHIUSURA DEL MENU CLICCANDO FUORI
document.addEventListener("click", function(evento) {
    if (!evento.target.closest(".profilo-dashboard")) 
    {
        menuProfilo.hidden = true;
        pulsanteProfilo.setAttribute("aria-expanded", "false");
    }
});
// CHIUSURA DEL MENU CON ESC
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
