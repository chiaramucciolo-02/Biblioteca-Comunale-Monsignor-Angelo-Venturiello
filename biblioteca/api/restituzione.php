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
// Controlla l'identificativo del prestito
$idPrestito = filter_var($_POST["id_prestito"] ?? null, FILTER_VALIDATE_INT);
if ($idPrestito === false || $idPrestito === null || $idPrestito <= 0) 
{
    http_response_code(400);
    echo json_encode(["errore" => "Prestito non valido."]);
    exit;
}
// Connessione al database e caricamento della classe
require_once __DIR__ . "/connessione.php";
require_once __DIR__ . "/ServizioPrestiti.php";
// Crea l'oggetto che gestisce i prestiti
$servizioPrestiti = new ServizioPrestiti($connessione);
// Registra la restituzione
$risultato = $servizioPrestiti->registraRestituzione((int) $idPrestito);
// Invia al browser il risultato dell'operazione
http_response_code($risultato["codice"]);
unset($risultato["codice"]);
echo json_encode($risultato);
?>