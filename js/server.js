const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;
const OMDB_API_KEY = 'b86ad24a';

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    // Vérifier si la requête est pour récupérer les données de l'API OMDB
    if (pathname === '/movies') {
        // Construire l'URL de l'API OMDB
        const searchTerm = query.s || 'avatar_2';
        const page = query.page || 1;
        const omdbUrl = `https://www.omdbapi.com/?s=${searchTerm}&page=${page}&apiKey=${OMDB_API_KEY}`;

        // Effectuer une requête à l'API OMDB
        https.get(omdbUrl, (omdbRes) => {
            let data = '';

            // Recevoir les données de l'API OMDB
            omdbRes.on('data', (chunk) => {
                data += chunk;
            });

            // Une fois les données reçues, envoyer la réponse au client
            omdbRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        }).on('error', (err) => {
            console.error('Error fetching data from OMDB API:', err);
            res.writeHead(500);
            res.end('Internal Server Error');
        });
    } else {
        // Si la requête n'est pas pour récupérer les données de l'API OMDB, renvoyer une page HTML simple
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <html>
            <head><title>OMDB Movies</title></head>
            <body>
                <h1>OMDB Movies</h1>
                <img id="movieThumbnail" src="" alt="Movie Thumbnail">
                <script>
                    // Effectuer une requête vers le serveur pour récupérer les données de l'API OMDB
                    fetch('/movies')
                        .then(response => response.json())
                        .then(data => {
                            // Extraire l'URL de la vignette du premier film trouvé
                            const movieThumbnailUrl = data.Search[0].Poster;
                            // Afficher la vignette dans l'image
                            document.getElementById('movieThumbnail').src = movieThumbnailUrl;
                        })
                        .catch(error => console.error('Error fetching movies:', error));
                </script>
            </body>
            </html>
        `);
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
