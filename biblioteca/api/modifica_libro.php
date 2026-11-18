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
// Controllo che la richiesta utilizzi il metodo POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") 
{
    http_response_code(405);
    echo json_encode(["errore" => "Metodo non consentito."]);
    exit;
}
require_once __DIR__ . "/connessione.php";
// Recupera i dati del modulo
$idLibro = $_POST["id_libro"];
$isbn = trim($_POST["isbn"] ?? "");
$titolo = trim($_POST["titolo"] ?? "");
$autore = trim($_POST["autore"] ?? "");
$anno = $_POST["anno_pubblicazione"] ?? "";
$genere = trim($_POST["genere"] ?? "");
$editore = trim($_POST["editore"] ?? "");
// Controlla i dati
if (filter_var($idLibro, FILTER_VALIDATE_INT) === false || (int)$idLibro <= 0 || $titolo === "" || $autore === "" || $genere === "" || $editore === "")
{
    http_response_code(400);
    echo json_encode(["errore" => "Dati del libro non validi."]);
    exit;
}
if (!preg_match("/^[0-9]{13}$/", $isbn)) 
{
    http_response_code(400);
    echo json_encode(["errore" => "L'ISBN deve contenere 13 cifre."]);//L'ISBN deve contenere 13 interi compresi tra 0 e 9
    exit;
}
if (filter_var($anno, FILTER_VALIDATE_INT) === false || (int)$anno < 1000 || (int)$anno > 2026) 
{
    http_response_code(400);
    echo json_encode(["errore" => "Anno di pubblicazione non valido."]);
    exit;
}
try {
    // Verifica che il libro esista
    $controllo = $connessione->prepare("SELECT id_libro FROM libro WHERE id_libro = ?");
    $controllo->execute([$idLibro]);
    if (!$controllo->fetch())
    {
        http_response_code(404);
        echo json_encode(["errore" => "Libro non trovato."]);
        exit;
    }
    // L'ISBN non deve appartenere a un altro libro
    $controlloISBN = $connessione->prepare("SELECT id_libro FROM libro WHERE ISBN = ? AND id_libro <> ?");
    $controlloISBN->execute([$isbn, $idLibro]);
    if ($controlloISBN->fetch()) 
    {
        http_response_code(409);
        echo json_encode(["errore" => "ISBN già utilizzato da un altro libro."]);
        exit;
    }
    // Aggiorna i dati del libro selezionato
    $sql = "UPDATE libro SET ISBN = ?,titolo = ?,autore = ?,anno_pubblicazione = ?,genere = ?,editore = ? WHERE id_libro = ?";
    $modifica = $connessione->prepare($sql);
    $modifica->execute([$isbn,$titolo,$autore,(int)$anno,$genere, $editore,$idLibro]);
    echo json_encode(["messaggio" => "Libro modificato con successo!"]);
} catch (PDOException $errore) {
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Impossibile modificare il libro."]);
}
?>