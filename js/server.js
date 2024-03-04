const express = require('express');
const path = require('path');
const https = require("https");
const cors = require('cors');
const fs = require("fs");

const app = express();
app.use(cors());

// Définir le chemin vers le répertoire des fichiers statiques
const staticPath = path.join(__dirname, '..', 'AdopteUnFilm', 'dist', 'adopte-un-film', 'browser');

// Servir les fichiers statiques
app.use(express.static(staticPath));

// Définir la route par défaut pour servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

// On utilise notre clé et certificat pour la connexion https
const options = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
};

// On se connecte à notre port d'écoute HTTPS
const server = https.createServer(options, app).listen(3115, () => {
    console.log("HTTPS => listening on 3115");
});
