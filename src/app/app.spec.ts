import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { UserService } from './services/user-service';
import { AlertService } from './services/alert-service';

/**
 * O ngOnInit do App espera uma chamada HTTP e só então abre um snackbar.
 *
 * Com o UserService real, essa promessa resolvia depois que o TestBed já
 * havia destruído o injector, e o MatSnackBar estourava NG0205. O erro
 * aparecia como falha de qualquer outro teste que estivesse rodando naquele
 * instante, o que tornava a suíte intermitente e enganosa.
 *
 * Os dois substitutos resolvem na hora e não tocam em HTTP nem em overlay.
 */
class UserServiceFalso {
  async getUser(): Promise<boolean> {
    return true;
  }
}

class AlertServiceFalso {
  message(): void {}
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter([]),
        { provide: UserService, useClass: UserServiceFalso },
        { provide: AlertService, useClass: AlertServiceFalso },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // o teste original vinha do template de exemplo do Angular CLI e procurava
  // "Hello, angular-testes", um texto que este app nunca teve
  it('deve montar a tela sem quebrar', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const tela = fixture.nativeElement as HTMLElement;

    expect(tela.querySelector('router-outlet')).toBeTruthy();
  });
});
