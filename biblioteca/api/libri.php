<?php
header("Content-Type: application/json; charset=utf-8");
require_once __DIR__ . "/connessione.php";
//Visualizza i libri presenti nel catalogo
try {
    $sql = "SELECT l.id_libro,l.titolo,l.autore,l.editore,l.genere,l.anno_pubblicazione,
                COUNT(CASE WHEN c.stato = 'disponibile' THEN 1 END) AS copie_disponibili
            FROM libro l
            LEFT JOIN copia_libro c ON l.id_libro = c.id_libro
            WHERE l.visibile_catalogo = 1
            GROUP BY l.id_libro,l.titolo,l.autore,l.editore,l.genere,l.anno_pubblicazione
            ORDER BY l.titolo";
    $risultato = $connessione->query($sql);
    $libri = $risultato->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($libri);
} catch (PDOException $errore) 
{
    error_log($errore->getMessage());
    http_response_code(500);
    echo json_encode(["errore" => "Impossibile caricare il catalogo"]);
}
?>