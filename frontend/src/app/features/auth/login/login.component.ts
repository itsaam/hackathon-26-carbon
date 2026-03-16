import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    email: [''],
    password: ['']
  });

  loading = false;
  errorMessage = '';

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    this.loading = true;
    this.errorMessage = '';

    this.authService
      .login({
        email: value.email ?? '',
        password: value.password ?? ''
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/sites']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.error?.message || 'Échec de la connexion';
        }
      });
  }
}

