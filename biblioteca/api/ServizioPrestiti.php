<?php
// Classe che gestisce la richiesta e la restituzione dei prestiti della biblioteca.
class ServizioPrestiti
{
    // Connessione al database
    private PDO $connessione;
    // Il costruttore riceve un oggetto PDO
    public function __construct(PDO $connessione)
    {
        $this->connessione = $connessione;
    }
    /**
     * Registra un prestito per un lettore.
     * Restituisce il codice HTTP e il messaggio da inviare al browser.
     */
    public function richiediPrestito(int $idUtente, int $idLibro): array
    {
        try {
            $this->connessione->beginTransaction();
            // Blocca il lettore per gestire richieste simultanee
            $queryUtente = $this->connessione->prepare("SELECT id_utente FROM utente WHERE id_utente = ? FOR UPDATE");
            $queryUtente->execute([$idUtente]);
            if (!$queryUtente->fetch()) {
                $this->connessione->rollBack();
                return ["codice" => 404,"errore" => "Utente non trovato."];
            }
            // Verifica il limite di tre prestiti attivi
            $queryPrestiti = $this->connessione->prepare("SELECT COUNT(*) FROM prestito WHERE id_utente = ? AND data_restituzione IS NULL");
            $queryPrestiti->execute([$idUtente]);
            $prestitiAttivi = (int) $queryPrestiti->fetchColumn();
            if ($prestitiAttivi >= 3) 
            {
                $this->connessione->rollBack();
                return ["codice" => 409,"errore" => "Hai già raggiunto il limite di 3 prestiti attivi."];
            }
            // Cerca una copia disponibile del libro
            $queryCopia = $this->connessione->prepare("SELECT id_copia FROM copia_libro WHERE id_libro = ? AND stato = 'disponibile' ORDER BY id_copia LIMIT 1 FOR UPDATE");
            $queryCopia->execute([$idLibro]);
            $copia = $queryCopia->fetch(PDO::FETCH_ASSOC);
            if (!$copia) 
            {
                $this->connessione->rollBack();
                return ["codice" => 409,"errore" => "Nessuna copia disponibile per questo libro."];
            }
            $idCopia = (int) $copia["id_copia"];
            // Inserisce il prestito con durata di 30 giorni
            $inserimento = $this->connessione->prepare("INSERT INTO prestito (id_utente, id_copia, data_prestito, data_scadenza, data_restituzione) VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL)");
            $inserimento->execute([$idUtente, $idCopia]);
            // Aggiorna lo stato della copia
            $aggiornamento = $this->connessione->prepare("UPDATE copia_libro SET stato = 'in_prestito' WHERE id_copia = ?");
            $aggiornamento->execute([$idCopia]);
            $this->connessione->commit();
            return ["codice" => 201,"messaggio" => "Prestito registrato con successo!"];
        } catch (PDOException $errore) {
            if ($this->connessione->inTransaction())
            {
                $this->connessione->rollBack();
            }
            error_log($errore->getMessage());
            return ["codice" => 500,"errore" => "Impossibile registrare il prestito."];
        }
    }
    // Registra la restituzione di una copia.
    public function registraRestituzione(int $idPrestito): array
    {
            $this->connessione->beginTransaction();
            // Blocca il prestito durante la restituzione
            $query = $this->connessione->prepare("SELECT id_copia, data_restituzione FROM prestito WHERE id_prestito = ? FOR UPDATE");
            $query->execute([$idPrestito]);
            $prestito = $query->fetch(PDO::FETCH_ASSOC);
            // Registra la data di restituzione
            $aggiornaPrestito = $this->connessione->prepare("UPDATE prestito SET data_restituzione = CURDATE() WHERE id_prestito = ?");
            $aggiornaPrestito->execute([$idPrestito]);
            // Rende nuovamente disponibile la copia
            $aggiornaCopia = $this->connessione->prepare("UPDATE copia_libro SET stato = 'disponibile' WHERE id_copia = ?");
            $aggiornaCopia->execute([$prestito["id_copia"]]);
            $this->connessione->commit();
         return ["codice" => 200,"messaggio" => "Restituzione registrata con successo!"];
    }
}
?>