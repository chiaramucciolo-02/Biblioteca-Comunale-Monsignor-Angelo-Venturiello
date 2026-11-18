const form = document.getElementById("form-registrazione");
form.addEventListener("submit", async function(evento) {
    // Impedisce il ricaricamento automatico della pagina
    evento.preventDefault();
    // Recupera i dati inseriti nel modulo
    const dati = new FormData(form);
    try {
        // Invia i dati al backend PHP
        const risposta = await fetch("api/registrazione.php", {
            method: "POST",
            body: dati
        });
        // Legge la risposta inviata da PHP
        const risultato = await risposta.json();
        if (risposta.ok) 
        {
            alert(risultato.messaggio);
            // Svuota il modulo dopo la registrazione
            form.reset();
        } else {
            alert(risultato.errore || "Impossibile completare la registrazione.");
        }
    } catch (errore) {
        console.error(errore);
        alert("Impossibile completare la registrazione.");
    }
});
