# 0 - REPORT SUL PROGETTO DI SISTEMI DI AUTENTICAZIONE
Oggigiorno la quasi totalità delle soluzioni IT si basano su architetture web.
Nella maggior parte dei casi tali soluzioni prevedono l’autenticazione di utenti su
un Front-End di presentazione che interagisce con un sistema Back-End sul
quale sono memorizzati database e procedure/algoritmi.

Nel corso di questo progetto verranno applicate le tecnologie di autenticazione e
di identificazione in due ambiti:

- un piccolo progetto dimostrativo dei sistemi di autenticazione di utenti a
diversi livelli (password, multi-factor authentication);
- un piccolo progetto che mostri l’applicazione dei sistemi di autenticazione
per rendere sicure le API (Application Programmin Interface).

Particolari aspetti da considerare valutando i rischi delle diverse architetture:
- Quali informazioni vengono utilizate
- Dove vengono salvate queste informazioni (file sul Back-End, file sul Front-End, cookies, tokens, …).
- Quali verifiche vengono effettuate e a quale stadio di autenticazione

Note (TODO):
- Produrre un elenco di tutti i pacchetti software ed ev. librerie utilizzati per il
progetto.
- Documentarsi su eventuali vulnerabilità di tali soluzioni e sugli effetti/impatti che
quete potrebbero comportare.
- Documentarsi sul tipo di licenze legate ai pacchetti identificati e a come siano
regolate le responsabilità nell'uso degli stessi.
- Preparare un Deployment Plan che documenti le istruzioni per preparare una potenziale dimostrazione in laboratorio.
 
# 1 - MULTI-FACTOR AUTHENTICATION
Studiare casi distinti d'applicazione per autenticazione di utenti che fanno uso di multi-factor authentication quali ad esempio:
- architettura PostFinance Mobile ID
- un'architettura che faccia uso di autenticazione mTAN
- un'architettura Photo-TAN
- un'architettura che gaccia uso di biometria per il mobile banking

Descrivere il flusso di informazione di queste architetture nelle fasi di user authentication (non di user registration).

Spiegare vantaggi e svantaggi a livello di costi di implementazione di architetture del genere

## SVOLGIMENTO
Metodi:
- mTAN (SMS-TAN)
- Mobile ID
- FIDO2/WebAuthn con chiave hardware

### mTAN
Il server invia un codice temporaneo via SMS al numero registrato dall'utente

![mTANdiagram](./img/mTAN_diagram.png)

- Vantaggi 
  - L'SMS gateway è relativamente economico (0.50 - 0.70 centesimi a SMS)
  - Non serve sviluppare una app dedicata
  
- Svantaggi
  - Serve un contratto con un provider SMS affifabile
  - Tecnologia a rischio di futura migrazione
  - Problemi di roaming o mancata consegna possono portare a costi operativi di assistenza
### Mobile ID
### FIDO2


# 2 - COME RENDERE SICURA UNA API
Comunicazione tra applicazione e infrastrutture eterogenee:come rendere sicura una API. A differenza del punto precedente questa soluzione prevede un progetto pratico di sviluppo di una applicazione delle tecniche da studiare.

Cercare e documentare le principali alternative di autenticazione (JWT, OAUTH, SAML).

## SVOLGIMENTO

### Fonti
- https://www.kelltontech.com/kellton-tech-blog/api-security-design-patterns



# 4 - OAUTH2
Studiare il framework di autorizzazione OAUTH2 e spiegare le differenze con JWT. 

## SVOLGIMENTO

### Fonti
- https://auth0.com/docs/authorization/protocols/protocol-oauth2
- https://auth0.com/docs/authorization/flows/call-your-api-using-the-authorization-code-flow

# 5 - RISCHI E CONTROMISURE
Per i sistemi JWT usati in questa esercitazione teorica e di laboratorio, quali rischi per la privacy si possono identificare?

Sarebbe possibile implementare una contromisura che garantisca una migliore privacy?

## SVOLGIMENTO
