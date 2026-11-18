/* GESTIONE DEL LOGIN */
const form = document.getElementById("form-login");
form.addEventListener("submit", async function(evento) {
    // Impedisce il ricaricamento automatico della pagina
    evento.preventDefault();
    // Recupera email e password inserite dall'utente
    const dati = new FormData(form);
    try {
        // Invia le credenziali al server
        const risposta = await fetch("api/login.php", {
            method: "POST",
            body: dati
        });
        // Legge la risposta del server
        const risultato = await risposta.json();
        if (risposta.ok) 
        {
            // Reindirizza l'utente in base al suo ruolo
            if (risultato.ruolo === "bibliotecario") {
                window.location.replace("dashboard.html");
            } else if (risultato.ruolo === "lettore") {
                window.location.replace("area_lettore.html");
            }
        } else {
            // Mostra un messaggio se le credenziali sono errate
            alert(risultato.errore || "Credenziali non valide.");
        }
    } catch (errore) {
        console.error(errore);
        alert("Impossibile effettuare l'accesso.");
    }
});
