// home.page.ts
import { Component } from '@angular/core';
import {
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { NgClass, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { Router } from '@angular/router';
import { PianoService, Piano } from '../1-Servicios/piano.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonContent,
    NgClass, NgOptimizedImage, NgForOf, IonButton, IonGrid, IonRow, IonCol, NgIf
  ],
})
export class HomePage {
  slides = [
    { image: 'assets/piano1.jpeg', title: 'Steinway Limited Edition', description: 'Nuevo Steinway & Sons Noé' },
    { image: 'assets/piano2.jpg', title: 'Exclusivo Modelo', description: 'El Arte del Sonido' },
    { image: 'assets/piano3.jpg', title: 'Diseño Único', description: 'Un Piano de Lujo' }
  ];

  pianos: Piano[] = [];
  currentSlide = 0;
  interval: any;

  constructor(
    private router: Router,
    private pianoService: PianoService
  ) {}

  ngOnInit() {
    // Cargar los pianos desde el servicio
    this.pianos = this.pianoService.getAllPianos();

    // Iniciar autoplay
    this.startAutoplay();
  }

  startAutoplay() {
    this.interval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Cambia cada 5 segundos
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  navigateToProduct(id: number) {
    // Navegar al componente producto con el ID del piano
    this.router.navigate(['/producto', id]);
  }

  ngOnDestroy() {
    clearInterval(this.interval); // Limpiar el intervalo cuando el componente se destruya
  }
}
