<?php
header("Content-Type: application/json; charset=utf-8");
// Controllo che la richiesta utilizzi il metodo POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") 
{
    http_response_code(405);
    echo json_encode(["errore" => "Metodo non consentito."]);
    exit;
}
require_once __DIR__ . "/connessione.php";
// Recuperiamo i dati inviati dal modulo di registrazione
$nome = trim($_POST["nome"] ?? "");
$cognome = trim($_POST["cognome"] ?? "");
$email = trim($_POST["email"] ?? "");
$password = $_POST["password"] ?? "";
// Verifica che tutti i campi siano compilati
if ($nome === "" || $cognome === "" || $email === "" || $password === "") 
{
    http_response_code(400);
    echo json_encode(["errore" => "Compila tutti i campi."]);
    exit;
}
// Verifica che l'indirizzo email sia valido
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) 
{
    http_response_code(400);
    echo json_encode(["errore" => "Inserisci un indirizzo email valido."]);
    exit;
}
// Verifica che la lunghezza della password sia di almeno 8 caratteri
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(["errore" => "La password deve contenere almeno 8 caratteri."]);
    exit;
}
try {
    // Controlla se l'indirizzo email è già registrato
    $controllo = $connessione->prepare("SELECT id_utente FROM utente WHERE email = ?");
    $controllo->execute([$email]);
    if ($controllo->fetch()) 
    {
        http_response_code(409);
        echo json_encode(["errore" => "Questa email è già registrata."]);
        exit;
    }
    // Protegge la password prima del salvataggio
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    // Registra il nuovo utente con il ruolo di lettore
    $inserimento = $connessione->prepare("INSERT INTO utente (nome, cognome, email, password_hash, ruolo) VALUES (?, ?, ?, ?, 'lettore')");
    $inserimento->execute([$nome, $cognome, $email, $passwordHash]);
    // Messaggio di avvenuta registrazione
    http_response_code(201);
    echo json_encode(["messaggio" => "Registrazione completata con successo!"]);
} catch (PDOException $errore) {
    // Controlla se è una email già registrata nel database
    if ($errore->getCode() === "23000" && (int) ($errore->errorInfo[1] ?? 0) === 1062) 
    {
        http_response_code(409);
        echo json_encode(["errore" => "Questa email è già registrata."]);
        exit;
    }
    // Registra gli altri errori senza mostrarli all'utente
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Errore durante la registrazione."]);
}
?>