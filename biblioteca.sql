-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Creato il: Nov 18, 2026 alle 19:01
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `biblioteca`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `copia_libro`
--

CREATE TABLE `copia_libro` (
  `id_copia` int(11) NOT NULL,
  `stato` enum('disponibile','in_prestito','non_disponibile') NOT NULL,
  `id_libro` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `copia_libro`
--

INSERT INTO `copia_libro` (`id_copia`, `stato`, `id_libro`) VALUES
(1, 'disponibile', 1),
(2, 'disponibile', 1),
(3, 'disponibile', 2),
(4, 'disponibile', 3),
(5, 'disponibile', 4),
(6, 'disponibile', 5),
(7, 'disponibile', 5),
(8, 'disponibile', 6),
(9, 'disponibile', 7),
(10, 'in_prestito', 8),
(11, 'non_disponibile', 8),
(12, 'in_prestito', 9),
(13, 'non_disponibile', 10),
(14, 'in_prestito', 11),
(15, 'disponibile', 12),
(16, 'disponibile', 12),
(17, 'disponibile', 13),
(18, 'in_prestito', 14),
(19, 'disponibile', 15),
(20, 'in_prestito', 20),
(21, 'disponibile', 20),
(22, 'disponibile', 21),
(23, 'disponibile', 22),
(24, 'disponibile', 22),
(25, 'disponibile', 23),
(26, 'non_disponibile', 24),
(27, 'non_disponibile', 25),
(28, 'non_disponibile', 9),
(30, 'disponibile', 2),
(31, 'disponibile', 6),
(32, 'disponibile', 13),
(33, 'disponibile', 21);

-- --------------------------------------------------------

--
-- Struttura della tabella `libro`
--

CREATE TABLE `libro` (
  `id_libro` int(11) NOT NULL,
  `isbn` varchar(13) NOT NULL,
  `titolo` varchar(150) NOT NULL,
  `autore` varchar(100) NOT NULL,
  `anno_pubblicazione` year(4) NOT NULL,
  `genere` varchar(100) NOT NULL,
  `editore` varchar(150) NOT NULL,
  `visibile_catalogo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `libro`
--

INSERT INTO `libro` (`id_libro`, `isbn`, `titolo`, `autore`, `anno_pubblicazione`, `genere`, `editore`, `visibile_catalogo`) VALUES
(1, '9788807900495', 'La coscienza di Zeno', 'Italo Svevo', '2014', 'Psicologico', 'Feltrinelli', 0),
(2, '9788804666639', 'La solitudine dei numeri primi', 'Paolo Giordano', '2016', 'Drammatico', 'Mondadori', 1),
(3, '9780141439587', 'Emma', 'Jane Austen', '2003', 'Romanzo classico', 'Penguin Classics', 1),
(4, '9788806219642', 'La Storia', 'Elsa Morante', '2014', 'Romanzo storico', 'Einaudi', 1),
(5, '9788817016193', 'Il fu Mattia Pascal', 'Luigi Pirandello', '2007', 'Romanzo filosofico', 'Rizzoli', 1),
(6, '9788858420423', 'La tregua', 'Primo Levi', '2015', 'Romanzo autobiografico', 'Einaudi', 1),
(7, '9788893810753', 'La storia infinita', 'Michael Ende', '2017', 'Fantasy', 'Salani', 1),
(8, '9788817076333', 'Colpa delle stelle', 'John Green', '2014', 'Romanzo sentimentale', 'Rizzoli', 1),
(9, '9788831029957', 'Harry Potter e la pietra filosofale', 'J. K. Rowling', '2026', 'Fantasy', 'Salani', 1),
(10, '9788804679622', 'Dieci piccoli indiani', 'Agatha Christie', '2017', 'Giallo', 'Mondadori', 1),
(11, '9788838947834', 'La forma dell\'acqua', 'Andrea Camilleri', '2025', 'Giallo poliziesco', 'Sellerio', 1),
(12, '9788854168145', 'I canti', 'Giacomo Leopardi', '2014', 'Poesia', 'Newton Compton', 0),
(13, '9780385333849', 'Slaughterhouse-Five', 'Kurt Vonnegut', '1999', 'Fantascienza', 'Dial Press', 1),
(14, '9780060850524', 'Brave New World', 'Aldous Huxley', '2006', 'Fantascienza', 'Harper Perennial', 1),
(15, '9788806239831', 'Le otto montagne', 'Paolo Cognetti', '2018', 'Formazione', 'Einaudi', 1),
(20, '9788837914165', 'I promessi sposi', 'Alessandro Manzoni', '2021', 'Romanzo storico', 'Cappelli', 1),
(21, '9788807901690', 'Il piccolo principe', 'Antoine de Saint-Exupéry', '2015', 'Narrativa', 'Feltrinelli', 1),
(22, '9788807900846', 'Orgoglio e pregiudizio', 'Jane Austen', '2013', 'Romanzo rosa', 'Feltrinelli', 0),
(23, '9788804666721', 'L\'ombra del vento', 'Carlos Ruiz Zafón', '2016', 'Mistero', 'Mondadori', 1),
(24, '9788830101180', 'Il nome della rosa', 'Umberto Eco', '1980', 'Giallo storico', 'Bompiani', 1),
(25, '9788804774112', 'Il Barone rampante', 'Italo Calvino', '2022', 'Romanzo fantastico', 'Mondadori', 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `prestito`
--

CREATE TABLE `prestito` (
  `id_prestito` int(11) NOT NULL,
  `id_copia` int(11) NOT NULL,
  `id_utente` int(11) NOT NULL,
  `data_prestito` date NOT NULL,
  `data_scadenza` date NOT NULL,
  `data_restituzione` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `prestito`
--

INSERT INTO `prestito` (`id_prestito`, `id_copia`, `id_utente`, `data_prestito`, `data_scadenza`, `data_restituzione`) VALUES
(6, 27, 7, '2026-10-24', '2026-11-23', '2026-10-24'),
(7, 27, 7, '2026-10-24', '2026-11-23', '2026-10-27'),
(8, 13, 9, '2026-10-24', '2026-11-23', '2026-11-07'),
(9, 10, 9, '2026-10-24', '2026-11-23', '2026-11-15'),
(10, 11, 9, '2026-10-24', '2026-11-23', '2026-11-11'),
(11, 18, 7, '2026-10-26', '2026-11-25', '2026-10-26'),
(12, 23, 7, '2026-10-30', '2026-11-29', '2026-10-30'),
(13, 23, 7, '2026-11-03', '2026-12-03', '2026-11-03'),
(14, 6, 7, '2026-11-05', '2026-12-05', '2026-11-15'),
(15, 19, 7, '2026-11-11', '2026-12-11', '2026-11-17'),
(16, 4, 7, '2026-11-13', '2026-12-13', '2026-11-17'),
(17, 10, 7, '2026-11-15', '2026-12-15', '2026-11-17'),
(18, 25, 9, '2026-11-16', '2026-12-16', '2026-11-17'),
(19, 9, 9, '2026-11-16', '2026-12-16', '2026-11-16'),
(20, 5, 7, '2026-11-17', '2026-12-17', '2026-11-17'),
(21, 8, 7, '2026-11-17', '2026-12-17', '2026-11-17'),
(22, 31, 7, '2026-11-17', '2026-12-17', '2026-11-17'),
(23, 20, 7, '2026-11-17', '2026-12-17', '2026-11-17'),
(24, 14, 7, '2026-11-17', '2026-12-17', '2026-11-17'),
(25, 14, 7, '2026-11-17', '2026-12-17', NULL),
(26, 18, 7, '2026-11-17', '2026-12-17', NULL),
(27, 4, 7, '2026-11-17', '2026-12-17', '2026-11-18'),
(28, 8, 7, '2026-11-18', '2026-12-18', '2026-11-18'),
(29, 12, 9, '2026-11-18', '2026-12-18', NULL),
(30, 31, 9, '2026-11-18', '2026-12-18', '2026-11-18'),
(31, 4, 9, '2026-11-18', '2026-12-18', '2026-11-18'),
(32, 20, 9, '2026-11-18', '2026-12-18', NULL),
(33, 21, 7, '2026-11-18', '2026-12-18', '2026-11-18');

-- --------------------------------------------------------

--
-- Struttura della tabella `utente`
--

CREATE TABLE `utente` (
  `id_utente` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `cognome` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `ruolo` enum('lettore','bibliotecario') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `utente`
--

INSERT INTO `utente` (`id_utente`, `nome`, `cognome`, `email`, `password_hash`, `ruolo`) VALUES
(7, 'Mario', 'Rossi', 'mariorossi@example.it', '$2y$10$MSbq7loR4GLUDWZWcchiFusUKpOfnq0VwWq529G5kIqFlJl0JjWga', 'lettore'),
(8, 'Anna', 'Bianchi', 'anna.bianchi@example.com', '$2y$10$qieRcWSoqoqLeImFNGaZQODcPSYDq1QZMpYOEs8m1/.PaD6N5jvxG', 'bibliotecario'),
(9, 'Marta', 'Verdi', 'martaverdi@example.com', '$2y$10$GBbjvWYK0jXaZE24iCK32OPx/KA0BbEg/x5oQP0YthSvt4lacHFRG', 'lettore'),
(13, 'Simone', 'Neri', 'simoneneri3@example.it', '$2y$10$mI1aynF10X1yuFVOEpyvy.T9Qaq8pNU4ayUJnNox.OI2mujVpm5Ky', 'lettore'),
(14, 'Sara', 'Rossi', 'sararossi@example.it', '$2y$10$2qXaeEAXmi/cKUkMEkog3.VgT0WANIWlkrB/5zjKNV2wCLeBH8.yy', 'lettore');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `copia_libro`
--
ALTER TABLE `copia_libro`
  ADD PRIMARY KEY (`id_copia`),
  ADD KEY `fk_copia_libro` (`id_libro`);

--
-- Indici per le tabelle `libro`
--
ALTER TABLE `libro`
  ADD PRIMARY KEY (`id_libro`),
  ADD UNIQUE KEY `uq_libro_isbn` (`isbn`);

--
-- Indici per le tabelle `prestito`
--
ALTER TABLE `prestito`
  ADD PRIMARY KEY (`id_prestito`),
  ADD KEY `id_utente` (`id_utente`),
  ADD KEY `id_copia` (`id_copia`);

--
-- Indici per le tabelle `utente`
--
ALTER TABLE `utente`
  ADD PRIMARY KEY (`id_utente`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `copia_libro`
--
ALTER TABLE `copia_libro`
  MODIFY `id_copia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT per la tabella `libro`
--
ALTER TABLE `libro`
  MODIFY `id_libro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT per la tabella `prestito`
--
ALTER TABLE `prestito`
  MODIFY `id_prestito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT per la tabella `utente`
--
ALTER TABLE `utente`
  MODIFY `id_utente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `copia_libro`
--
ALTER TABLE `copia_libro`
  ADD CONSTRAINT `fk_copia_libro` FOREIGN KEY (`id_libro`) REFERENCES `libro` (`id_libro`) ON UPDATE CASCADE;

--
-- Limiti per la tabella `prestito`
--
ALTER TABLE `prestito`
  ADD CONSTRAINT `fk_prestito_copia` FOREIGN KEY (`id_copia`) REFERENCES `copia_libro` (`id_copia`) ON UPDATE CASCADE,
  ADD CONSTRAINT `prestito_ibfk_2` FOREIGN KEY (`id_utente`) REFERENCES `utente` (`id_utente`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
