import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AuthGuard } from './services/auth-guard.service';
import { SystemErrorComponent } from './system-error/system-error.component';
import { DialogErrorComponent } from './dialog-error/dialog-error.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'system-error/:code',
    component: SystemErrorComponent,
  },
  {
    path: 'error',
    component: DialogErrorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
