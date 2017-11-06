# Hacking

## Preparation

- run `git submodule update --init`
- run `yarn`

## Start the test project

- run `yarn start-playground-plain`


## Chrome extension

- run `yarn start:chrome`
- Go to `chrome://extensions`, check "developer mode", and click "Load
  unpacked extension", and select directory `lib/chrome`
  
## Firefox extension

- run `yarn start:firefox`
- Go to `about:debugging`, check "Enable add-on debugging", and click "Load Temporary Add-on", and select file `lib/firefox/manifest.json`
