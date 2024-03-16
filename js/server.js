const express = require('express');
const https = require('https');
const path = require('path');
const axios = require('axios');
const fs = require("fs");
const cors = require('cors');
const { log } = require('console');
const session = require('express-session');
const bodyParser = require('body-parser');

const MongoDBStore = require('connect-mongodb-session')(session);

const MongoDB = require('mongodb');
//const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;

const mongoURL = 'mongodb://127.0.0.1:27017/';

const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

// On utilise notre clé et certificat pour la connexion https
const options = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
};


const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3111;

// Variable store contenant notre DB
const store = new MongoDBStore({
	uri: "mongodb://127.0.0.1:27017/dbAdopteUnFilm",
	dbName: "dbAdopteUnFilm",
	collection: 'sessions',
	touchAfter: 24 * 3600,
});
	
store.on('error', (error) => {
  console.error('Erreur de connexion MongoDB Session Store :', error);
});
	

// On définit la session ici avec sa durée d'expiration
app.use(session({
    secret: 'yoan',
    resave: false,
    saveUninitialized: true,
	store: store,
	cookie: {maxAge: 24 * 3600 * 1000},
}));

// Définir le chemin vers le répertoire des fichiers statiques
const staticPath = path.join(__dirname, '..', 'AdopteUnFilm', 'dist', 'adopte-un-film','browser');

// Servir les fichiers statiques
app.use(express.static(staticPath));

// Définir la route par défaut pour servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

// Créer un serveur HTTPS sans certificat
const server = https.createServer(options, app);

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

  app.get('/login', async (req, res, next) => {
    const username = req.query.username;
    const password = req.query.password;

    try {
        const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const db = client.db("dbAdopteUnFilm");
        const usersCollection = db.collection('users');

        const passwordCrypted = sha1(password);
        console.log(passwordCrypted);

        const user = await usersCollection.findOne({ username: username, password: passwordCrypted });

        if (!user) {
            console.log("ERREUR ! L'utilisateur n'existe pas !");
            return res.status(401).json({ success: false, notification: "L'utilisateur n'existe pas !" });
        }

        /*const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("ERREUR ! Mauvais identifiant ou mot de passe !");
            return res.status(401).json({ success: false, notification: "Mauvais identifiant ou mot de passe !" });
        }*/

        // Mise à jour du statut de l'utilisateur si nécessaire
        // ...
        // Je laisse cette partie à adapter selon votre logique d'application

        // Réussite de la connexion
        //req.session.isConnected = true;
        req.session.username = user.username;
        req.session.notification = 'Connexion réussie !';
        //req.session.avatar = user.avatar;
        //req.session.prenom = user.prenom;
        //req.session.nom = user.nom;
        //req.session.lastConnexion = new Date().toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

        res.json({
            success: true,
            username: user.username,
            prenom: user.prenom,
            nom: user.nom,
            notification: 'Connexion réussie !'
        });

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la connexion' });
    }
});

app.get('/check-notification', (req, res) => {

    if (req.session && req.session.notification) {
        res.status(200).json({ notification: req.session.notification });
    } else {
        res.status(200).json({ notification: '' });
    }
});


app.get('/logout', (req, res) => {
    // Effacer les données de session
    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur lors de la déconnexion:', err);
            return res.status(500).json({ success: false, error: 'Erreur lors de la déconnexion' });
        }
        console.log('Déconnexion réussie');
        return res.json({ success: true, notification: 'Déconnexion réussie' });
    });
});

app.get('/like', async (req, res, next) => {
    const likedID = req.query.likedID;
    const username = req.session.username;

    try {
        const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const db = client.db("dbAdopteUnFilm");
        const usersCollection = db.collection('users');

        // Mettre à jour le champ idRecommandation de l'utilisateur avec likedID
        await usersCollection.updateOne(
            { username: username },
            { $set: { idRecommandation: parseInt(likedID) } }
        );

        res.json({ success: true, notification: 'Like enregistré avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement du like:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de l\'enregistrement du like' });
    }
});

  app.get('/:id/recommendations', async (req, res) => {
    try {
        const apiKey = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
        const language = 'fr-FR';
        const movieId = req.params.id;

        const randomPage = Math.floor(Math.random() * 2) + 1;


        const url = 'https://api.themoviedb.org/3/movie/'+movieId+'/recommendations?language='+language+'&page='+randomPage+'&api_key='+apiKey;

        const response = await axios.get(url);
        const recommendations = response.data.results;

        const randomIndex = Math.floor(Math.random() * recommendations.length);
        const randomFilm = recommendations[0];

        const { title, poster_path, id, overview } = randomFilm;

        res.json({ title, poster_path, id, overview });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des recommandations' });
    }
});

app.get('/getLikedId', async (req, res, next) => {
    const username = req.session.username;

    try {
        const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const db = client.db("dbAdopteUnFilm");
        const usersCollection = db.collection('users');

        // Recherche de l'utilisateur dans la collection
        const user = await usersCollection.findOne({ username });

        if (!user) {
            console.log("Erreur: L'utilisateur n'existe pas !");
            return res.status(401).json({ success: false, notification: "L'utilisateur n'existe pas !" });
        }

        // Récupération du likedId de l'utilisateur
        const likedId = user.idRecommandation;

        res.json(likedId);
    } catch (error) {
        console.error('Erreur lors de la récupération du likedId:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la récupération du likedId' });
    }
});

app.get('/getInfos', async (req, res, next) => {
    const username = req.session.username; // Supposons que vous stockiez le nom d'utilisateur dans la session

    try {
        const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const db = client.db("dbAdopteUnFilm");
        const usersCollection = db.collection('users');

        // Recherche de l'utilisateur dans la collection
        const user = await usersCollection.findOne({ username });

        if (!user) {
            console.log("Erreur: L'utilisateur n'existe pas !");
            return res.status(401).json({ success: false, notification: "L'utilisateur n'existe pas !" });
        }

        // Récupération des informations utilisateur
        const userInfo = {
            prenom: user.prenom,
            nom: user.nom,
            username: user.username,
            idRecommendation: user.idRecommandation
        };

        res.json({ user: userInfo });
    } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de la récupération des informations utilisateur' });
    }
});

const sha1 = require('sha1');

app.get('/inscription', async (req, res, next) => {
    const { prenom, nom, username, password } = req.query;

    try {

        const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const db = client.db("dbAdopteUnFilm");
        const usersCollection = db.collection('users');

        // Trouver le plus gros _id dans la collection des utilisateurs
        const maxIdUser = await usersCollection.findOne({}, { sort: { _id: -1 } });

        // Calculer le nouvel ID de l'utilisateur
        const newUserId = maxIdUser ? maxIdUser._id + 1 : 1;

        // Hasher le mot de passe avec SHA1
        const hashedPassword = sha1(password);

        // Créer un nouvel utilisateur
        const newUser = {
            _id: newUserId,
            username: username,
            password: hashedPassword,
            prenom,
            nom,
            idRecommandation: 0
        };

        // Ajouter l'utilisateur à la base de données
        await usersCollection.insertOne(newUser);

        res.json({ success: true, message: "Utilisateur inscrit avec succès." });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ success: false, error: 'Erreur lors de l\'inscription.' });
    }
});


