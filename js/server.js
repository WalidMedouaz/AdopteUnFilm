const express = require('express');
const http = require('http');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
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

app.get('/films', async (req, res) => {
    try {
        const apiKey = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
        const language = 'fr-FR';

        const randomPage = Math.floor(Math.random() * 500);

        const url = 'https://api.themoviedb.org/3/movie/popular?api_key='+apiKey+'&language='+language+'&page='+randomPage;

        const response = await axios.get(url);
        const films = response.data.results;

        const randomIndex = Math.floor(Math.random() * films.length);
        const randomFilm = films[randomIndex];

        const { title, poster_path, id, overview } = randomFilm;

        res.json({ title, poster_path, id, overview });
    } catch (error) {
        console.error('Error fetching films:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des films' });
    }
  });
