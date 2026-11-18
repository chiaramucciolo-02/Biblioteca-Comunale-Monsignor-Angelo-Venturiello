<?php
header("Content-Type: application/json; charset=utf-8");
// Inizio della sessione
session_start();
// Controllo che la richiesta utilizzi il metodo POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") 
{
    http_response_code(405);
    echo json_encode(["errore" => "Metodo non consentito."]);
    exit;
}
// Verifica che l'utente sia autenticato
if (!isset($_SESSION["id_utente"])) 
{
    http_response_code(401);
    echo json_encode(["errore" => "Devi effettuare l'accesso."]);
    exit;
}
require_once __DIR__ . "/connessione.php";
$idUtente = (int) $_SESSION["id_utente"];
// Recupera le password dal modulo
$passwordAttuale = $_POST["password_attuale"] ?? "";
$passwordNuova = $_POST["password_nuova"] ?? "";
$confermaPassword = $_POST["conferma_password"] ?? "";
// Controlla che tutti i campi siano compilati
if ($passwordAttuale === "" ||$passwordNuova === "" ||$confermaPassword === "") 
{
    http_response_code(400);
    echo json_encode(["errore" => "Compila tutti i campi."]);
    exit;
}
// Controlla che la lunghezza della nuova password sia di almeno 8 caratteri
if (strlen($passwordNuova) < 8) 
{
    http_response_code(400);
    echo json_encode(["errore" => "La nuova password deve contenere almeno 8 caratteri."]);
    exit;
}
// Controlla che le nuove password coincidano
if ($passwordNuova !== $confermaPassword) 
{
    http_response_code(400);
    echo json_encode(["errore" => "Le nuove password non coincidono."]);
    exit;
}
try {
    // Recupera la password protetta dal database
    $ricerca = $connessione->prepare("SELECT password_hash FROM utente WHERE id_utente = ?");
    $ricerca->execute([$idUtente]);
    $utente = $ricerca->fetch(PDO::FETCH_ASSOC);
    if (!$utente) 
    {
        http_response_code(404);
        echo json_encode(["errore" => "Utente non trovato."]);
        exit;
    }
    // Verifica la password attuale
    if (!password_verify($passwordAttuale, $utente["password_hash"])) 
    {
        http_response_code(400);
        echo json_encode(["errore" => "La password attuale non è corretta."]);
        exit;
    }
    // Impedisce di riutilizzare la stessa password
    if (password_verify($passwordNuova, $utente["password_hash"]))
    {
        http_response_code(400);
        echo json_encode(["errore" => "La nuova password deve essere diversa da quella attuale."]);
        exit;
    }
    // Protegge la nuova password
    $passwordHash = password_hash($passwordNuova, PASSWORD_DEFAULT);
    // Aggiorna la password dell'utente autenticato
    $modifica = $connessione->prepare("UPDATE utente SET password_hash = ? WHERE id_utente = ?");
    $modifica->execute([ $passwordHash, $idUtente]);
    echo json_encode(["messaggio" => "Password aggiornata con successo."]);
} catch (PDOException $errore) {
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Errore durante la modifica della password."]);
}
?>