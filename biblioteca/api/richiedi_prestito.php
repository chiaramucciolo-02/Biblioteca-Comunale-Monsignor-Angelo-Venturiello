<?php
header("Content-Type: application/json; charset=utf-8");
// Inizio della sessione
session_start();
//Verifica che l'utente che ha effettuato la sessione abbia il ruolo di lettore
if (!isset($_SESSION["id_utente"]) || ($_SESSION["ruolo"] ?? "") !== "lettore") 
{
    http_response_code(403);
    echo json_encode(["errore" => "Devi accedere come lettore."]);
    exit;
}
// Controlla che la richiesta utilizzi il metodo POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") 
{
    http_response_code(405);
    echo json_encode(["errore" => "Metodo non consentito."]);
    exit;
}
// Controlla l'identificativo del libro
$idLibro = filter_var($_POST["id_libro"] ?? null, FILTER_VALIDATE_INT);
if ($idLibro === false || $idLibro === null || $idLibro <= 0) 
{
    http_response_code(400);
    echo json_encode(["errore" => "Libro non valido."]);
    exit;
}
// Connessione al database e caricamento della classe
require_once __DIR__ . "/connessione.php";
require_once __DIR__ . "/ServizioPrestiti.php";
// Crea un oggetto per gestire i prestiti
$servizioPrestiti = new ServizioPrestiti($connessione);
// Registra la richiesta del lettore
$risultato = $servizioPrestiti->richiediPrestito((int) $_SESSION["id_utente"], (int) $idLibro);
// Invia al browser il risultato dell'operazione
http_response_code($risultato["codice"]);
unset($risultato["codice"]);
echo json_encode($risultato);
?>