<?php
header("Content-Type: application/json; charset=utf-8");
// Inizio della sessione
session_start();
//Verifica che l'utente che ha effettuato la sessione abbia il ruolo di bibliotecario
if ((!isset($_SESSION["id_utente"]) || $_SESSION["ruolo"] ?? "") !== "bibliotecario")
{
    http_response_code(403);
    echo json_encode(["errore" => "Accesso non autorizzato."]);
    exit;
}
// Controllo che la richiesta utilizzi il metodo POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["errore" => "Metodo non consentito."]);
    exit;
}
require_once __DIR__ . "/connessione.php";
// Recupera i dati del modulo
$isbn = trim($_POST["isbn"] ?? "");
$titolo = trim($_POST["titolo"] ?? "");
$autore = trim($_POST["autore"] ?? "");
$anno = $_POST["anno_pubblicazione"] ?? "";
$genere = trim($_POST["genere"] ?? "");
$editore = trim($_POST["editore"] ?? "");
// Controlla che tutti i campi siano compilati
if ($isbn === "" || $titolo === "" || $autore === "" || (int)$anno === "" || $genere === "" || $editore === "")
{
    http_response_code(400);
    echo json_encode(["errore" => "Compila tutti i campi."]);
    exit;
}
// Verifica che l'ISBN inserito sia composto tra 13 interi compresi tra 0 e 9 e che l'anno di pubblicazione sia compreso tra 1000 e 2026
if (!preg_match("/^[0-9]{13}$/", $isbn)) 
{
    http_response_code(400);
    echo json_encode(["errore" => "L'ISBN deve contenere 13 cifre."]);
    exit;
}
if (filter_var($anno, FILTER_VALIDATE_INT) === false || (int) $anno < 1000 || (int) $anno > 2026) 
{
    http_response_code(400);
    echo json_encode(["errore" => "Anno di pubblicazione non valido."]);
    exit;
}
try {
    // Controlla se l'ISBN è già presente
    $controllo = $connessione->prepare("SELECT id_libro FROM libro WHERE ISBN = ?");
    $controllo->execute([$isbn]);
    if ($controllo->fetch()) 
    {
        http_response_code(409);
        echo json_encode(["errore" => "Esiste già un libro con questo ISBN."]);
        exit;
    }
    // Nel caso in cui l'ISBN  non sia presente nella tabella libro inserisce il nuovo libro
    $sql = "INSERT INTO libro (ISBN, titolo, autore, anno_pubblicazione, genere, editore) VALUES (?, ?, ?, ?, ?, ?)";
    $inserimento = $connessione->prepare($sql);
    $inserimento->execute([$isbn,$titolo,$autore,$anno,$genere,$editore]);
    http_response_code(201);
    echo json_encode(["messaggio" => "Libro aggiunto con successo!"]);
} catch (PDOException $errore) {
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Impossibile aggiungere il libro."]);
}
?>