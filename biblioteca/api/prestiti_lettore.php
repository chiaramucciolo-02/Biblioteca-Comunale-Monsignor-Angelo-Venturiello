<?php
header("Content-Type: application/json; charset=utf-8");
// Inizio della sessione
session_start();
//Verifica che l'utente che ha effettuato la sessione abbia il ruolo di lettore
if (!isset($_SESSION["id_utente"]) || ($_SESSION["ruolo"] ?? "") !== "lettore") 
{
    http_response_code(403);
    echo json_encode(["errore" => "Accesso non autorizzato."]);
    exit;
}
require_once __DIR__ . "/connessione.php";
try {
    // Recuperiamo soltanto i prestiti del lettore autenticato
    $query = $connessione->prepare("SELECT l.titolo, p.data_prestito, p.data_scadenza, p.data_restituzione
         FROM prestito p INNER JOIN copia_libro c ON p.id_copia = c.id_copia INNER JOIN libro l ON c.id_libro = l.id_libro
         WHERE p.id_utente = ?
         ORDER BY p.data_prestito DESC, p.id_prestito DESC");
    $query->execute([$_SESSION["id_utente"]]);
    $prestiti = $query->fetchAll(PDO::FETCH_ASSOC);
    // Restituisce i prestiti in formato JSON
    echo json_encode($prestiti);
} catch (PDOException $errore) {
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Impossibile caricare i prestiti."]);
}
?>