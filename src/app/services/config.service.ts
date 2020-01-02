import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { env } from '../../environments/environment';
import { text } from '../config/text';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor(private apiService: ApiService) { }
  setConfig(): any {


  }
}
