<?php
header("Content-Type: application/json; charset=utf-8");
// Inizio della sessione
session_start();
//Verifica che l'utente che ha effettuato la sessione abbia il ruolo di bibliotecario
if (!isset($_SESSION["id_utente"]) || ($_SESSION["ruolo"] ?? "") !== "bibliotecario") 
{
    http_response_code(403);
    echo json_encode(["errore" => "Accesso non autorizzato."]);
    exit;
}
require_once __DIR__ . "/connessione.php";
try {
    // Recupera i prestiti e i dati collegati
    $sql = "SELECT p.id_prestito,p.id_copia,u.nome,u.cognome,l.titolo,l.autore,p.data_prestito, p.data_scadenza,p.data_restituzione
            FROM prestito p 
            INNER JOIN utente u ON p.id_utente = u.id_utente INNER JOIN copia_libro c ON p.id_copia = c.id_copia INNER JOIN libro l ON c.id_libro = l.id_libro
            ORDER BY p.data_prestito DESC, p.id_prestito DESC";
    $risultato = $connessione->query($sql);
    $prestiti = $risultato->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($prestiti);
} catch (PDOException $errore) {
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Impossibile caricare i prestiti."]);
}
?>