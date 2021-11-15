# Hacking

## Preparation

- run `git submodule update --init`
- run `npm run bootstrap`

## Start the test project

- run `npm run start-playground-plain`

## Chrome extension

- run `npm run start:chrome-debug-connection`
- Go to `chrome://extensions`, check "developer mode", and click "Load
  unpacked extension", and select directory `lib/chrome`

## Firefox extension

- run `yarn start:firefox`
- Go to `about:debugging`, check "Enable add-on debugging", and click "Load Temporary Add-on", and select file `lib/firefox/manifest.json`
