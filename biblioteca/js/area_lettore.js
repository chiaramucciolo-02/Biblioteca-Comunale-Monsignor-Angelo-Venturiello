/* AREA PERSONALE DEL LETTORE */
// CARICAMENTO DEI PRESTITI DEL LETTORE
// Converte le date dal formato AAAA-MM-GG a GG/MM/AAAA
function formattaData(data) {
    if (!data) {
        return "";
    }

    const parti = data.split("-");
    if (parti.length !== 3) {
        return data;
    }

    return `${parti[2]}/${parti[1]}/${parti[0]}`;
}
async function caricaPrestiti() {
    const elencoPrestiti = document.getElementById("elenco-prestiti");
    try {
        const risposta = await fetch("api/prestiti_lettore.php", {
            cache: "no-store"
        });
        if (!risposta.ok) 
        {
            throw new Error("Errore nel caricamento dei prestiti.");
        }
        const prestiti = await risposta.json();
        elencoPrestiti.innerHTML = "";
        // Calcoliamo i prestiti attivi e quelli conclusi
        const prestitiAttivi = prestiti.filter(function(prestito) {
            return prestito.data_restituzione === null;
        }).length;
        const prestitiConclusi = prestiti.filter(function(prestito) {
            return prestito.data_restituzione !== null;
        }).length;
        // Aggiorniamo i contatori personali
        document.getElementById("totale-prestiti-attivi").textContent = prestitiAttivi;
        document.getElementById("totale-prestiti-conclusi").textContent = prestitiConclusi;
        // Messaggio per i lettori senza prestiti
        if (prestiti.length === 0) {
            const riga = document.createElement("tr");
            const cella = document.createElement("td");
            cella.colSpan = 4;
            cella.textContent = "Non hai ancora prestiti da visualizzare.";
            riga.appendChild(cella);
            elencoPrestiti.appendChild(riga);
            return;
        }
        // Creazione delle righe della tabella
        prestiti.forEach(function(prestito) {
            const riga = document.createElement("tr");
            const stato = prestito.data_restituzione === null ? "In prestito": "Restituito il " + formattaData(prestito.data_restituzione); 
            const valori = [prestito.titolo,formattaData(prestito.data_prestito),formattaData(prestito.data_scadenza),stato];
            valori.forEach(function(valore) {
                const cella = document.createElement("td");
                cella.textContent = valore;
                riga.appendChild(cella);
            });
            elencoPrestiti.appendChild(riga);
        });
    } catch (errore) {
        console.error(errore);
        elencoPrestiti.innerHTML = "";
        const riga = document.createElement("tr");
        const cella = document.createElement("td");
        cella.colSpan = 4;
        cella.textContent = "Impossibile caricare i prestiti.";
        riga.appendChild(cella);
        elencoPrestiti.appendChild(riga);
    }
}
// DATI PERSONALI DEL LETTORE
let datiLettore = null;
// Aggiorna le informazioni visualizzate nel profilo
function aggiornaDatiProfilo(utente) {
    datiLettore = {nome: utente.nome || "",cognome: utente.cognome || "",email: utente.email || ""};
    const nomeCompleto = [datiLettore.nome,datiLettore.cognome].filter(Boolean).join(" ");
    document.getElementById("nome-utente").textContent = nomeCompleto;
    document.getElementById("profilo-nome").textContent = datiLettore.nome;
    document.getElementById("profilo-cognome").textContent = datiLettore.cognome;
    document.getElementById("profilo-email").textContent = datiLettore.email;
}
// CONTROLLO DELL'ACCESSO DEL LETTORE
async function controllaLettore() {
    try {
        const risposta = await fetch("api/sessione.php", {cache: "no-store"});
        if (!risposta.ok) 
        {
            window.location.replace("login.html");
            return;
        }
        const utente = await risposta.json();
        if (!utente.autenticato || utente.ruolo !== "lettore") 
        {
            window.location.replace("login.html");
            return;
        }
        // Mostra i dati del lettore autenticato
        aggiornaDatiProfilo(utente);
        // Carica i prestiti dopo aver verificato la sessione
        await caricaPrestiti();
    } catch (errore) {
        console.error(errore);
        window.location.replace("login.html");
    }
}
// APERTURA E CHIUSURA DEL MENU DEL PROFILO
const pulsanteProfilo = document.getElementById("pulsante-profilo");
const menuProfilo = document.getElementById("menu-profilo");
function chiudiMenuProfilo() {
    menuProfilo.hidden = true;
    pulsanteProfilo.setAttribute("aria-expanded","false");
}
pulsanteProfilo.addEventListener("click", function() {
    menuProfilo.hidden = !menuProfilo.hidden;
    pulsanteProfilo.setAttribute("aria-expanded",String(!menuProfilo.hidden));
});
// Chiude il menu cliccando fuori dal profilo
document.addEventListener("click", function(evento) {
    if (!evento.target.closest(".profilo-lettore")) 
    {
        chiudiMenuProfilo();
    }
});
// Chiude il menu premendo Esc
document.addEventListener("keydown", function(evento) {
    if (evento.key === "Escape") 
    {
        chiudiMenuProfilo();
    }
});
// MODIFICA DELLE INFORMAZIONI PERSONALI
const pulsanteModificaProfilo = document.getElementById("modifica-profilo");
const formModificaProfilo = document.getElementById("form-modifica-profilo");
const pulsanteAnnullaProfilo = document.getElementById("annulla-modifica-profilo");
const pulsanteModificaPassword = document.getElementById("modifica-password");
const formModificaPassword = document.getElementById("form-modifica-password");
const pulsanteAnnullaPassword = document.getElementById("annulla-modifica-password");
// Apre il modulo con i dati già compilati
pulsanteModificaProfilo.addEventListener("click", function() {
    if (!datiLettore) 
    {
        return;
    }
    formModificaPassword.hidden = true;
    formModificaPassword.reset();
    document.getElementById("modifica-nome").value = datiLettore.nome;
    document.getElementById("modifica-cognome").value = datiLettore.cognome;
    document.getElementById("modifica-email").value = datiLettore.email;
    formModificaProfilo.hidden = false;
    pulsanteModificaProfilo.hidden = true;
    pulsanteModificaPassword.hidden = false;
});
// Annulla la modifica delle informazioni personali
pulsanteAnnullaProfilo.addEventListener("click", function() {
    formModificaProfilo.hidden = true;
    formModificaProfilo.reset();
    pulsanteModificaProfilo.hidden = false;
});
// Salva le nuove informazioni personali
formModificaProfilo.addEventListener("submit", async function(evento) {
    evento.preventDefault();
    const pulsanteSalva = formModificaProfilo.querySelector('button[type="submit"]');
    const dati = new FormData(formModificaProfilo);
    pulsanteSalva.disabled = true;
    try {
        const risposta = await fetch("api/modifica_profilo.php", {
            method: "POST",body: dati
        });
        const risultato = await risposta.json();
        if (!risposta.ok) {
            throw new Error(risultato.errore || "Errore durante la modifica.");
        }
        // Aggiorna subito le informazioni mostrate
        aggiornaDatiProfilo(risultato);
        formModificaProfilo.hidden = true;
        formModificaProfilo.reset();
        pulsanteModificaProfilo.hidden = false;
        alert("Informazioni personali aggiornate con successo.");
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    } finally {
        pulsanteSalva.disabled = false;
    }
});
// MODIFICA DELLA PASSWORD
// Apre il modulo per modificare la password
pulsanteModificaPassword.addEventListener("click", function() {
    formModificaProfilo.hidden = true;
    formModificaProfilo.reset();
    pulsanteModificaProfilo.hidden = false;
    formModificaPassword.reset();
    formModificaPassword.hidden = false;
    pulsanteModificaPassword.hidden = true;
});
// Annulla la modifica della password
pulsanteAnnullaPassword.addEventListener("click", function() {
    formModificaPassword.hidden = true;
    formModificaPassword.reset();
    pulsanteModificaPassword.hidden = false;
});
// Salva la nuova password
formModificaPassword.addEventListener("submit", async function(evento) {
    evento.preventDefault();
    const pulsanteSalva =
        formModificaPassword.querySelector('button[type="submit"]');
    const dati = new FormData(formModificaPassword);
    const passwordNuova =
        document.getElementById("password-nuova").value;
    const confermaPassword =
        document.getElementById("conferma-password").value;
    if (passwordNuova !== confermaPassword) 
    {
        alert("Le nuove password non coincidono.");
        return;
    }
    pulsanteSalva.disabled = true;
    try {
        const risposta = await fetch("api/modifica_password.php", {
            method: "POST", body: dati
        });
        const risultato = await risposta.json();
        if (!risposta.ok) 
        {
            throw new Error(
                risultato.errore || "Errore durante la modifica."
            );
        }
        formModificaPassword.reset();
        formModificaPassword.hidden = true;
        pulsanteModificaPassword.hidden = false;
        alert("Password aggiornata con successo.");
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    } finally {
        pulsanteSalva.disabled = false;
    }
});
// LOGOUT DEL LETTORE
async function esciDallaBiblioteca() {
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
}
// Pulsante Esci nel menu del profilo
const esciProfilo = document.getElementById("esci-profilo");
esciProfilo.addEventListener("click", esciDallaBiblioteca);
// AVVIO DELLA PAGINA
controllaLettore();
