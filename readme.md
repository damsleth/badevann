# 🏝 BADEVANN 🏊‍♂️
`badevann` henter vanntemperaturer fra internett og lister ut resultatet i konsollen.

# INSTALLASJON  💾
Bruk kommandolinjeverktøyet `npm`, som følger med [node.js](https://nodejs.org/)  
Minimum påkrevde versjon av node er **12**
****
Kjør følgende fra terminalen  
`npm i -g badevann`  
Når installasjonen er ferdig kan du bare skrive `badevann`

# BRUK 💻
`badevann` lar deg velge badeplass etter fylke eller kommune, søke etter badeplasser, og sjekke dagens høyeste badetemperaturer.
Alternativt kan du skrive `badevann <badeplass>`, så henter den ut temperaturer for `<badeplass>` og lister ut resultatet.

# PARAMETRE ⌨️
`h` eller `help` vis denne teksten og avslutt
`v` eller `verbose` vis mer detaljert info om badeplassen 
`i` eller `iso` vis tidspunkt for måleravlesning på ISO 8601-format
`s` eller `short` vis mer detaljert info om badeplassen 
`nocolor` ikke fargelegg temperaturen (<20 er blå, 20-25 er grønn og >25 er rød)  
`debug` vis utfyllende info ved bruk  

# TODO
* Settings: Lar deg velge standard badeplass, standard utskrift, m.m

# OM DATAENE 💽
Dataene kommer primært fra YR. Ved feil i appen, sjekk nettsiden eller send en PR

# LISENS 🤷‍♂️
### [WTFPL](http://www.wtfpl.net/) 
