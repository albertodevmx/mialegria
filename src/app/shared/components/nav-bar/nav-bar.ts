
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true, // IMPORTANTE
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterModule
  ],
  templateUrl: './nav-bar.html',
  styleUrls: ['./nav-bar.scss'], // en plural
})
export class NavBar { }
