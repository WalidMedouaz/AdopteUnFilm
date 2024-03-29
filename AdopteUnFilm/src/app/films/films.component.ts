import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import axios from 'axios';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Film {
  id: number;
  posterPath: string;
}

@Component({
  selector: 'app-films',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './films.component.html',
  styleUrl: './films.component.css'
})
export class FilmsComponent implements OnInit {
  films: Film[] = [];
  title = '';
  posterPath: any;
  overview: string = '';
  showVideoPlayer: boolean = false;
  videoUrl: SafeResourceUrl | undefined;
  showVideoAndResume: boolean = false;

  dynamicUrl: SafeResourceUrl | undefined;
  videoUrlUnsafe: string = '';

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.fetchFilms();
  }

  // Méthode pour récupérer les films
  fetchFilms() {
    axios.get<any>('/films')
        .then(response => {
            const film = response.data;
            if (film) {
                const { title, poster_path, id, overview } = film;
                console.log('Title:', title);
                console.log('Poster Path:', poster_path);
                console.log('ID:', id);
                console.log('Overview:', overview);
                this.title = title;
                this.posterPath = poster_path;

                for (let i = this.films.length; i >= 0; i--) {
                  // Décaler chaque film vers la droite dans le tableau
                  this.films[i] = this.films[i - 1];
                }
                // Ajouter le nouveau film à la première position
                this.films[0] = { id, posterPath: poster_path };
                if (this.films.length > 4) {
                  this.films.pop(); // Supprimer le dernier film s'il y en a plus de 4
                }

                console.log(this.films);

                this.fetchVideos(film);
            }
        })
        .catch(error => {
            console.error('Error fetching films:', error);
        });
  }

  // Méthode pour récupérer les vidéos et leur résumé
  fetchVideos(film: any) {
    const id = film.id;

    // Récupérer les vidéos du film à partir de l'API
    axios.get<any>(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&language=en-US`)
    .then(videoResponse => {
        const videos = videoResponse.data.results;
        if (videos && videos.length > 0) {
            const teaserVideo = videos.find((video: any) => video.type === 'Teaser');
            if (teaserVideo) {
                const youtubeKey = teaserVideo.key;
                this.videoUrlUnsafe = `https://www.youtube.com/embed/${youtubeKey}`;
                this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrlUnsafe);
                this.fetchOverview(film);
            } else {
                const anyVideo = videos[0];
                const youtubeKey = anyVideo.key;
                this.videoUrlUnsafe = `https://www.youtube.com/embed/${youtubeKey}`;
                this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrlUnsafe);
                console.log("Aucune vidéo de type teaser disponible. Utilisation d'une autre vidéo.");
                this.fetchOverview(film);
            }
        } else {
            console.log("Aucune vidéo disponible pour ce film.");
        }
    })
    .catch(videoError => {
        console.error('Erreur lors de la récupération des vidéos:', videoError);
    });

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
