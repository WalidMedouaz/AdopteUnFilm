import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, Input, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import axios from 'axios';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ConnexionService } from '../connexion.service';
import { FilmService } from '../film.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommunicationService } from '../communication.service';

interface Film {
  id: number;
  title: string;
  posterPath: string;
  youtubeKey: string;
  overview: string;
}


@Component({
  selector: 'app-films',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './films.component.html',
  styleUrl: './films.component.css'
})
export class FilmsComponent implements OnInit {

  @Input() username: string |null = '';

  @Input() isConnected: boolean = false;
  @Input() showSwiper: boolean = false;
  @Input() notification = '';

  films: Film[] = [];
  title = '';

  currentTitle: string = '';
  currentOverview: string = '';
  //currentID: number = 0;

  posterPath: any;
  overview: string = '';
  showVideoPlayer: boolean = false;
  videoUrl: SafeResourceUrl | undefined;
  showVideoAndResume: boolean = false;
  youtubeKey: string = '';

  liked: boolean = false;

  likedID: number = 0;

  dynamicUrl: SafeResourceUrl | undefined;
  videoUrlUnsafe: string = '';
  isFirstGeneration: boolean = true;
  firstTimeConnected: boolean = false;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer, private connexionService: ConnexionService, private filmService: FilmService) {}


  ngOnInit() {


    this.connexionService.notification$.subscribe(notification => {
      this.notification = notification;
      if (notification.includes('Connexion réussie !')) {
        this.connexionService.estConnecte.subscribe(etaitPasConnecte => {
          if (etaitPasConnecte) {
            this.firstTimeConnected = true;
          }
        });

        const filmsContainer = document.getElementById('filmsContainer');
        if (filmsContainer) {
          filmsContainer.style.opacity = '100'; // Définition de la couleur de fond de filmsContainer à rouge
          filmsContainer.style.pointerEvents = 'visible';
        }
        this.getLikedId().then(() => {
          this.fetchFilms();
          this.films[0].posterPath = "";
          this.films[0].title = "";
          this.films[0].youtubeKey = "";

          this.films[1].posterPath = "";
          this.films[1].title = "";
          this.films[1].youtubeKey = "";
          
          this.films[2].posterPath = "";
          this.films[2].title = "";
          this.films[2].youtubeKey = "";

          this.films[3].posterPath = "";
          this.films[3].title = "";
          this.films[3].youtubeKey = "";
        });
      } else{
        const filmsContainer = document.getElementById('filmsContainer');
        if (filmsContainer) {
          filmsContainer.style.opacity = '0'; // Définition de la couleur de fond de filmsContainer à rouge
          filmsContainer.style.pointerEvents = 'none';
        }
      }
    });
  }

  async getLikedId() {
    try {
      const likedIdResponse: number | undefined = await this.http.get<number>('/getLikedId').toPromise();
      if (likedIdResponse !== undefined) {
        this.likedID = likedIdResponse;
      } else {
        console.log("L'utilisateur n'a encore rien liké !");
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de likedId:', error);
    }
  }

  // Fonction pour afficher le conteneur YouTube avec la vidéo correspondante
  showYoutube(videoId: string, title: string, overview: string) {

      const youtubeContainer = document.getElementById('youtubeContainer');
      const youtubeIframe = document.getElementById('youtubeIframe') as HTMLIFrameElement;
      const swiperContainer = document.querySelector('.Slider-container');

      if (youtubeContainer && youtubeIframe && swiperContainer) {
          swiperContainer.classList.add('hide-scroll'); // Ajoutez une classe pour désactiver le défilement du conteneur swiper

          if (youtubeContainer.classList.contains('show')) {
              this.hideYoutube();
          } else {
              this.currentTitle = title;
              this.currentOverview = overview;
              youtubeContainer.classList.add('show');
              youtubeIframe.src = `https://www.youtube.com/embed/${videoId}`;
          }
      }
  }

  hideYoutube() {
      const youtubeContainer = document.getElementById('youtubeContainer');
      const swiperContainer = document.querySelector('.Slider-container');

      if (youtubeContainer && swiperContainer) {
          youtubeContainer.classList.remove('show');
          swiperContainer.classList.remove('hide-scroll'); // Retirez la classe pour réactiver le défilement du conteneur swiper
      }
  }


  fetchFilms() {
    let url = '/films'; // URL par défaut
  
    // Si c'est la première génération et il y a un likedID, utiliser la partie recommendations
    if (this.isFirstGeneration || this.liked || this.firstTimeConnected && this.likedID) {
      if(this.likedID != 0){
        this.firstTimeConnected = false;
        this.connexionService.setEstConnecte(false);
        console.log("CAS D'UN RELOAD DE PAGE OU PREMIER ARRIVAGE ET RECUPERATION PAR RAPPORT AU DERNIER likedID: ", this.likedID)
        url = `/${this.likedID}/recommendations`;
      }
    }

    this.isFirstGeneration = false;
  
    // Récupérer les films à partir de l'URL appropriée
    axios.get<any>(url)
      .then(response => {
        const data = response.data;
        if (data) {
          // Prendre le premier film de la réponse
          const film = Array.isArray(data) ? data[0] : data;
  
          if (film) {
            const { title, poster_path, id, overview } = film;
            if (poster_path) { // Vérifier si poster_path est défini
              this.title = title;
              this.posterPath = poster_path;
  
              // Appel de fetchVideos() pour récupérer la clé YouTube
              this.fetchVideos(film).then(() => {
                // Ajouter le nouveau film au début du tableau
                const newFilm = { id, posterPath: poster_path, youtubeKey: this.youtubeKey, title: title, overview: overview };
                if (newFilm.posterPath) { // Vérifier si posterPath est défini
                  this.films.unshift(newFilm);
                } else {
                  console.error('Error: posterPath is undefined for film:', film);
                }
  
                // Si le tableau a plus de 4 éléments, supprimer le dernier film
                if (this.films.length > 4) {
                  this.films.pop();
                }
              });
            } else {
              console.error('Error: poster_path is undefined for film:', film);
            }
          }
        }
      })
      .catch(error => {
        console.error('Error fetching films:', error);
      });
  }
  
  
  

  like(id: number) {
    this.liked = true;
    this.likedID = id;
    this.fetchFilms(); // Rafraîchir la liste des films après avoir aimé

    // Appeler la route "like" sur le serveur
    this.http.get<any>('/like', { params: { likedID: this.likedID.toString() } })
        .subscribe(
            response => {
                if (response.success) {
                    console.log('Like enregistré avec succès.');
                } else {
                    console.error('Échec de l\'enregistrement du like:', response.error);
                }
            },
            error => {
                console.error('Erreur lors de l\'enregistrement du like:', error);
            }
        );
  }

  dislike(){
    this.liked = false;

    this.fetchFilms();
  }

// Méthode pour récupérer les vidéos et leur résumé
  async fetchVideos(film: any): Promise<void> {
    const id = film.id;

    // Récupérer les vidéos du film à partir de l'API
    try {
    const videoResponse = await axios.get<any>(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&language=en-US`);
    const videos = videoResponse.data.results;
    if (videos && videos.length > 0) {
      const teaserVideo = videos.find((video: any) => video.type === 'Teaser');
      if (teaserVideo) {
        this.youtubeKey = teaserVideo.key;
        this.videoUrlUnsafe = `https://www.youtube.com/embed/${this.youtubeKey}`;
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrlUnsafe);
        this.fetchOverview(film);
      } else {
        const anyVideo = videos[0];
        this.youtubeKey = anyVideo.key;
        this.videoUrlUnsafe = `https://www.youtube.com/embed/${this.youtubeKey}`;
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrlUnsafe);
        console.log("Aucune vidéo de type teaser disponible. Utilisation d'une autre vidéo.");
        this.fetchOverview(film);
      }
    } else {
      console.log("Aucune vidéo disponible pour ce film.");
    }
  } catch (videoError) {
    console.error('Erreur lors de la récupération des vidéos:', videoError);
  }
}


  fetchOverview(film: any) {
    const overview = film.overview;
    this.overview = overview;
  }

  toggleVideoAndResume() {
    this.showVideoPlayer = !this.showVideoPlayer;
    this.showVideoAndResume = !this.showVideoAndResume;
  }

}
