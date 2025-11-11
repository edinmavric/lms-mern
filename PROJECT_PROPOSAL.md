# Predlog Projekta

Veb aplikacija pod nazivom **LMS++** predstavlja kompletan sistem za upravljanje učenjem i upravljanje studentima, koji kombinuje funkcionalnosti sistema za upravljanje studentima (kao što je E-student) i sistema za upravljanje učenjem (kao što je Moodle) u jednu integrisanu platformu. Aplikacija omogućava upravljanje kursevima, nastavom, ispitima, ocenama, prisustvom, upisima, plaćanjima i drugim aspektima obrazovnog procesa.

Cilj projekta je razvoj višetenantske platforme koja omogućava obrazovnim institucijama, školama i organizacijama da upravljaju svim aspektima obrazovnog procesa kroz jedinstveni digitalni sistem, pružajući administratorske, profesorske i studentske interfejse prilagođene specifičnim potrebama svake uloge.

## Opis Projektnog Zadataka

Aplikacija omogućava kreiranje korisničkih naloga za tri tipa korisnika: administratore, profesore i studente, sa kompletnim sistemom autentifikacije i autorizacije zasnovanim na JWT tokenima.

Sistem podržava **multi-tenancy**, što omogućava više obrazovnih institucija (tenants) da koriste istu aplikaciju sa potpunom izolacijom podataka. Svaki tenant može konfigurisati sopstvene:

- Skale ocenjivanja (1-5, 1-10, 6-10)
- Pravila prisustva
- Valute i lokalne postavke

### Administratori

Administratori mogu:

- Upravljati korisnicima, odeljenjima, kursevima, upisima, ispitima, ocenama, prisustvom, bankovnim računima
- Pristupati evidenciji aktivnosti sistema
- Odobravati korisnike i upravljati statusom naloga

### Profesori

Profesori mogu:

- Kreirati i upravljati kursevima koji su im dodeljeni
- Kreirati i organizovati časove (lessons)
- Dodavati materijale za časove (PDF, video, prezentacije, slike, dokumenti, linkovi)
- Kreirati ispite sa pitanjima i odgovorima
- Ocenjivati studente
- Dodavati poene
- Pratiti prisustvo studenta
- Upravljati prijavama za ispite

### Studenti

Studenti mogu:

- Pregledati kurseve na koje su upisani
- Pristupati materijalima za časove
- Prijavljivati se na ispite
- Pregledati svoje ocene i poene
- Pratiti prisustvo
- Pregledati status upisa i plaćanja

### Dodatne Funkcionalnosti

Sistem omogućava:

- **Upravljanje upisima** sa podrškom za plaćanja (studenti plaćaju kurseve, administratori odobravaju plaćanja)
- **Sistem ocenjivanja** sa istorijom izmena
- **Sistem bodovanja** za aktivnosti
- **Praćenje prisustva** sa različitim statusima (prisutan, odsutan, kasni, opravdan)
- **Evidencija aktivnosti** sa nivoima ozbiljnosti i praćenjem IP adresa
- **Upload fajlova** kroz signed URLs za siguran pristup
- **API dokumentacija** kroz Swagger/OpenAPI 3.0
- **Email obaveštenja** putem Mailjet servisa
- **Rate limiting** za zaštitu od napada
- **Centralizovana obrada grešaka**

## Doseg Problema koji će biti Rešavan

Aplikacija rešava problem nedostatka integrisanog sistema koji kombinuje upravljanje studentima i upravljanje učenjem u jednu platformu. Obrazovne institucije se često suočavaju sa potrebom korišćenja više sistema - jednog za upravljanje studentima (kao što je E-student) i drugog za upravljanje učenjem (kao što je Moodle), što dovodi do:

- Fragmentacije podataka
- Dupliranja rada
- Poteškoća u koordinaciji

Aplikacija će omogućiti obrazovnim institucijama da upravljaju svim aspektima obrazovnog procesa kroz jedinstveni sistem:

- Upravljanje korisnicima i odeljenjima
- Kreiranje kurseva i časova
- Organizovanje ispita
- Ocenjivanje
- Praćenje prisustva
- Upravljanje upisima i plaćanjima
- Praćenje aktivnosti i generisanje izveštaja

**Multi-tenancy arhitektura** omogućava više obrazovnih institucija da koriste istu aplikaciju sa potpunom izolacijom podataka, što čini sistem ekonomičnim i skalabilnim rešenjem. Svaka institucija može konfigurisati sistem prema svojim specifičnim potrebama, uključujući skale ocenjivanja, pravila prisustva i lokalne postavke.

Projekat ima širi društveni značaj:

- Unapređenje digitalizacije obrazovanja
- Olakšavanje rada obrazovnim institucijama
- Poboljšanje komunikacije između profesora i studenata
- Promocija efikasnijeg upravljanja obrazovnim procesom

## Tehnologije u Upotrebi

### Frontend

- **React** sa TypeScript-om
- **Vite**
- **Tailwind CSS**

### Backend

- **Node.js** (Express.js)

### Baza Podataka

- **MongoDB**

## Korisnici Sistema

### Administrator

Korisnik koji upravlja celokupnim sistemom, korisnicima, tenantima, odeljenjima, kursevima, upisima, plaćanjima, bankovnim računima i pristupa evidenciji aktivnosti.

### Professor

Korisnik koji upravlja kursevima koji su mu dodeljeni, kreira časove i materijale, organizuje ispite, ocenjuje studente, dodaje poene i prati prisustvo.

### Student

Korisnik koji pregleda kurseve na koje je upisan, pristupa materijalima, prijavljuje se na ispite, pregleda ocene, poene i prisustvo, i upravlja upisima i plaćanjima.

## Objašnjenje Korisnika Sistema

### Administrator

- Može kreirati i upravljati korisničkim nalozima (administratori, profesori, studenti), odobravati naloge korisnika, upravljati statusom naloga
- Upravlja tenantima (obrazovnim institucijama), odeljenjima, kursevima, upisima, plaćanjima i bankovnim računima
- Može kreirati i upravljati ispitima, ocenama, prisustvom, poenima i materijalima za časove
- Ima pristup evidenciji aktivnosti sistema sa filtriranjem i statistika, može pratiti sve akcije u sistemu i rešavati prijave korisnika
- Može konfigurisati postavke tenanta, uključujući skale ocenjivanja, pravila prisustva, valute i lokalne postavke

### Professor

- Može pregledati kurseve koji su mu dodeljeni i upravljati njima
- Kreira i organizuje časove (lessons) za svoje kurseve, definiše datume i vremena časova
- Dodaje materijale za časove (PDF, video, prezentacije, slike, dokumente, linkove) kroz sistem upload-a fajlova
- Kreira ispite sa pitanjima i odgovorima, definiše datume ispita, trajanje i minimalne ocene za prolaz
- Ocenjuje studente nakon završetka ispita, dodaje komentare na ocene i prati istoriju izmena ocena
- Dodeljuje poene studentima za aktivnosti, prati poene po kursevima
- Evidentira prisustvo studenta na časovima sa različitim statusima (prisutan, odsutan, kasni, opravdan)
- Upravlja prijavama studenta za ispite, pregleda prijavljene studente i ocenjuje ih

### Student

- Može pregledati kurseve na koje je upisan, pristupati detaljima kurseva i časovima
- Pristupa materijalima za časove (PDF, video, prezentacije, slike, dokumenti, linkovi)
- Pregleda dostupne ispite, prijavljuje se na ispite i pregleda status prijava
- Pregleda svoje ocene sa detaljima, komentarima i istorijom, pregleda poene po kursevima
- Prati svoje prisustvo na časovima sa statusima (prisutan, odsutan, kasni, opravdan)
- Pregleda svoje upise, status plaćanja i istoriju plaćanja

## Tim i Sastav Tima

**Sastav tima:**

- Prof. dr Edin Dolićanin
- Doc. dr Aldina Avdić
- Edin Mavrić

**Vođa tima:** Edin Mavrić

## Cilj Tima

Cilj tima je da razvije funkcionalnu, stabilnu i korisnički orijentisanu veb aplikaciju koja omogućava efikasno upravljanje svim aspektima obrazovnog procesa kroz integrisanu platformu koja kombinuje upravljanje studentima i upravljanje učenjem.

Projekat ima za cilj da demonstrira praktičnu primenu principa softverskog inženjerstva, uključujući:

- Planiranje
- Dizajn arhitekture sa multi-tenancy podrškom
- Razvoj REST API servisa
- Implementaciju bezbednosnih mehanizama
- Integraciju frontend–backend sistema
- Testiranje funkcionalnosti kroz E2E testove

Cilj je takođe da se razvije skalabilna i održiva aplikacija koja može podržati više obrazovnih institucija sa potpunom izolacijom podataka, sa mogućnošću konfigurisanja sistema prema specifičnim potrebama svake institucije.

## Komunikacija Članova Tima

Komunikacija će se odvijati putem:

- Elektronske pošte
- GitHub platforme

## Rad Tima

| Dan u nedelji | Vreme rada |
| ------------- | ---------- |
| Ponedeljak    | 2h         |
| Utorak        | 2h         |
| Sreda         | 2h         |
| Četvrtak      | 3h         |
| Petak         | 3h         |
| Subota        | 2h         |
| Nedelja       | 1h         |

**Prosečan broj radnih sati:** 2-3h dnevno
