import { HttpClientModule, provideHttpClient } from "@angular/common/http";
import { enableProdMode, importProvidersFrom } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";

import { AppComponent } from "./app/app.component";
import { FilmsComponent } from "./app/films/films.component";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { CommonModule } from '@angular/common';


bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()],
}).catch((err) => console.error(err));


/*platformBrowserDynamic().bootstrapModule(CommonModule)
  .catch(err => console.error(err));*/

 /* platformBrowserDynamic().bootstrapModule(HttpClientModule)
  .catch(err => console.error(err));*/