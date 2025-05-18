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

    this.sesionService.login({email: credentials.username, contrasena: credentials.password}).subscribe({
      next: (data: any) => {
        console.log('Login exitoso', data);

        // Guardar datos de autenticación
        this.authService.setAuthData(data);


        // Navigate to return url or profile
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/perfil';
        this.router.navigate([this.returnUrl]);
      },
      error: (error: any) => {
        console.error('Error en el login', error);
        alert('Error al iniciar sesión. Verifique sus credenciales.');
      },
      complete: () => {
        console.log('Petición de login completada');
      }
    });
  }
}
