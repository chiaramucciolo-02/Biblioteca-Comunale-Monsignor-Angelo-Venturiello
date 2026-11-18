# Biblioteca-Comunale-Monsignor-Angelo-Venturiello
L’obiettivo del progetto è stato quello di realizzare una piattaforma web per migliorare la gestione dei servizi della Biblioteca Comunale di Castel San Lorenzo (SA). In particolare, è stato sviluppato un sistema che permette ai lettori di consultare il catalogo, registrarsi e richiedere fino a tre prestiti contemporaneamente. Il sistema consente al bibliotecario, tramite la sua dashboard, di gestire i libri, le copie, i prestiti attivi e le restituzioni. Questo repository contiene il codice sorgente della piattaforma web, sviluppata utilizzando HTML, CSS, JavaScript per il front-end, PHP per il back-end e MariaDB per la gestione del database. Per lo sviluppo e le prove di funzionamento è stato utilizzato XAMPP, con Apache come server web. Inoltre, sono presenti le immagini utilizzate per realizzare l'interfaccia grafica.

INSTALLAZIONE E AVVIO:
1) Scaricare il repository GitHub.
2) Installare XAMPP e copiare la cartella "biblioteca" all'interno della directory htdocs.
3) Avviare Apache e MySQL (MariaDB) dal pannello di controllo di XAMPP.
4) Aprire phpMyAdmin e importare il file "biblioteca.sql".
5) Verificare i parametri di connessione al database nel file biblioteca/api/connessione.php.
6) Aprire il browser e accedere all'indirizzo http://localhost/biblioteca/.
7) Accedere all'area lettore con email:"mariorossi@example.it" password:"Biblioteca02".
8) Accedere all'area bibliotecario con email:"annabianchi@example.com" password:"Biblioteca2026!".

DOCUMENTAZIONE DELLE API:
Nella piattaforma sviluppata, JavaScript utilizza la funzione fetch() per inviare richieste HTTP agli script PHP del back-end. La comunicazione avviene attraverso le API (Application Programming Interface), che permettono al front-end di richiedere informazioni o inviare dati da elaborare. Il back-end gestisce le richieste ricevute e, quando necessario, comunica con il database.
Al termine dell’elaborazione, il back-end restituisce al front-end una risposta HTTP contenente dati in formato JSON. JavaScript interpreta la risposta ricevuta e aggiorna le informazioni visualizzate nella pagina web, senza dover necessariamente ricaricare l’intera pagina.
