import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommunicationService } from '../communication.service';
import { CommonModule } from '@angular/common';

interface UserInfo {
  prenom: string;
  nom: string;
  username: string;
  idRecommendation: number;
}

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})
export class UserInfoComponent implements OnInit {

  userInfo: UserInfo | null = null;
  posterPath: string | null = null;

  @Input() showUserInfo: boolean | undefined;

  constructor(private http: HttpClient, private communicationService: CommunicationService) { }

  ngOnInit() {
      if(this.showUserInfo){
        this.fetchInfo();
      }
  }

  fetchInfo(): void {
    this.http.get<any>('/getInfos').subscribe(
      (response: any) => {
        this.userInfo = {
          prenom: response.user.prenom,
          nom: response.user.nom,
          username: response.user.username,
          idRecommendation: response.user.idRecommendation
        };
        
        // Récupération du posterPath
        const movieId = this.userInfo.idRecommendation;
        this.http.get<any>(`https://api.themoviedb.org/3/movie/${movieId}?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb`)
          .subscribe((movieResponse: any) => {
            this.posterPath = `https://image.tmdb.org/t/p/w500/${movieResponse.poster_path}`;
          });
      },
      error => {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
      }
    );
  }

}
