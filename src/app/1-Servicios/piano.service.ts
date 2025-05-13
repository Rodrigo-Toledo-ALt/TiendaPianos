// piano.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Piano {
  id: number;
  image: string;
  name: string;
  model: string;
  price: string;
  rentOption?: string;
  description?: string;
  specifications?: { name: string; value: string }[];
  features?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PianoService {
  // Datos de pianos con información completa
  private pianosData: Piano[] = [
    {
      id: 1,
      image: 'assets/K-132_CHROME_BLANCO.png',
      name: 'STEINWAY & SONS',
      model: 'K-132 CHROME BLANCO',
      price: '39.325',
      rentOption: '464',
      description: 'Piano vertical profesional de la prestigiosa marca Steinway & Sons, acabado en cromo blanco. Este elegante instrumento ofrece un sonido excepcional y una presencia visual imponente en cualquier espacio.',
      specifications: [
        { name: 'Altura', value: '132 cm' },
        { name: 'Ancho', value: '155 cm' },
        { name: 'Profundidad', value: '67 cm' },
        { name: 'Peso', value: '280 kg' },
        { name: 'Acabado', value: 'Cromo Blanco' },
        { name: 'Pedales', value: '3' }
      ],
      features: [
        'Mueble diseñado por aclamados diseñadores',
        'Teclas de marfil premium',
        'Sistema de resonancia avanzado',
        'Cuerdas importadas de Alemania',
        'Garantía de 10 años'
      ]
    },
    {
      id: 2,
      image: 'assets/GP-193_PE II.jpg',
      name: 'BOSTON',
      model: 'GP-193 PE II',
      price: '39.325',
      rentOption: '464',
      description: 'Piano de cola elegante de la marca Boston, con un sonido excepcional y acabado premium. Ideal para salas de concierto y espacios amplios donde se aprecie la calidad del sonido.',
      specifications: [
        { name: 'Longitud', value: '193 cm' },
        { name: 'Ancho', value: '152 cm' },
        { name: 'Altura', value: '102 cm' },
        { name: 'Peso', value: '345 kg' },
        { name: 'Acabado', value: 'Negro Pulido' },
        { name: 'Pedales', value: '3' }
      ],
      features: [
        'Diseño de cola tradicional',
        'Tapa superior con soporte ajustable',
        'Teclas de marfil sintético de alta calidad',
        'Sistema de regulación de precisión',
        'Mecanismo de alta sensibilidad',
        'Garantía de fabricante de 12 años'
      ]
    },
    {
      id: 3,
      image: 'assets/Spiro.png',
      name: 'STEINWAY & SONS',
      model: 'Spiro',
      price: '390.325',
      rentOption: '4604',
      description: 'El revolucionario Steinway Spirio es el piano de alta resolución que reproduce con precisión las interpretaciones de los pianistas más destacados del mundo. Una combinación perfecta de artesanía tradicional y tecnología innovadora.',
      specifications: [
        { name: 'Tipo', value: 'Piano de Cola' },
        { name: 'Longitud', value: '227 cm' },
        { name: 'Ancho', value: '156 cm' },
        { name: 'Sistema', value: 'Spirio' },
        { name: 'Acabado', value: 'Negro Pulido' },
        { name: 'Conectividad', value: 'Bluetooth y Wi-Fi' }
      ],
      features: [
        'Sistema Spirio de reproducción de alta resolución',
        'Biblioteca de música integrada',
        'Aplicación móvil para control remoto',
        'Actualizaciones de repertorio periódicas',
        'Grabación de interpretaciones en tiempo real',
        'Artesanía Steinway tradicional'
      ]
    },
    {
      id: 4,
      image: 'assets/steinway-sons-b211-spirio-r-masterpiece-8x8-macassar-3.jpg',
      name: 'STEINWAY & SONS',
      model: 'B-211 8x8',
      price: '39.325',
      rentOption: '464',
      description: 'El Steinway B-211 8x8 es una pieza excepcional con un diseño único de chapa de ébano de Macassar. Este piano de cola combina la tradición acústica de Steinway con un diseño contemporáneo de edición limitada.',
      specifications: [
        { name: 'Longitud', value: '211 cm' },
        { name: 'Ancho', value: '148 cm' },
        { name: 'Modelo', value: 'B-211' },
        { name: 'Edición', value: '8x8 Masterpiece' },
        { name: 'Acabado', value: 'Macassar' },
        { name: 'Mecanismo', value: 'Estándar Steinway' }
      ],
      features: [
        'Diseño exclusivo de edición limitada',
        'Madera de ébano de Macassar de alta calidad',
        'Construcción artesanal de precisión',
        'Sonido característico Steinway',
        'Certificado de autenticidad incluido',
        'Garantía extendida de 15 años'
      ]
    }
  ];

  // BehaviorSubject para compartir datos entre componentes
  private selectedPianoSource = new BehaviorSubject<Piano | null>(null);
  selectedPiano$ = this.selectedPianoSource.asObservable();

  constructor() {}

  // Métodos para acceder a los datos
  getAllPianos(): Piano[] {
    return this.pianosData;
  }

  getPianoById(id: number): Piano | undefined {
    return this.pianosData.find(piano => piano.id === id);
  }

  setSelectedPiano(piano: Piano): void {
    this.selectedPianoSource.next(piano);
  }
}
