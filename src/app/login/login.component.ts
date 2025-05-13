import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../1-Servicios/auth.service';
import { SesionService } from '../1-Servicios/sesion.service';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgIf
  ],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string = '/';

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

    const credentials = {
      username: this.f['email'].value,
      password: this.f['password'].value
    };

    this.sesionService.PostLogin(credentials).subscribe({
      next: (data) => {
        console.log('Login exitoso', data);

        // Save token in auth service
        this.authService.setToken(data.token, data.expiration);

        // Guardar datos del usuario basados en el email
        const isAdmin = credentials.username === this.testCredentials.admin.email;

        // Navigate to return url
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/perfil'
        this.router.navigate([this.returnUrl]);

        // Guardar información del usuario
        this.authService.setUserData({
          name: isAdmin ? 'Administrador' : 'Usuario',
          email: credentials.username,
          role: isAdmin ? 'admin' : 'user'
        });
      },
      error: (error) => {
        console.error('Error en el login', error);
        alert('Error al iniciar sesión. Verifique sus credenciales.');
      },
      complete: () => {
        console.log('Petición de login completada');
      }
    });
  }
}
