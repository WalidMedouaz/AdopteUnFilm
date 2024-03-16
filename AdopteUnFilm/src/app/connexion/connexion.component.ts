import { Component } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConnexionService } from '../connexion.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './connexion.component.html',
  styleUrl: './connexion.component.css'
})
export class ConnexionComponent {
  username: string | undefined;
  password: string | undefined;

  @Input()
  notification: string = '';

  constructor(private http: HttpClient, private connexionService: ConnexionService) { }

  connexion(): void {
    this.http.get<any>(`/login?username=${this.username}&password=${this.password}`)
      .subscribe(
        response => {
          if (response.success) {
            // Connexion réussie, mettre à jour la notification via le service
            this.notification = response.notification;
            this.connexionService.updateNotification(response.notification);
            this.connexionService.setEstConnecte(true);
            console.log("USERNAME: ", response.username);
            localStorage.setItem('username', response.username);

          } else {
            // Connexion échouée, ne rien faire ou gérer selon vos besoins
          }
        },
        error => {
          console.error('Erreur lors de la connexion:', error);
          // Gérer l'erreur ici, par exemple afficher un message d'erreur à l'utilisateur
        }
      );
  }
}




