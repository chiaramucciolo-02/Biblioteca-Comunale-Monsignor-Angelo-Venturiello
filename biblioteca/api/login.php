<?php
header("Content-Type: application/json; charset=utf-8");
// Controllo che la richiesta utilizzi il metodo POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["errore" => "Metodo non consentito."]);
    exit;
}
require_once __DIR__ . "/connessione.php";
$email = trim($_POST["email"] ?? ""); //Elimina gli spazi nel campo email
$password = $_POST["password"] ?? "";
if ($email === "" || $password === "") //Controlla che email e password corrispondono
{
    http_response_code(400);
    echo json_encode(["errore" => "Inserisci email e password."]);
    exit;
}
try {
    $sql = "SELECT id_utente, nome, cognome, email, password_hash, ruolo FROM utente WHERE email = ?";
    $query = $connessione->prepare($sql);
    $query->execute([$email]);
    $utente = $query->fetch(PDO::FETCH_ASSOC);
    if (!$utente || !password_verify($password, $utente["password_hash"])) 
    {
        http_response_code(401);
        echo json_encode(["errore" => "Email o password non corretti."]);
        exit;
    }
    // Avvia una sessione per l'utente autenticato
session_start();
session_regenerate_id(true);
$_SESSION["id_utente"] = $utente["id_utente"];
$_SESSION["nome"] = $utente["nome"];
$_SESSION["cognome"] = $utente["cognome"];
$_SESSION["email"] = $utente["email"];
$_SESSION["ruolo"] = $utente["ruolo"];
    echo json_encode(["messaggio" => "Accesso effettuato con successo!","ruolo" => $utente["ruolo"]]);
} catch (PDOException $errore) {
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Errore durante l'accesso."]);
}
?>