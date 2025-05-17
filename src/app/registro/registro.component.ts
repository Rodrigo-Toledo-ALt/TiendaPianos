import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../1-Servicios/auth.service';
import { SesionService } from '../1-Servicios/sesion.service';
import { NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgIf
  ]
})
export class RegistroComponent implements OnInit {
  registroForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private sesionService: SesionService
  ) {
    this.registroForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Redirigir si ya está autenticado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  // Validador personalizado para verificar que las contraseñas coincidan
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      return null;
    }
  }

  // Getter para acceder fácilmente a los campos del formulario
  get f() { return this.registroForm.controls; }

  onSubmit(): void {
    // Detener si el formulario no es válido
    if (this.registroForm.invalid) {
      return;
    }

    const usuarioNuevo = {
      nombre: this.f['nombre'].value,
      email: this.f['email'].value,
      password: this.f['password'].value
    };

    this.sesionService.registro({nombre: usuarioNuevo.nombre, email: usuarioNuevo.email, contrasena: usuarioNuevo.password}).subscribe({
      next: (data: any) => {
        console.log('Registro exitoso', data);
        this.successMessage = 'Cuenta creada con éxito. Redirigiendo al inicio de sesión...';

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: any) => {
        console.error('Error en el registro', error);
        this.errorMessage = 'Error al crear la cuenta. Por favor, inténtelo de nuevo.';
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
