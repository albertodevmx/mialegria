import { Component, ViewChild, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';

import { Header } from './../../../shared/components/header/header';
import { Footer } from './../../../shared/components/footer/footer';
import { SidebarMenu } from '../../../shared/components/sidebar-menu/sidebar-menu';
import { BranchesStore } from '../../../stores/branches.store';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    Footer,
    SidebarMenu,
    MatSidenavModule,
    MatIconModule
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  store = inject(BranchesStore);

  @ViewChild('sidenav', { static: true }) sidenav!: MatSidenav;
  @ViewChild(SidebarMenu) sidebarMenu?: SidebarMenu;

  constructor() {
    effect(() => {
      const open = this.store.isSidebarOpen();
      if (!this.sidenav) return;

      open ? this.sidenav.open() : this.sidenav.close();
    });
  }

  onSidenavClosed() {
    this.sidebarMenu?.resetState();
    this.store.closeSidebar();
  }
}
