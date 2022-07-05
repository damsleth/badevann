# 🏝 BADEVANN 🏊‍♂️
`badevann` henter vanntemperaturer fra internett og lister ut resultatet i konsollen.

# INSTALLASJON  💾
Bruk kommandolinjeverktøyet `npm`, som følger med [node.js](https://nodejs.org/)  
Minimum påkrevde versjon av node er **14**
****
Kjør følgende fra terminalen  
`npm i -g https://github.com/damsleth/badevann`

# BRUK 💻
`badevann` lar deg velge badeplass fra en liste.
Alternativt kan du skrive `badevann <badeplass>`, så henter den ut temperaturer for `<badeplass>` ELLER
Skrive `badevann <nummer>` for å hente temperaturer fra badeplassen som matcher nummeret

# PARAMETRE ⌨️
`help` vis denne teksten  
`debug` vis utfyllende info ved bruk  
`nocolor` ikke fargelegg temperaturen (<20 er blå, 20-25 er grønn og >25 er rød)  
`long` vis dato for måleravlesning sammen med vanntemperatur  
`iso` vis tidspunkt for måleravlesning på ISO 8601-format

# TODO
* Settings: Lar deg velge standard badeplass, standard utskrift, m.m
* Bugfix: dum bug som lager en `cache.json` og en `settings.json` i mappen du kjører programmet 

# OM DATAENE 💽
Dataene kommer primært fra YR. Ved feil i appen, sjekk nettsiden eller send en PR

# LISENS 🤷‍♂️
### [WTFPL](http://www.wtfpl.net/) 
