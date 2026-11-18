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
    $sql = "SELECT c.id_copia, c.id_libro, l.titolo, l.autore, l.editore, c.stato
            FROM copia_libro c INNER JOIN libro l ON c.id_libro = l.id_libro
            ORDER BY l.titolo, c.id_copia";
    $risultato = $connessione->query($sql);
    $copie = $risultato->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($copie);
} catch (PDOException $errore) {
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Impossibile caricare le copie."]);
}
?>