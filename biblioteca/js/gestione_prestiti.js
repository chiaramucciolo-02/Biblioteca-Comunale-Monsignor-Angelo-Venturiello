/* GESTIONE DEI PRESTITI E DELLE RESTITUZIONI */
// CARICAMENTO DEI PRESTITI
async function caricaPrestiti() {
    const elencoAttivi = document.getElementById("elenco-prestiti-attivi");
    const elencoRestituiti = document.getElementById("elenco-prestiti-restituiti");
    try {
        const risposta = await fetch("api/gestione_prestiti.php");
        if (!risposta.ok) 
        {
            throw new Error("Errore nel caricamento dei prestiti.");
        }
        const prestiti = await risposta.json();
        elencoAttivi.innerHTML = "";
        elencoRestituiti.innerHTML = "";
        let numeroAttivi = 0;
        let numeroRestituiti = 0;
        prestiti.forEach(function(prestito) {
            const riga = document.createElement("tr");
            const dati = [prestito.id_prestito,prestito.nome + " " + prestito.cognome,prestito.titolo,prestito.data_prestito];
            dati.forEach(function(valore) {
                const cella = document.createElement("td");
                cella.textContent = valore;
                riga.appendChild(cella);
            });
            if (prestito.data_restituzione === null) 
            {
                // PRESTITO ATTIVO
                const cellaScadenza = document.createElement("td");
                cellaScadenza.textContent = prestito.data_scadenza;
                riga.appendChild(cellaScadenza);
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
                elencoAttivi.appendChild(riga);
                numeroAttivi++;
            } else {
                // PRESTITO RESTITUITO
                const cellaData = document.createElement("td");
                cellaData.textContent = prestito.data_restituzione;
                riga.appendChild(cellaData);
                elencoRestituiti.appendChild(riga);
                numeroRestituiti++;
            }
        });
        if (numeroAttivi === 0) 
        {
            elencoAttivi.innerHTML =
                '<tr><td colspan="6">Nessun prestito attivo.</td></tr>';
        }
        if (numeroRestituiti === 0) 
        {
            elencoRestituiti.innerHTML = '<tr><td colspan="5">Nessun prestito restituito.</td></tr>';
        }
    } catch (errore) {
        console.error(errore);
        elencoAttivi.innerHTML = '<tr><td colspan="6">Impossibile caricare i prestiti.</td></tr>';
        elencoRestituiti.innerHTML = "";
    }
}
// REGISTRAZIONE DELLA RESTITUZIONE
async function registraRestituzione(prestito, pulsante) {
    const conferma = confirm('Vuoi registrare la restituzione di "' +prestito.titolo + '"?');
    if (!conferma) 
    {
        return;
    }
    const dati = new FormData();
    dati.append("id_prestito", prestito.id_prestito);
    // Evitiamo clic ripetuti durante il salvataggio
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
            // Aggiorna entrambe le tabelle
            await caricaPrestiti();
        } else {
            alert(risultato.errore || "Impossibile registrare la restituzione.");
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
        // Carica i prestiti soltanto dopo la verifica del ruolo
        await caricaPrestiti();
    } catch (errore) {
        console.error(errore);
        window.location.replace("login.html");
    }
}
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
