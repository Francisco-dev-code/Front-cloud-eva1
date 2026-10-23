import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistroComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private returnUrl = '/inicio';

  ngOnInit(): void {
    const solicitado = this.route.snapshot.queryParamMap.get('returnUrl');
    if (this.auth.esRutaInterna(solicitado) && !solicitado.startsWith('/registro')) {
      this.returnUrl = solicitado;
    }

    // Si ya tiene sesión, no tiene sentido mostrar esta pantalla.
    if (this.auth.isAuthenticated) {
      void this.router.navigateByUrl(this.returnUrl);
    }
  }

  protected registrarse(): void {
    this.auth.registrarse(this.returnUrl);
  }

  protected iniciarSesion(): void {
    this.auth.login(this.returnUrl);
  }
}
