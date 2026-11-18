<?php
header("Content-Type: application/json; charset=utf-8");
// Controllo che la richiesta utilizzi il metodo POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["errore" => "Metodo non consentito."]);
    exit;
}
// Inizio della sessione
session_start();
// Svuota i dati della sessione
$_SESSION = [];
// Elimina il cookie della sessione
if (ini_get("session.use_cookies")) 
{
    $parametri = session_get_cookie_params();
    setcookie(session_name(),"",time() - 42000,$parametri["path"],$parametri["domain"],$parametri["secure"],$parametri["httponly"]);
}
// Elimina la sessione sul server
session_destroy();
echo json_encode(["messaggio" => "Disconnessione effettuata."]);
?>