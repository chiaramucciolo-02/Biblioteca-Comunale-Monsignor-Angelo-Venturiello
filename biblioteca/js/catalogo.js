// Gestione del catalogo - Funzione che permette di caricare i libri dal database
async function caricaLibri() {
    const elenco = document.getElementById("elenco-libri");
    try {
        const risposta = await fetch("api/libri.php");
        if (!risposta.ok) 
        {
             throw new Error("Errore nel caricamento dei libri.");
        }
        const libri = await risposta.json();
        elenco.innerHTML = "";
        // Crea una riga per ogni libro
        libri.forEach(function(libro) {
            const riga = document.createElement("tr");
            const dati = [libro.titolo,libro.autore,libro.editore,libro.genere,libro.anno_pubblicazione];
            // Inserisce le informazioni del libro
            dati.forEach(function(valore) {
                const cella = document.createElement("td");
                cella.textContent = valore ?? "";
                riga.appendChild(cella);
            });
            // Crea la colonna dedicata al prestito
            const cellaPrestito = document.createElement("td");
            if (Number(libro.copie_disponibili) > 0) 
            {
                const pulsante = document.createElement("button");
                pulsante.type = "button";
                pulsante.textContent = "Richiedi prestito";
                pulsante.addEventListener("click", function() {
                    richiediPrestito(libro, pulsante);
                });
                cellaPrestito.appendChild(pulsante);
            } else {
                cellaPrestito.textContent = "Non disponibile";
            }
            riga.appendChild(cellaPrestito);
            elenco.appendChild(riga);
        });
        // Mantiene la ricerca anche dopo l'aggiornamento
        filtraLibri();
    } catch (errore) {
        console.error(errore);
        elenco.innerHTML ="<tr><td colspan='6'>Errore nel caricamento del catalogo.</td></tr>";
        document.getElementById("nessun-risultato").style.display = "none";
    }
}
// Gestisce la richiesta di prestito
async function richiediPrestito(libro, pulsante) {
    const conferma = confirm("Vuoi richiedere il prestito di \"" + libro.titolo + "\"?");
    if (!conferma)
    {
        return;
    }
    // Prepara i dati da inviare al server
    const dati = new FormData();
    dati.append("id_libro", libro.id_libro);
    // Disabilita pulsante
    pulsante.disabled = true;
    try {
        const risposta = await fetch("api/richiedi_prestito.php", {method: "POST",body: dati});
        const risultato = await risposta.json();
        if (risposta.ok) 
        {
            alert(risultato.messaggio);
            await caricaLibri();
        } else {
            alert(risultato.errore || "Impossibile richiedere il prestito.");
            if (risposta.status === 403) 
            {
                window.location.href = "login.html";
                return;
            }
            await caricaLibri();
        }
    } catch (errore) {
        console.error(errore);
        alert("Impossibile completare la richiesta di prestito.");
        pulsante.disabled = false;
    }
}
// Filtra i libri per titolo o autore
function filtraLibri() {
    const ricerca = document.getElementById("ricerca");
    const testo = ricerca.value.toLowerCase().trim();
    const righe = document.querySelectorAll("#elenco-libri tr");
    const messaggio = document.getElementById("nessun-risultato");
    let libriTrovati = 0;
    righe.forEach(function(riga) {
        const titolo = riga.cells[0].textContent.toLowerCase();
        const autore = riga.cells[1].textContent.toLowerCase();
        if (titolo.includes(testo) || autore.includes(testo)) 
        {
            riga.style.display = "";
            libriTrovati++;
        } else {
            riga.style.display = "none";
        }
    });
    messaggio.style.display = libriTrovati === 0 ? "block" : "none";
}
// Avvio del catalogo
document.getElementById("ricerca").addEventListener("input", filtraLibri);
caricaLibri();
