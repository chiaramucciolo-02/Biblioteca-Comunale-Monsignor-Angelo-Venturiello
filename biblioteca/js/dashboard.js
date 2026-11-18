/* DASHBOARD DEL BIBLIOTECARIO */
// DATI PERSONALI DEL BIBLIOTECARIO
let datiBibliotecario = null;
// Aggiorna le informazioni visualizzate nel profilo
function aggiornaDatiProfilo(utente) {
    datiBibliotecario = {nome: utente.nome || "",cognome: utente.cognome || "",email: utente.email || ""};
    const nomeCompleto = [datiBibliotecario.nome,datiBibliotecario.cognome].filter(Boolean).join(" ");
    document.getElementById("nome-utente").textContent = nomeCompleto;
    document.getElementById("profilo-nome").textContent = datiBibliotecario.nome;
    document.getElementById("profilo-cognome").textContent = datiBibliotecario.cognome;
    document.getElementById("profilo-email").textContent =datiBibliotecario.email;
}
// CONTROLLO DELLA SESSIONE
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
        // Mostra i dati del bibliotecario autenticato
        aggiornaDatiProfilo(utente);
    } catch (errore) {
        console.error(errore);
        window.location.replace("login.html");
    }
}
// APERTURA E CHIUSURA DEL MENU DEL PROFILO
const pulsanteProfilo =
    document.getElementById("pulsante-profilo-dashboard");
const menuProfilo = document.getElementById("menu-profilo-dashboard");
function chiudiMenuProfilo() {
    menuProfilo.hidden = true;
    pulsanteProfilo.setAttribute("aria-expanded","false");
}
pulsanteProfilo.addEventListener("click", function() {
    menuProfilo.hidden = !menuProfilo.hidden;
    pulsanteProfilo.setAttribute("aria-expanded", String(!menuProfilo.hidden));
});
// Chiudiamo il menu cliccando fuori dal profilo
document.addEventListener("click", function(evento) {
    if (!evento.target.closest(".profilo-dashboard")) {
        chiudiMenuProfilo();
    }
});
// Chiudiamo il menu premendo Esc
document.addEventListener("keydown", function(evento) {
    if (evento.key === "Escape") 
    {
        chiudiMenuProfilo();
    }
});
// ELEMENTI DEI MODULI DI MODIFICA
const pulsanteModificaProfilo =
    document.getElementById("modifica-profilo");
const formModificaProfilo = document.getElementById("form-modifica-profilo");
const pulsanteAnnullaProfilo = document.getElementById("annulla-modifica-profilo");
const pulsanteModificaPassword = document.getElementById("modifica-password");
const formModificaPassword = document.getElementById("form-modifica-password");
const pulsanteAnnullaPassword = document.getElementById("annulla-modifica-password");
// MODIFICA DEL PROFILO
// Apre il modulo con i dati già compilati
pulsanteModificaProfilo.addEventListener("click", function() {
    if (!datiBibliotecario) 
    {
        return;
    }
    // Chiude l'eventuale modulo della password
    formModificaPassword.hidden = true;
    formModificaPassword.reset();
    pulsanteModificaPassword.hidden = false;
    // Inseriamo le informazioni attuali nei campi
    document.getElementById("modifica-nome").value = datiBibliotecario.nome;
    document.getElementById("modifica-cognome").value = datiBibliotecario.cognome;
    document.getElementById("modifica-email").value = datiBibliotecario.email;
    formModificaProfilo.hidden = false;
    pulsanteModificaProfilo.hidden = true;
});
// Annulla la modifica del profilo
pulsanteAnnullaProfilo.addEventListener("click", function() {
    formModificaProfilo.hidden = true;
    formModificaProfilo.reset();
    pulsanteModificaProfilo.hidden = false;
});
// Salva le informazioni personali
formModificaProfilo.addEventListener("submit", async function(evento) {
    evento.preventDefault();
    const pulsanteSalva = formModificaProfilo.querySelector('button[type="submit"]');
    const dati = new FormData(formModificaProfilo);
    pulsanteSalva.disabled = true;
    try {
        const risposta = await fetch("api/modifica_profilo.php", {
            method: "POST",
            body: dati
        });
        const risultato = await risposta.json();
        if (!risposta.ok) 
        {
            throw new Error(risultato.errore || "Errore durante la modifica del profilo.");
        }
        // Aggiorna i dati visualizzati
        aggiornaDatiProfilo(risultato);
        formModificaProfilo.hidden = true;
        formModificaProfilo.reset();
        pulsanteModificaProfilo.hidden = false;
        alert("Profilo aggiornato con successo.");
    } catch (errore) {
        console.error(errore);
        alert(errore.message);
    } finally {
        pulsanteSalva.disabled = false;
    }
});
// MODIFICA DELLA PASSWORD
// Apre il modulo per cambiare la password
pulsanteModificaPassword.addEventListener("click", function() {
    // Chiude l'eventuale modulo del profilo
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
    const pulsanteSalva = formModificaPassword.querySelector('button[type="submit"]');
    const dati = new FormData(formModificaPassword);
    const passwordNuova = document.getElementById("password-nuova").value;
    const confermaPassword = document.getElementById("conferma-password").value;
    // Verifica che le nuove password coincidano
    if (passwordNuova !== confermaPassword) 
    {
        alert("Le nuove password non coincidono.");
        return;
    }
    pulsanteSalva.disabled = true;
    try {
        const risposta = await fetch("api/modifica_password.php", {
            method: "POST",
            body: dati
        });
        const risultato = await risposta.json();
        if (!risposta.ok) {
            throw new Error(risultato.errore || "Errore durante la modifica della password.");
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
// AVVIO DELLA DASHBOARD
controllaBibliotecario();
