# Quiz Night

Een interactieve quizapplicatie met een presentatorscherm en een spelerscherm, gebouwd met Node.js en Socket.io.

---

## Hoe speel je het spel?

### Scherm setup

Je hebt **2 schermen** nodig:

| Scherm | URL | Doel |
|--------|-----|------|
| **Presentator** | `http://localhost:3000/presenter.html` | Hier zie je de vragen, antwoorden en bedien je het spel |
| **Spelers** | `http://localhost:3000/` | Dit toon je aan de spelers (bijv. op een TV of beamer) |

**Tip**: Open het presentatorscherm op je laptop en het spelerscherm op een groot scherm dat alle spelers kunnen zien.

---

## Tijd systeem

- Iedereen start met **60 seconden** op de klok
- Je speelt NIET om punten, maar om tijd!
- Wie aan het einde de meeste tijd heeft, wint

---

## De Rondes

### Ronde 1: VRAAGRONDE

**Hoe werkt het?**
1. Er worden vragen gesteld aan de groep
2. De persoon die aan de beurt is, mag als eerste antwoorden
3. **Fout antwoord?** De volgende persoon mag proberen
4. **Juist antwoord?** Diegene mag bij de volgende vraag als eerste antwoorden

**Puntenvragen:**
- Elke **3de vraag** (vraag 3, 6, 9, 12...) is een **PUNTEN VRAAG**
- Bij een juist antwoord krijg je **+20 seconden**!

---

### Ronde 2: WAVELENGTH

**Hoe werkt het?**
Dit is een teamronde! Jullie spelen in **duo's**.

1. Er verschijnt een slider met twee uitersten (bijv. "Lelijk" - "Mooi")
2. De **UITLEGGER** ziet waar de target staat en geeft een hint/voorbeeld
3. De **RADER** zegt "meer links" of "meer rechts"
4. De presentator beweegt de slider op basis van de aanwijzingen
5. Bij ENTER wordt onthuld hoe dicht jullie zijn

**Scoring:**
| Resultaat | Beloning |
|-----------|----------|
| **Bullseye** (binnen 4 punten) | +30 sec voor BEIDE spelers! |
| **Dichtbij** (binnen 12 punten) | +10 sec voor BEIDE spelers! |
| **Mis** | +0 seconden |

Iedereen legt 1x uit en raadt 1x!

---

### Ronde 3: PUZZELRONDE

**Hoe werkt het?**
1. Er verschijnt een matrix met **12 hints**
2. Elke 4 hints horen bij **1 oplossing** (3 oplossingen totaal)
3. Eén speler is aan de beurt

**BELANGRIJK: De tijd loopt!**
- Terwijl je nadenkt, tikt jouw tijd weg!
- **Juiste oplossing geraden?** +20 seconden (de tijd blijft lopen)
- **Geen idee?** Zeg "PAS" en de volgende speler is aan de beurt

Elke puzzel start met een andere speler voor eerlijke rotatie.

---

### Ronde 4: DE FINALE

**Hoe werkt het?**
De **TOP 2** spelers gaan de strijd aan!

1. Er komt een onderwerp met **5 mogelijke antwoorden**
2. Degene met de **laagste score** begint
3. Je tijd loopt af terwijl je nadenkt!

**Scoring:**
- **Correct antwoord?** **-20 seconden** van je tegenstander!
- **Geen idee?** Zeg "PAS" en de ander mag aanvullen

**Einde:**
- De ronde stopt bij 5 juiste antwoorden OF als iemand op 0 staat
- **Winnaar** = wie nog tijd over heeft!

---

## Wanneer gaat je tijd weg?

| Ronde | Wanneer verlies je tijd? |
|-------|--------------------------|
| Vraagronde | Nooit automatisch (alleen punten te winnen) |
| Wavelength | Nooit automatisch (alleen punten te winnen) |
| Puzzelronde | **Continu** terwijl je aan de beurt bent en nadenkt |
| Finale | **Continu** terwijl je aan de beurt bent |

---

## Technische Setup

### Vereisten
- [Node.js](https://nodejs.org/) (versie 14 of hoger)

### Installatie

```bash
# 1. Ga naar de project folder
cd QUIZ

# 2. Installeer de dependencies
npm install

# 3. Start de server
npm start
```

### Server starten

Na het uitvoeren van `npm start` zie je:

```
Quiz Server running on http://localhost:3000

Participant screen: http://localhost:3000/
Presenter screen:   http://localhost:3000/presenter.html
```

### Spelers toevoegen

1. Open het **presentatorscherm** (`/presenter.html`)
2. Voeg spelers toe via de setup interface
3. Of pas `participants.json` aan met default spelers:

```json
["Speler1", "Speler2", "Speler3", "Speler4"]
```

---

## Data bestanden

| Bestand | Inhoud |
|---------|--------|
| `questions.json` | Vragen voor de vraagronde |
| `wavelength.json` | Kaarten voor de wavelength ronde |
| `puzzles.json` | Puzzels met hints en oplossingen |
| `finale.json` | Topics met 5 antwoorden voor de finale |
| `participants.json` | Default lijst van spelers |

---

## Snelle start

1. `npm install`
2. `npm start`
3. Open **2 browser windows**:
   - Window 1 (laptop): `http://localhost:3000/presenter.html`
   - Window 2 (TV/beamer): `http://localhost:3000/`
4. Voeg spelers toe en klik op "Start Game"
5. Veel plezier!
