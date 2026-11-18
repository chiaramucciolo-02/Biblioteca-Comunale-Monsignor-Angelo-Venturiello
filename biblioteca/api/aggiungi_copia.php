<?php
header("Content-Type: application/json; charset=utf-8");
// Inizio della sessione
session_start();
//Verifica che l'utente che ha effettuato la sessione abbia il ruolo di bibliotecario 
if (!isset($_SESSION["id_utente"]) || ($_SESSION["ruolo"] ?? "") !== "bibliotecario")
{
   http_response_code(403);
   echo json_encode(["errore" => "Accesso non autorizzato."]); //Se il ruolo corrisponde a un utente si visualizza questo messaggio di errore)
}
// Controllo che la richiesta utilizzi il metodo POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") 
{
    http_response_code(405);
    echo json_encode(["errore" => "Metodo non consentito."]);
    exit;
}
require_once __DIR__ . "/connessione.php";
// Recupera l'id del libro selezionato nel menu a tendina
$idLibro = $_POST["id_libro"] ?? "";
// Aggiunge una nuova copia disponibile del libro 
$sql = "INSERT INTO copia_libro (id_libro, stato) VALUES (?, 'disponibile')";
$inserimento = $connessione->prepare($sql);
$inserimento->execute([$idLibro]);
http_response_code(201);
echo json_encode(["messaggio" => "Copia aggiunta con successo!"]);
?>