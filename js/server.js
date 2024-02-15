const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const PORT = 3111;

// Définir le chemin vers le répertoire des fichiers statiques
const staticPath = path.join(__dirname, '..', 'AdopteUnFilm', 'dist', 'adopte-un-film','browser');

// Servir les fichiers statiques
app.use(express.static(staticPath));

// Définir la route par défaut pour servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

// Créer un serveur HTTPS sans certificat
const server = http.createServer(app);

// Démarrer le serveur HTTPS
server.listen(PORT, () => {
    console.log('HTTPS server is running on port', PORT);
});
