// piano-form.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Piano } from '../../../1-Servicios/piano.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonIcon,
  IonRow,
  IonCol,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline, addOutline } from 'ionicons/icons';

@Component({
  selector: 'app-piano-form',
  templateUrl: './piano-form.component.html',
  styleUrls: ['./piano-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonIcon,
    IonRow,
    IonCol
  ]
})
export class PianoFormComponent implements OnInit {
  @Input() isEdit: boolean = false;
  @Input() piano: Piano = {
    id: 0,
    name: '',
    model: '',
    price: '',
    image: 'assets/piano1.jpg',
    rentOption: '',
    description: '',
    specifications: [],
    features: []
  };

  // Listas seguras para gestionar características y especificaciones
  featuresList: string[] = [];
  specificationsList: {name: string, value: string}[] = [];

  constructor(private modalController: ModalController) {

  }

  ngOnInit() {
    // Inicializar arrays y copiarlos a las variables seguras
    if (this.piano.specifications) {
      this.specificationsList = [...this.piano.specifications];
    } else {
      this.specificationsList = [];
      this.piano.specifications = [];
    }

    if (this.piano.features) {
      this.featuresList = [...this.piano.features];
    } else {
      this.featuresList = [];
      this.piano.features = [];
    }
  }

  // Métodos para sincronizar los cambios
  syncSpecifications() {
    this.piano.specifications = [...this.specificationsList];
  }

  syncFeatures() {
    this.piano.features = [...this.featuresList];
  }

  addSpecification() {
    this.specificationsList.push({ name: '', value: '' });
    this.syncSpecifications();
  }

  removeSpecification(index: number) {
    if (index >= 0 && index < this.specificationsList.length) {
      this.specificationsList.splice(index, 1);
      this.syncSpecifications();
    }
  }

  addFeature() {
    this.featuresList.push('');
    this.syncFeatures();
  }

  removeFeature(index: number) {
    if (index >= 0 && index < this.featuresList.length) {
      this.featuresList.splice(index, 1);
      this.syncFeatures();
    }
  }

  dismiss(data?: any) {
    this.modalController.dismiss(data);
  }

  onSubmit() {
    // Limpiar especificaciones y características vacías
    this.specificationsList = this.specificationsList.filter(spec =>
      spec.name.trim() !== '' && spec.value.trim() !== '');
    this.syncSpecifications();

    this.featuresList = this.featuresList.filter(feature =>
      feature.trim() !== '');
    this.syncFeatures();

    this.dismiss(this.piano);
  }

  cancel() {
    this.dismiss();
  }

  updateFeature(index: number, event: any): void {
    this.featuresList[index] = event.detail.value;
  }
}
