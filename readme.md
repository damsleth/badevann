# 🏝 BADEVANN 🏊‍♂️
`badevann` henter vanntemperaturer fra badevann.no og lister ut resultatet i konsollen.

# INSTALLASJON  💾
bruk kommandolinjeverktøyet `npm`, som følger med [node.js](https://nodejs.org/)  
node v14 er anbefalt, men v12 er også støttet. Ingen andre versjoner er testet.

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

# OM DATAENE 💽
Dataene kommer fra badevann.no. Ved feil i appen, sjekk nettsiden eller send en PR

# LISENS 🤷‍♂️
### [WTFPL](http://www.wtfpl.net/) 