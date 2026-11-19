# Biblioteca-Comunale-Monsignor-Angelo-Venturiello
L’obiettivo del progetto è stato quello di realizzare una piattaforma web per migliorare la gestione dei servizi della Biblioteca Comunale di Castel San Lorenzo (SA). In particolare, è stato sviluppato un sistema che permette ai lettori di consultare il catalogo, registrarsi e richiedere fino a tre prestiti contemporaneamente. Il sistema consente al bibliotecario, tramite la sua dashboard, di gestire i libri, le copie, i prestiti attivi e le restituzioni. Questo repository contiene il codice sorgente della piattaforma web, sviluppata utilizzando HTML, CSS, JavaScript per il front-end, PHP per il back-end e MariaDB per la gestione del database. In particolare, è presente la cartella biblioteca, contenente i file della piattaforma web e il file biblioteca.sql contenente la struttura e i dati dimostrativi del database. Per lo sviluppo e le prove di funzionamento è stato utilizzato XAMPP, con Apache come server web. Inoltre, sono presenti le immagini utilizzate per realizzare l'interfaccia grafica.

INSTALLAZIONE E AVVIO:
1) Scaricare il repository GitHub cliccando sul pulsante verde Code e poi Download ZIP ed estrarre il file.
2) Installare XAMPP e copiare la cartella "biblioteca" all'interno della directory htdocs.
3) Aprire il pannello di controllo di XAMPP e avviare Apache e MySQL (MariaDB).
4) Durante lo sviluppo del progetto è stata utilizzata la porta 3307, poichè la porta predefinita 3306 risultava occupata. Il file connessione.php è quindi configurato per utilizzare la porta 3307. Sono possibili due configurazioni : con la prima bisogna sostituire nel file connessione.php il valore 3307 con 3306, con la seconda bisogna cliccare sul pulsante Config accanto a MySql, aprire my.ini e impostare port=3307 nelle sezioni [client] e [mysqld].
5) Aprire phpMyAdmin all'indirizzo http://localhost/phpmyadmin, creare un database vuoto e importare il file "biblioteca.sql".
6) Verificare che i parametri di connessione al database nel file connessione.php corrispondano alla configurazione di MariaDB, in particolare la porta.
7) Aprire il browser e accedere all'indirizzo http://localhost/biblioteca/.
8) Accedere all'area lettore con email:"mariorossi@example.it" password:"Biblioteca02".
9) Accedere all'area bibliotecario con email:"anna.bianchi@example.com" password:"Biblioteca2026!".

DOCUMENTAZIONE DELLE API:
Nella piattaforma sviluppata, JavaScript utilizza la funzione fetch() per inviare richieste HTTP agli script PHP del back-end. La comunicazione avviene attraverso le API (Application Programming Interface), che permettono al front-end di richiedere informazioni o inviare dati da elaborare. Il back-end gestisce le richieste ricevute e, quando necessario, comunica con il database.
Al termine dell’elaborazione, il back-end restituisce al front-end una risposta HTTP contenente dati in formato JSON. JavaScript interpreta la risposta ricevuta e aggiorna le informazioni visualizzate nella pagina web, senza dover necessariamente ricaricare l’intera pagina.
