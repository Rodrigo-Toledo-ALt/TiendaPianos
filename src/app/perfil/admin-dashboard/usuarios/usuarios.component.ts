import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UsuarioService } from '../../../1-Servicios/usuario.service';
import { UsuarioDTO } from '../../../1-Servicios/models';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioDTO[] = [];
  cargando = false;
  error = '';

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.error = '';
    
    this.usuarioService.obtenerTodosLosUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios';
        this.cargando = false;
        console.error('Error al cargar usuarios', err);
      }
    });
  }
}