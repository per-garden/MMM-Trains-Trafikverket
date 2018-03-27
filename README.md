# MMM-Trains-Trafikverket
Additional Module for MagicMirror², to display train departure times for railway stations within Sweden, as supplied by the Swedish Transport Administration (Trafikverket).

Using this module requires registration with Trafikverket/Trafiklab see section `Base API`.

![Alt text](screenshot.png?raw=true "screenshot")

## Installation

1. Navigate into your MagicMirros's `modules` folder.
2. Clone repository `git clone https://github.com/per-garden/MMM-Trains-Trafikverket`

```
cd MMM-Trains-Trafikverket && npm install
```

Run the `test` npm script
```
npm test
```

## Usage

To use this module, add it to the modules array in the `config/config.js` file:

````javascript
modules: [
    {
      module: "MMM-Trains-Trafikverket",
      position: "bottom_right",
      header: "Avgångar Malmö C",
      config: {
        // https://www.trafiklab.se/api/trafikverket-oppet-api
        key: "API-key", // Required
        // Station name for which to continously fetch departure data
        name: "Malmö C", // Required
        // Max number of departures to show at once
        count: 5, // Optional
        // Retry while loading data in ms
        retryDelay: 5 * 1000, // Optional
        // Display update interval in ms
        updateInterval:  2 * 60 * 1000, // Optional
      }
    },
]
````

Name must be the exact official(?) Trafikverket string. Valid names can be tried out downloading and running `http://api.trafikinfo.trafikverket.se/downloadfile.ashx?n=Javascript_Search.html`.

API-key as described below. Defaults for optional fields as in example above.

## Base API

This module uses the Swedish Transport Administration open API, `Trafikverket öppet API`. A valid API-key is required:

- Register with Trafikverket/Trafiklab: `http://api.trafikinfo.trafikverket.se/Account/Register`
- Log in at: `https://www.trafiklab.se/`
- Get a free API-key: `https://www.trafiklab.se/user/YOUR_USER_ID/keys`
- Set up a Trafiklab project: `https://www.trafiklab.se/node/add/project`
- Choose `Trafikverket öppet API` as project API to use: `https://www.trafiklab.se/api/trafikverket-oppet-api`

