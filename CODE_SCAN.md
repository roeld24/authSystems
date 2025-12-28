# Code Analysis Report

Durante lo sviluppo, è stata eseguita una scansione generale del codice prodotto 
fin a quel momento, per individuare potenziali problemi di sicurezza, vulnerabilità e
miglioramenti della qualità del codice. La scansione è stata effettuata utilizzando
lo strumento `CodeQL`, integrato in GitHub Actions.

Il risultato della scansione ha evidenziato i seguenti punti:

![CodeQL Scan Results](./img/#1.png)

Il tool in questo caso segnala la presenza di informazioni sensibili all'interno del sistema di log.
Risolto semplicemente rimuovendo le informazioni sensibili dai log di debug.

![CodeQL Scan Results](./img/#2.png)

La seconda segnalazione è invece un po' più complessa, in quanto riguarda la prevenzione di attacchi
`DDoS` (Distributed Denial of Service).
Il problema riguarda l'assenza di un sistema di limitazione delle richieste in ingresso.
Per risolvere questo problema, è stato implementato un sistema di rate limiting utilizzando
la libreria `express-rate-limit`, che consente di limitare il numero di richieste che un utente
può effettuare in un determinato intervallo di tempo.

> *Nota*: erano presenti diverse segnalazioni dello stesso problema per diversi endpoint, tutti 
> riguardanti il rate limiting. La soluzione adottata ha risolto tutte le segnalazioni di questo tipo.

![CodeQL Scan Results](./img/#10.png)

La terza segnalazione riguarda il provvedimento di parametri per una Query SQL, utilizzando direttamente
variabili utente. Questo può portare a vulnerabilità di tipo SQL Injection.

Per risolvere questo problema, sono stati utilizzati i Query Parameters forniti dalla libreria `pg`
che consentono di eseguire query SQL in modo sicuro, evitando il rischio di SQL Injection.

![CodeQL Scan Results](./img/#11.png)

Infine, l'ultima segnalazione riguarda l'utilizzo di dati sensibili all'interno di richieste `GET`.
Le richieste `GET` non sono sicure per trasmettere informazioni sensibili, in quanto i dati
vengono inclusi nell'URL e possono essere facilmente intercettati o memorizzati nei log del server.

