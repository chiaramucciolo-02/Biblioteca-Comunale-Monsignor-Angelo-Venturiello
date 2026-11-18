<?php
header("Content-Type: application/json; charset=utf-8");
// Inizio della sessione
session_start();
//Verifica che l'utente che ha effettuato la sessione abbia il ruolo di bibliotecario
if (!isset($_SESSION["id_utente"]) ||($_SESSION["ruolo"] ?? "") !== "bibliotecario")
{
    http_response_code(403);
    echo json_encode(["errore" => "Accesso non autorizzato."]);
    exit;
}
require_once __DIR__ . "/connessione.php";
try {
    // Recupera tutti i libri, anche quelli rimossi dal catalogo pubblico
    $sql = "SELECT id_libro,isbn,titolo,autore,anno_pubblicazione,genere,editore,visibile_catalogo
            FROM libro
            ORDER BY titolo";
    $risultato = $connessione->query($sql);
    $libri = $risultato->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($libri);
} catch (PDOException $errore) {
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Impossibile caricare i libri."]);
}
?>