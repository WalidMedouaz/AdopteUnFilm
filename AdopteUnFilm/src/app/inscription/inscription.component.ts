import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent {
  username: string | undefined;
  password: string | undefined;
  prenom: string | undefined;
  nom: string | undefined;

  @Output() inscriptionComplete = new EventEmitter<void>();

  constructor(private http: HttpClient) {}

  onSubmit(): void {
    console.log("login identifiants: ", this.prenom, " et ", this.nom, " et ", this.username, " et ", this.password);

    if (this.prenom == undefined || this.nom == undefined || this.username == undefined || this.password == undefined) {
      alert('Veuillez remplir tous les champs.');
    } else {
      this.http.get<any>(`/inscription?prenom=${this.prenom}&nom=${this.nom}&username=${this.username}&password=${this.password}`)
      .subscribe(
        response => {
          if (response.success) {
            alert(response.message);
            this.inscriptionComplete.emit();
          }
        },
        (error) => {
          console.error('Erreur lors de l\'inscription:', error); // Gérer les erreurs d'inscription
        }
      );
    }
  }
}
