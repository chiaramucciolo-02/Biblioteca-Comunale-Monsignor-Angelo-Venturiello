<?php
header("Content-Type: application/json; charset=utf-8");
// Inizio della sessione
session_start();
if (isset($_SESSION["id_utente"])) 
{
    echo json_encode(["autenticato" => true,"id_utente" => $_SESSION["id_utente"],"nome" => $_SESSION["nome"] ?? "","cognome" => $_SESSION["cognome"] ?? "","email" => $_SESSION["email"] ?? "","ruolo" => $_SESSION["ruolo"] ?? ""]);
} else 
     {
     http_response_code(401);
    echo json_encode(["autenticato" => false, "messaggio" => "Devi effettuare l'accesso."]);
}
?>