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
// Controlla che la richiesta utilizzi il metodo POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") 
{
    http_response_code(405);
    echo json_encode(["errore" => "Metodo non consentito."]);
    exit;
}
require_once __DIR__ . "/connessione.php";
// Legge e controlla i dati ricevuti
$idLibro = $_POST["id_libro"] ?? "";
$visibilita = $_POST["visibile_catalogo"] ?? "";
if (filter_var($idLibro, FILTER_VALIDATE_INT) === false || (int)$idLibro <= 0) 
{
    http_response_code(400);
    echo json_encode(["errore" => "Libro non valido."]);
    exit;
}
if (!in_array($visibilita, ["0", "1"], true)) 
{
    http_response_code(400);
    echo json_encode(["errore" => "Visibilità non valida."]);
    exit;
}
try {
    $connessione->beginTransaction();
    // Blocca il libro durante il controllo
    $controllo = $connessione->prepare("SELECT visibile_catalogo FROM libro WHERE id_libro = ? FOR UPDATE");
    $controllo->execute([(int)$idLibro]);
    $visibilitaAttuale = $controllo->fetchColumn();
    if ($visibilitaAttuale === false) 
    {
        $connessione->rollBack();
        http_response_code(404);
        echo json_encode(["errore" => "Libro non trovato."]);
        exit;
    }
    // Aggiorna la visibilità del titolo
    $aggiornamento = $connessione->prepare("UPDATE libro SET visibile_catalogo = ? WHERE id_libro = ?");
    $aggiornamento->execute([(int)$visibilita, (int)$idLibro]);
    $connessione->commit();
    $messaggio = (int)$visibilita === 1 ? "Libro ripristinato nel catalogo con successo." : "Libro rimosso dal catalogo con successo.";
    echo json_encode(["messaggio" => $messaggio]);
} catch (PDOException $errore) {
    if ($connessione->inTransaction()) 
    {
        $connessione->rollBack();
    }
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Impossibile modificare la visibilità del libro."]);
}
?>