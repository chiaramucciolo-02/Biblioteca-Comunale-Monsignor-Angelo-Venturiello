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
// Recupera i dati dal modulo
$nome = trim($_POST["nome"] ?? "");
$cognome = trim($_POST["cognome"] ?? "");
$email = trim($_POST["email"] ?? "");
// Controlla che i campi siano compilati
if ($nome === "" || $cognome === "" || $email === "") 
{
    http_response_code(400);
    echo json_encode(["errore" => "Compila tutti i campi."]);
    exit;
}
// Controlla la validità dell'email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) 
{
    http_response_code(400);
    echo json_encode(["errore" => "Inserisci un indirizzo email valido."]);
    exit;
}
try {
    // Verifica che l'email non appartenga a un altro utente
    $controllo = $connessione->prepare("SELECT id_utente FROM utente WHERE email = ? AND id_utente <> ?");
    $controllo->execute([$email, $idUtente]);
    if ($controllo->fetch()) 
    {
        http_response_code(409);
        echo json_encode(["errore" => "Questa email è già utilizzata."]);
        exit;
    }
    // Aggiorna l'utente autenticato
    $modifica = $connessione->prepare("UPDATE utente SET nome = ?, cognome = ?, email = ? WHERE id_utente = ?");
    $modifica->execute([$nome,$cognome,$email,$idUtente]);
    // Aggiorna i dati conservati nella sessione
    $_SESSION["nome"] = $nome;
    $_SESSION["cognome"] = $cognome;
    $_SESSION["email"] = $email;
    echo json_encode(["messaggio" => "Informazioni personali aggiornate con successo.","nome" => $nome,"cognome" => $cognome,"email" => $email]);
    } catch (PDOException $errore) {
    // Gestisce l'eventuale email duplicata
    if ($errore->getCode() === "23000" && (int) ($errore->errorInfo[1] ?? 0) === 1062) 
    {
        http_response_code(409);
        echo json_encode(["errore" => "Questa email è già utilizzata."]);
        exit;
    }
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Errore durante la modifica del profilo."]);
}
?>