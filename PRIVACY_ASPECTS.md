# Aspetti relativi alla Privacy

| Categoria                                 | Dati                                                        | Sensibilità                              |
|-------------------------------------------|-------------------------------------------------------------|------------------------------------------|
| PII (Personally Identifiable Information) | `FirstName`, `LastName`, `Address`, `City`, `BirthDate`, ...| Alta: permettono identificazione univoca |
| Dati di contatto                          | `Email`, `PhoneNumber`                                      | Media: vettori per phishing/spam         |
| Dati finanziari                           | `InvoiceDate`, `BillingAddress`, `Total`                    | Alta: rischio frodi e furti d'identità   |
| Dati di autenticazione                    | `Username`, `PasswordHash`, `Salt`                          | Molto alta: accesso non autorizzato      |
| Dati comportamentali                      | Log delle attività                                          | Bassa: profilazione utente               |           

## Classificazione per Necessità di Trattamento

Secondo il principio di Minimizzazione dei Dati (GDPR Art. 5), ogni dato deve essere giustificato da una specifica
finalità.

a. Necessari per l'Esecuzione del Contratto (Operativi)

> FirstName, LastName, Address, BillingAddress, Invoice details.

> Senza questi dati non è possibile generare fatture legali o associare un acquisto a un cliente. Devono essere 
> conservati per obblighi fiscali (solitamente 10 anni).

b. Necessari per l'Autenticazione e Sicurezza (Tecnici)

> Email, Password (Hash), Logs.

> L'email funge da ID univoco. La password serve per l'accesso. I log servono per l'accountability e la forensic 
> analysis in caso di attacco.

> Le password non devono mai essere leggibili (nemmeno dagli amministratori).

c. Dati Facoltativi o a Rischio "Nice-to-have"

> Fax, BirthDate (per gli impiegati), Phone (se non usato per 2FA).

> Spesso questi campi nei database legacy (come Chinook) sono superflui per le app moderne.

> Se non strettamente necessari per il business, questi dati dovrebbero essere eliminati o non raccolti per ridurre la 
> superficie di attacco.

## Vulnerabilità nel Sistema

* **Criticità Media**: Logging Eccessivo

Nel file auditLog.model.js e nel middleware, c'è il rischio di loggare dati sensibili.
Se un utente sbaglia il login e inserisce la password nel campo username per errore, e il sistema logga il payload
della richiesta, la password finisce in chiaro nei log.

## Miglioramenti

* Key Rotation: Implementare un meccanismo che permetta di ruotare le chiavi privata/pubblica senza
interrompere il servizio (es. usando l'header kid - Key ID nel JWT).
* Principio del privilegio minimo: L'utente DB usato dall'applicazione Node.js non deve essere root.
Andrebbe creato un utente specifico che ha permessi solo di SELECT, INSERT, UPDATE sulle tabelle necessarie, e revoca 
DROP o ALTER.
* Redazione dei log: Rivedere quali dati vengono loggati per evitare di includere informazioni sensibili.
* Response plan: Definire uno script che, in caso di sospetto di breach, invalidi tutti i token e forzi il reset della 
password a tutti gli utenti.
