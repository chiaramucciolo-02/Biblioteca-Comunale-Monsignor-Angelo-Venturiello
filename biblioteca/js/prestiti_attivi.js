/* GESTIONE DEI PRESTITI ATTIVI */
// PRESTITI CARICATI DAL DATABASE
let prestitiAttiviCaricati = [];
// CARICAMENTO DEI PRESTITI ATTIVI
async function caricaPrestitiAttivi() {
    const elenco = document.getElementById("elenco-prestiti-attivi");
    const contatore = document.getElementById("totale-prestiti-attivi");
    try {
        const risposta = await fetch("api/gestione_prestiti.php", {
            cache: "no-store"
        });
        if (!risposta.ok) 
        {
            throw new Error("Errore nel caricamento dei prestiti.");
        }
        const prestiti = await risposta.json();
        if (!Array.isArray(prestiti)) 
        {
            throw new Error("Formato dei dati non valido.");
        }
        // Mantiene soltanto i prestiti non restituiti
        prestitiAttiviCaricati = prestiti.filter(function(prestito) {
            return prestito.data_restituzione === null;
        });
        contatore.textContent = prestitiAttiviCaricati.length;
        mostraPrestitiAttivi();
    } catch (errore) {
        console.error(errore);
        contatore.textContent = "—";
        prestitiAttiviCaricati = [];
        elenco.innerHTML = '<tr><td colspan="6">Impossibile caricare i prestiti.</td></tr>';
    }
}
// FORMATTAZIONE DELLE DATE
function formattaData(data) {
    if (!data) 
    {
        return "";
    }
    // Da AAAA-MM-GG a GG/MM/AAAA
    const parti = String(data).substring(0, 10).split("-");
    if (parti.length === 3) 
    {
        return parti[2] + "/" + parti[1] + "/" + parti[0];
    }
    return String(data);
}
// RICERCA PER TITOLO, AUTORE, LETTORE O DATA
const ricercaPrestiti = document.getElementById("ricerca-prestiti");
if (ricercaPrestiti) 
{
    ricercaPrestiti.addEventListener("input", function() {
        mostraPrestitiAttivi();
    });
}
// VISUALIZZAZIONE DEI PRESTITI ATTIVI
function mostraPrestitiAttivi() {
    const elenco = document.getElementById("elenco-prestiti-attivi");
    const testoRicerca = ricercaPrestiti ? ricercaPrestiti.value.trim().toLowerCase(): "";
    elenco.innerHTML = "";
    const prestitiFiltrati = prestitiAttiviCaricati.filter(function(prestito) {
        const lettore = (String(prestito.nome || "") + " " + String(prestito.cognome || "")).toLowerCase();
        const titolo = String(prestito.titolo || "").toLowerCase();
        const autore = String(prestito.autore || "").toLowerCase();
        const dataPrestito = formattaData(prestito.data_prestito);
        const dataScadenza = formattaData(prestito.data_scadenza);
        // Permette anche la ricerca nel formato AAAA-MM-GG
        const dataPrestitoOriginale =
            String(prestito.data_prestito || "");
        const dataScadenzaOriginale =String(prestito.data_scadenza || "");
        return (lettore.includes(testoRicerca) ||titolo.includes(testoRicerca) ||autore.includes(testoRicerca) ||dataPrestito.includes(testoRicerca) ||
            dataScadenza.includes(testoRicerca) ||
            dataPrestitoOriginale.includes(testoRicerca) ||
            dataScadenzaOriginale.includes(testoRicerca));
    });
    // NESSUN PRESTITO ATTIVO
    if (prestitiAttiviCaricati.length === 0) 
    {
        elenco.innerHTML ='<tr><td colspan="6">Nessun prestito attivo.</td></tr>';
        return;
    }
    // NESSUN RISULTATO DELLA RICERCA
    if (prestitiFiltrati.length === 0) 
    {
        elenco.innerHTML ='<tr><td colspan="6">Nessun prestito trovato.</td></tr>';
        return;
    }
    // CREAZIONE DELLE RIGHE DELLA TABELLA
    prestitiFiltrati.forEach(function(prestito) {
        const riga = document.createElement("tr");
        const nomeLettore = [prestito.nome,prestito.cognome].filter(Boolean).join(" ");
        const dati = [nomeLettore,prestito.titolo,prestito.autore,formattaData(prestito.data_prestito),formattaData(prestito.data_scadenza)];
        dati.forEach(function(valore) {
            const cella = document.createElement("td");
            cella.textContent = valore ?? "";
            riga.appendChild(cella);
        });
        // PULSANTE PER REGISTRARE LA RESTITUZIONE
        const cellaRestituzione = document.createElement("td");
        const pulsante = document.createElement("button");
        pulsante.type = "button";
        pulsante.textContent = "Registra restituzione";
        pulsante.className = "pulsante-restituzione";
        pulsante.addEventListener("click", function() {
            registraRestituzione(prestito, pulsante);
        });
        cellaRestituzione.appendChild(pulsante);
        riga.appendChild(cellaRestituzione);
        elenco.appendChild(riga);
    });
}
// REGISTRAZIONE DELLA RESTITUZIONE
async function registraRestituzione(prestito, pulsante) {
    const conferma = confirm('Vuoi registrare la restituzione di "' + prestito.titolo + '" da parte di ' + prestito.nome + " " + prestito.cognome + "?");
    if (!conferma) 
    {
        return;
    }
    const dati = new FormData();
    // L'ID prestito serve al database,ma non viene mostrato nella tabella
    dati.append("id_prestito", prestito.id_prestito);
    pulsante.disabled = true;
    try {
        const risposta = await fetch("api/restituzione.php", {
            method: "POST",
            body: dati
        });
        const risultato = await risposta.json();
        if (risposta.ok) 
        {
            alert(risultato.messaggio);
            // Aggiorna tabella e contatore
            await caricaPrestitiAttivi();
        } else {
            alert(risultato.errore ||"Impossibile registrare la restituzione.");
            pulsante.disabled = false;
        }
    } catch (errore) {
        console.error(errore);
        alert("Impossibile registrare la restituzione.");
        pulsante.disabled = false;
    }
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
        // CARICAMENTO DEI PRESTITI
        await caricaPrestitiAttivi();
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
