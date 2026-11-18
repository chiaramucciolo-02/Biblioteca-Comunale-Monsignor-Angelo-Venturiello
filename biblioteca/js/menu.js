/* GESTIONE DEL MENU DI NAVIGAZIONE */
// Aggiorna il menu in base alla sessione dell'utente
async function aggiornaMenu() {
    const collegamentoArea = document.getElementById("collegamento-area");
    const pulsanteEsci = document.getElementById("pulsante-esci");
    if (!collegamentoArea) 
    {
    return;
    }
    try {
        const risposta = await fetch("api/sessione.php", {
            cache: "no-store"
        });
        if (!risposta.ok) 
        {
            return;
        }
        const utente = await risposta.json();
        if (!utente.autenticato) 
        {
            return;
        }
        // Mostra il collegamento corretto in base al ruolo
        if (utente.ruolo === "lettore") 
        {
            collegamentoArea.textContent = "Area lettore";
            collegamentoArea.href = "area_lettore.html";
        } else if (utente.ruolo === "bibliotecario") {
            collegamentoArea.textContent = "Area bibliotecario";
            collegamentoArea.href = "dashboard.html";
        } else {
            return;
        }
    } catch (errore) {
        console.error("Errore nel caricamento del menu:", errore);
    }
}
// Gestisce la disconnessione
async function effettuaLogout() {
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
// Collega il pulsante Esci alla funzione di logout
const pulsanteEsci = document.getElementById("pulsante-esci");
if (pulsanteEsci) 
{
    pulsanteEsci.addEventListener("click", effettuaLogout);
}
// Avvia il menu dinamico
aggiornaMenu();
