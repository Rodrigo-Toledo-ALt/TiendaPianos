import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../1-Servicios/auth.service';
import { SesionService } from '../1-Servicios/sesion.service';
import { NgIf } from "@angular/common";
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgIf,
    IonicModule
  ],
  standalone: true
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string = '/';
  isLoading: boolean = false;
  errorMessage: string = '';

  // Credenciales de prueba definidas como propiedades del componente
  testCredentials = {
    admin: {
      email: 'admin' + String.fromCharCode(64) + 'adaggio.com',
      password: 'password'
    },
    user: {
      email: 'user' + String.fromCharCode(64) + 'example.com',
      password: 'password'
    }
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private sesionService: SesionService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  // Getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    // Mostrar indicador de carga
    this.isLoading = true;
    this.errorMessage = '';  // Limpiar mensajes de error previos

    const credentials = {
      username: this.f['email'].value,
      password: this.f['password'].value
    };

    this.sesionService.login({email: credentials.username, contrasena: credentials.password}).subscribe({
      next: (data: any) => {
        console.log('Login exitoso', data);

        // Ocultar indicador de carga
        this.isLoading = false;

        // Guardar datos de autenticación
        this.authService.setAuthData(data);

        // Navigate to return url or profile
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/perfil';
        this.router.navigate([this.returnUrl]);
      },
      error: (error: any) => {
        console.error('Error en el login', error);

        // Ocultar indicador de carga
        this.isLoading = false;

        // Extraer mensaje de error del backend
        let errorMessage = 'Error al iniciar sesión. Verifique sus credenciales.';

        // Intentar obtener el mensaje específico del error
        if (error.error) {
          if (error.error.message) {
            // Si la API devuelve un objeto JSON con campo message
            errorMessage = error.error.message;
          } else if (typeof error.error === 'string') {
            // Si la API devuelve directamente un mensaje en texto
            errorMessage = error.error;
          }
        } else if (error.message) {
          // Si hay un mensaje en el objeto error principal
          errorMessage = error.message;
        } else if (error.status) {
          // Mensajes basados en códigos HTTP comunes
          switch (error.status) {
            case 401:
              errorMessage = 'Usuario o contraseña incorrectos.';
              break;
            case 403:
              errorMessage = 'Cuenta inactiva. Contacte al administrador.';
              break;
            case 500:
              errorMessage = 'Error en el servidor. Intente nuevamente más tarde.';
              break;
          }
        }

        // Mostrar el mensaje de error en la interfaz
        this.errorMessage = errorMessage;
      },
      complete: () => {
        console.log('Petición de login completada');
      }
    });
  }
}
