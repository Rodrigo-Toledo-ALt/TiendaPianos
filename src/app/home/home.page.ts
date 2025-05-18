// home.page.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  IonContent,
  IonButton,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { NgClass, NgForOf, NgIf, NgOptimizedImage, AsyncPipe } from "@angular/common";
import { Router } from '@angular/router';
import { PianoService, Piano } from '../1-Servicios/piano.service';
import { PianoDTO } from '../1-Servicios/models';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonContent,
    NgClass, NgOptimizedImage, NgForOf, IonButton, IonGrid, IonRow, IonCol, NgIf, AsyncPipe
  ],
})
export class HomePage implements OnInit, OnDestroy {
  slides = [
    { image: 'assets/piano1.jpeg', title: 'Steinway Limited Edition', description: 'Nuevo Steinway & Sons Noé' },
    { image: 'assets/piano2.jpg', title: 'Exclusivo Modelo', description: 'El Arte del Sonido' },
    { image: 'assets/piano3.jpg', title: 'Diseño Único', description: 'Un Piano de Lujo' }
  ];

  pianos: Piano[] = [];
  pianosSubscription: Subscription | null = null;
  cargando = true;
  error = '';
  currentSlide = 0;
  interval: any;

  constructor(
    private router: Router,
    private pianoService: PianoService
  ) {}

  ngOnInit() {
    // Cargar los pianos desde el backend
    this.cargando = true;
    this.pianosSubscription = this.pianoService.obtenerPianos().subscribe({
      next: (pianos: PianoDTO[]) => {
        // Convertir PianoDTO[] a Piano[] (formato antiguo)
        this.pianos = pianos.map(piano => ({
          id: piano.id,
          image: piano.imagen,
          name: piano.nombre,
          model: piano.modelo,
          price: piano.precio.toString(),
          rentOption: piano.opcionAlquiler?.toString(),
          description: piano.descripcion
        }));
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pianos', err);
        this.error = 'Error al cargar pianos. Por favor, intente nuevamente.';
        this.cargando = false;
      }
    });

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
    
    // Desuscribirse para prevenir memory leaks
    if (this.pianosSubscription) {
      this.pianosSubscription.unsubscribe();
    }
  }
}
