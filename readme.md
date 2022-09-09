# 🏝 BADEVANN 🏊‍♂️
`badevann` henter vanntemperaturer fra internett og lister ut resultatet i konsollen.

# INSTALLASJON  💾
Bruk kommandolinjeverktøyet `npm` som følger med [node.js](https://nodejs.org/)  
Minimum påkrevde node-versjon er **12**
****
Kjør følgende fra terminalen  
`npm i -g badevann`  
Når installasjonen er ferdig kan du bare skrive `badevann`, så er du i gang.  

# BRUK 💻
`badevann` lar deg velge badeplass etter fylke eller kommune, søke etter badeplasser og sjekke dagens høyeste badetemperaturer.  
Alternativt kan du skrive `badevann <badeplass>`, så henter den ut temperaturer for `<badeplass>` og lister ut resultatet.

# PARAMETRE ⌨️
`h` eller `help` vis denne teksten og avslutt  
`v` eller `verbose` vis mer detaljert info om badeplassen  
`i` eller `iso` vis tidspunkt for måleravlesning på ISO 8601-format  
`s` eller `short` vis kun temperatur  
`nocolor` ikke fargelegg temperaturen (<20 er blå, 20-25 er grønn og >25 er rød)   
`d` eller `debug` vis utfyllende info ved bruk   

## Eksempler

`badevann short` Viser hovedmenyen, og når du velger en badeplass listes kun temperaturen.  
`badevann storøyodden s` Hent badetemperatur fra Storøyodden, vis bare temperatur.
`badevann kalvøya v` Hent badetemperatur fra Kalvøya, vis mer detaljert info om badeplassen.  
`badevann sørenga iso` Hent badetemperatur fra Sørenga på ISO 8601-format.

# Powerlevel10k-integrasjon
Om du kjører [zsh](https://www.zsh.org/) (standard-shell på macOS) med [powerlevel10k](https://github.com/romkatv/powerlevel10k) kan du få **badetemperatur fra din favoritt-badeplass som et prompt-element**:

1. Legg `badevann`-kallet som en variabel i `~/.zshrc`, f.eks  
```temp="$(badevann storøyodden s)"```  
(husk s-parameteren for å bare hente ut temperatur). 
2. Åpne `~/.p10k.zsh`, og lag en funksjon som heter `prompt_bathing_temp`, slik:  
```
function prompt_bathing_temp() {
  p10k segment -b cyan -f black -i '🌡' -t $temp
}
  ```
3. legg til `bathing_temp` som en linje under `typeset -g POWERLEVEL9K_LEFT_PROMPT_ELEMENTS`.  
Denne referer til `prompt_bathing_temp`-funksjonen.  
4. Lagre `~/.p10k.zsh` og `~/.zshrc`, og start terminalen på nytt.
5. Nå vil badetemperaturen vises i shell-prompten din.


# OM DATAENE 💽
Dataene kommer primært fra YR.  
Ved feil i appen, sjekk nettsiden eller logg et issue på [github](https://github.com/damsleth/badevann/issues).

# LISENS 🤷‍♂️
### [WTFPL](http://www.wtfpl.net/) 
