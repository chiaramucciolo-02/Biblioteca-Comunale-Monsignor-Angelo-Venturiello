<?php
//Dati per accedere al database in locale
$host = "127.0.0.1";
$porta = "3307";
$database = "biblioteca";
$utente = "root";
$password = "";
try 
{
    $connessione = new PDO("mysql:host=$host;port=$porta;dbname=$database;charset=utf8mb4",$utente,$password);
    $connessione->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
} catch (PDOException $errore) 
{
    error_log($errore->getMessage());
    http_response_code(500);
    exit("Errore di connessione al database.");
}
?>