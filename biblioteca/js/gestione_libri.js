/* GESTIONE DEI LIBRI */
// LIBRI CARICATI DAL DATABASE
let libriCaricati = [];
// CARICAMENTO DEI LIBRI
async function caricaLibri() {
    const elenco = document.getElementById("elenco-gestione-libri");
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
        mostraLibri();
    } catch (errore) {
        console.error(errore);
        libriCaricati = [];
        document.getElementById("nessun-libro").style.display = "none";
        elenco.innerHTML = '<tr><td colspan="8">Impossibile caricare i libri.</td></tr>';
    }
}
// RICERCA PER TITOLO E AUTORE
const ricercaLibri = document.getElementById("ricerca-libri");
ricercaLibri.addEventListener("input", function() {
    mostraLibri();
});
// VISUALIZZAZIONE DEI LIBRI NELLA TABELLA
function mostraLibri() {
    const elenco = document.getElementById("elenco-gestione-libri");
    const messaggio = document.getElementById("nessun-libro");
    const testoRicerca = ricercaLibri.value.trim().toLowerCase();
    elenco.innerHTML = "";
    messaggio.style.display = "none";
    const libriFiltrati = libriCaricati.filter(function(libro) {
        const titolo = String(libro.titolo || "").toLowerCase();
        const autore = String(libro.autore || "").toLowerCase();
        return titolo.includes(testoRicerca) || autore.includes(testoRicerca);
    });
    // Nessun libro registrato
    if (libriCaricati.length === 0) {
        elenco.innerHTML ='<tr><td colspan="8">Nessun libro presente.</td></tr>';
        return;
    }
    // Nessun risultato della ricerca
    if (libriFiltrati.length === 0) {
        messaggio.style.display = "block";
        return;
    }
    // CREAZIONE DELLE RIGHE DELLA TABELLA
    libriFiltrati.forEach(function(libro) {
        const riga = document.createElement("tr");
        const libroVisibile = Number(libro.visibile_catalogo) === 1;
        const dati = [libro.titolo,libro.autore,libro.isbn,libro.editore,libro.anno_pubblicazione,libro.genere,libroVisibile ? "Visibile" : "Non visibile"];
        dati.forEach(function(valore) {
            const cella = document.createElement("td");
            cella.textContent = valore ?? "";
            riga.appendChild(cella);
        });
        // UNICA COLONNA AZIONI
        const cellaAzioni = document.createElement("td");
        cellaAzioni.className = "azioni-libro";
        // PULSANTE MODIFICA
        const pulsanteModifica = document.createElement("button");
        pulsanteModifica.type = "button";
        pulsanteModifica.textContent = "Modifica";
        pulsanteModifica.addEventListener("click", function() {
            preparaModifica(libro);
        });
        cellaAzioni.appendChild(pulsanteModifica);
        // PULSANTE RIMUOVI / RIPRISTINA
        const pulsanteCatalogo = document.createElement("button");
        pulsanteCatalogo.type = "button";
        pulsanteCatalogo.textContent = libroVisibile ? "Rimuovi" : "Ripristina";
        pulsanteCatalogo.addEventListener("click", function() {
            modificaVisibilitaLibro(libro, pulsanteCatalogo);
        });
        cellaAzioni.appendChild(pulsanteCatalogo);
        // PULSANTE ELIMINA
        const pulsanteElimina = document.createElement("button");
        pulsanteElimina.type = "button";
        pulsanteElimina.textContent = "Elimina";
        pulsanteElimina.addEventListener("click", function() {
            eliminaLibro(libro, pulsanteElimina);
        });
        cellaAzioni.appendChild(pulsanteElimina);
        riga.appendChild(cellaAzioni);
        elenco.appendChild(riga);
    });
}
// PREPARAZIONE DELLA MODIFICA DI UN LIBRO
function preparaModifica(libro) {
    document.getElementById("id_libro").value = libro.id_libro;
    document.getElementById("isbn").value = libro.isbn;
    document.getElementById("titolo").value = libro.titolo;
    document.getElementById("autore").value = libro.autore;
    document.getElementById("anno").value = libro.anno_pubblicazione;
    document.getElementById("genere").value = libro.genere;
    document.getElementById("editore").value = libro.editore;
    document.getElementById("titolo-form-libro").textContent ="Modifica libro";
    document.getElementById("salva-libro").textContent = "Salva modifiche";
    document.getElementById("form-libro").scrollIntoView({behavior: "smooth"});
}
// RIMOZIONE DEL LIBRO E RIPRISTINO NEL CATALOGO
async function modificaVisibilitaLibro(libro, pulsante) {
    const libroVisibile = Number(libro.visibile_catalogo) === 1;
    const nuovaVisibilita = libroVisibile ? "0" : "1";
    const messaggioConferma = libroVisibile
        ? 'Vuoi rimuovere "' + libro.titolo + '" dal catalogo pubblico?\n\n' +
          "Il libro, le sue copie e i prestiti resteranno conservati."
        : 'Vuoi ripristinare "' + libro.titolo + '" nel catalogo pubblico?';
    if (!confirm(messaggioConferma)) 
    {
        return;
    }
    const dati = new FormData();
    dati.append("id_libro", libro.id_libro);
    dati.append("visibile_catalogo", nuovaVisibilita);
    pulsante.disabled = true;
    try {
        const risposta = await fetch("api/modifica_visibilita_libro.php", {
            method: "POST",
            body: dati
        });
        const risultato = await risposta.json();
        if (risposta.ok) 
        {
            alert(risultato.messaggio);
            await caricaLibri();
        } else {
            alert(risultato.errore || "Impossibile modificare la visibilità del libro.");
            pulsante.disabled = false;
        }
    } catch (errore) {
        console.error(errore);
        alert("Impossibile modificare la visibilità del libro.");
        pulsante.disabled = false;
    }
}
// ELIMINAZIONE DI UN LIBRO
async function eliminaLibro(libro, pulsante) {
    const conferma = confirm(
        'Vuoi eliminare il libro "' + libro.titolo + '"?\n\n' +
        "Verranno eliminate anche le sue copie.\n" +
        "I libri con prestiti registrati non possono essere eliminati.");
    if (!conferma) 
    {
        return;
    }
    const dati = new FormData();
    dati.append("id_libro", libro.id_libro);
    pulsante.disabled = true;
    try {
        const risposta = await fetch("api/elimina_libro.php", {
            method: "POST",
            body: dati
        });
        const risultato = await risposta.json();
        if (risposta.ok) {
            alert(risultato.messaggio);
            const idLibroSelezionato =
                document.getElementById("id_libro").value;
            if (idLibroSelezionato === String(libro.id_libro)) 
            {
                ripristinaModulo();
            }
            await caricaLibri();
        } else {
            alert(risultato.errore || "Impossibile eliminare il libro.");
            pulsante.disabled = false;
        }
    } catch (errore) {
        console.error(errore);
        alert("Impossibile eliminare il libro.");
        pulsante.disabled = false;
    }
}
// RIPRISTINO DEL MODULO
function ripristinaModulo() {
    formLibro.reset();
    document.getElementById("id_libro").value = "";
    document.getElementById("titolo-form-libro").textContent = "Aggiungi un libro";
    document.getElementById("salva-libro").textContent ="Aggiungi libro";
}
// AGGIUNTA E MODIFICA DEI LIBRI
const formLibro = document.getElementById("form-libro");
formLibro.addEventListener("submit", async function(evento) {
    evento.preventDefault();
    const idLibro = document.getElementById("id_libro").value;
    const indirizzo = idLibro ? "api/modifica_libro.php" : "api/aggiungi_libro.php";
    const dati = new FormData(formLibro);
    try {
        const risposta = await fetch(indirizzo, {
            method: "POST",
            body: dati
        });
        const risultato = await risposta.json();
        if (risposta.ok) 
        {
            alert(risultato.messaggio);
            ripristinaModulo();
            await caricaLibri();
        } else {
            alert(risultato.errore || "Impossibile salvare il libro.");
        }
    } catch (errore) {
        console.error(errore);
        alert("Impossibile salvare il libro.");
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
        const nomeCompleto = [utente.nome,utente.cognome].filter(Boolean).join(" ");
        document.getElementById("nome-utente").textContent = nomeCompleto;
        // Informazioni personali
        document.getElementById("profilo-nome").textContent = utente.nome || "";
        document.getElementById("profilo-cognome").textContent = utente.cognome || "";
        document.getElementById("profilo-email").textContent = utente.email || "";
        // Caricamento dei libri
        await caricaLibri();
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
    pulsanteProfilo.setAttribute("aria-expanded",String(!menuProfilo.hidden)
    );
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
    if (evento.key === "Escape") {
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
