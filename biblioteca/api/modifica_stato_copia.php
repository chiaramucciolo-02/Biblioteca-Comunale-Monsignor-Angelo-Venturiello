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
require_once __DIR__ . "/connessione.php";
// Recupera i dati ricevuti
$idCopia = $_POST["id_copia"] ?? "";
$nuovoStato = $_POST["stato"] ?? "";
// Verifica che l'ID sia valido
if (filter_var($idCopia, FILTER_VALIDATE_INT) === false || (int)$idCopia <= 0)
{
    http_response_code(400);
    echo json_encode(["errore" => "Copia non valida."]);
    exit;
}
// Sono consentiti soltanto gli stati disponibile e non disponibile
if (!in_array($nuovoStato, ["disponibile", "non_disponibile"], true)) 
{
    http_response_code(400);
    echo json_encode(["errore" => "Stato non valido."]);
    exit;
}
try {
    $connessione->beginTransaction();
    // Blocca la copia durante il controllo
    $controllo = $connessione->prepare("SELECT stato FROM copia_libro WHERE id_copia = ? FOR UPDATE");
    $controllo->execute([(int)$idCopia]);
    $statoAttuale = $controllo->fetchColumn();
    if ($statoAttuale === false) 
    {
        $connessione->rollBack();
        http_response_code(404);
        echo json_encode(["errore" => "Copia non trovata."]);
        exit;
    }
    // Non permette di modificare una copia attualmente in prestito
    if ($statoAttuale === "in_prestito") {
        $connessione->rollBack();
        http_response_code(409);
        echo json_encode(["errore" => "Impossibile modificare una copia attualmente in prestito."]);
        exit;
    }
    // Verifica che non esistano prestiti ancora attivi collegati a quella copia
    $controlloPrestiti = $connessione->prepare("SELECT COUNT(*) FROM prestito WHERE id_copia = ? AND data_restituzione IS NULL");
    $controlloPrestiti->execute([(int)$idCopia]);
    if ((int)$controlloPrestiti->fetchColumn() > 0) 
    {
        $connessione->rollBack();
        http_response_code(409);
        echo json_encode(["errore" => "La copia ha un prestito ancora attivo."]);
        exit;
    }
    // Aggiorna lo stato della copia
    $aggiornamento = $connessione->prepare("UPDATE copia_libro SET stato = ? WHERE id_copia = ?");
    $aggiornamento->execute([$nuovoStato, (int)$idCopia]);
    $connessione->commit();
    echo json_encode(["messaggio" => "Stato della copia aggiornato con successo."]);
} catch (PDOException $errore) {
    if ($connessione->inTransaction()) 
    {
        $connessione->rollBack();
    }
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Impossibile modificare lo stato della copia."]);
}
?>