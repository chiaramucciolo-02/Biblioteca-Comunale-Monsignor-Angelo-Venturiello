<?php
header("Content-Type: application/json; charset=utf-8");
// Inizio della sessione
session_start();
//Verifica che l'utente che ha effettuato la sessione abbia il ruolo di bibliotecario
if (!isset($_SESSION["id_utente"]) ||($_SESSION["ruolo"] ?? "") !== "bibliotecario")
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
//Recupera l'id della copia del libro da eliminare
$idCopia = $_POST["id_copia"] ?? "";
if (filter_var($idCopia, FILTER_VALIDATE_INT) === false || $idCopia <= 0)
{
    http_response_code(400);
    echo json_encode(["errore" => "Copia non valida."]);
    exit;
}
try {
    $connessione->beginTransaction();
    $controllo = $connessione->prepare("SELECT stato FROM copia_libro WHERE id_copia = ?FOR UPDATE" ); //Controlla che lo stato del libro non sia collegato a un prestito
    $controllo->execute([$idCopia]);
    $stato = $controllo->fetchColumn();
    if ($stato === false)
    {
        $connessione->rollBack();
        http_response_code(404);
        echo json_encode(["errore" => "Copia non trovata."]);
        exit;
    }
    // Non elimina le copie attualmente in prestito
    if ($stato === "in_prestito")
    {
        $connessione->rollBack();
        http_response_code(409);
        echo json_encode(["errore" => "Impossibile eliminare una copia attualmente in prestito."]);
        exit;
    }
    // Controlla che la copia da eliminare non sia in prestito e nello storico
    $controlloPrestiti = $connessione->prepare("SELECT COUNT(*) FROM prestito WHERE id_copia = ?");
    $controlloPrestiti->execute([(int)$idCopia]);
    if ((int)$controlloPrestiti->fetchColumn() > 0) {
        $connessione->rollBack();
        http_response_code(409);
        echo json_encode(["errore" => "Impossibile eliminare la copia perché è già stata utilizzata per un prestito."]);
        exit;
    }
    // Elimina la copia selezionata
    $eliminazione = $connessione->prepare("DELETE FROM copia_libro WHERE id_copia = ?");
    $eliminazione->execute([(int)$idCopia]);
    $connessione->commit();
    echo json_encode(["messaggio" => "Copia eliminata con successo."]);
} catch (PDOException $errore) 
{
   if ($connessione->inTransaction()) 
    {
        $connessione->rollBack();
    }
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Impossibile eliminare la copia."]);
}
?>