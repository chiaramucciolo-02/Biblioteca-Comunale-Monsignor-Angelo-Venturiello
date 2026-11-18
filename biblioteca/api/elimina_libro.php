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
// Recupera e valida l'ID del libro
$idLibro = $_POST["id_libro"] ?? "";
if (filter_var($idLibro, FILTER_VALIDATE_INT) === false || $idLibro <= 0) 
{
    http_response_code(400);
    echo json_encode(["errore" => "Libro non valido."]);
    exit;
}
try {
    $connessione->beginTransaction();
    // Verifica che il libro esista
    $controlloLibro = $connessione->prepare("SELECT id_libro FROM libro WHERE id_libro = ? FOR UPDATE");
    $controlloLibro->execute([$idLibro]);
    if (!$controlloLibro->fetch()) 
    {
        $connessione->rollBack();
        http_response_code(404);
        echo json_encode(["errore" => "Libro non trovato."]);
        exit;
    }
    // Verifica le copie collegate durante l'operazione
    $controlloCopie = $connessione->prepare("SELECT id_copia FROM copia_libro WHERE id_libro = ? FOR UPDATE");
    $controlloCopie->execute([$idLibro]);
    $controlloCopie->fetchAll(PDO::FETCH_COLUMN);
    // Controlla se esistono prestiti attivi o restituiti
    $controlloPrestiti = $connessione->prepare("SELECT COUNT(*)FROM prestito p INNER JOIN copia_libro c ON p.id_copia = c.id_copia WHERE c.id_libro = ?");
    $controlloPrestiti->execute([$idLibro]);
    if ((int)$controlloPrestiti->fetchColumn() > 0)
    {
        $connessione->rollBack();
        http_response_code(409);
        echo json_encode(["errore" => "Impossibile eliminare il libro: esistono prestiti collegati, anche nello storico."]);
        exit;
    }
    // Elimina tutte le copie del libro
    $eliminaCopie = $connessione->prepare("DELETE FROM copia_libro WHERE id_libro = ?");
    $eliminaCopie->execute([$idLibro]);
    // Elimina il libro dal catalogo
    $eliminaLibro = $connessione->prepare("DELETE FROM libro WHERE id_libro = ?");
    $eliminaLibro->execute([$idLibro]);
    $connessione->commit();
    echo json_encode(["messaggio" => "Libro eliminato con successo."]);
} catch (PDOException $errore) 
{
    if ($connessione->inTransaction()) 
    {
        $connessione->rollBack();
    }
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Impossibile eliminare il libro."]);
}
?>