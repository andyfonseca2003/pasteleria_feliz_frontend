import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes),
    provideHttpClient(
      withFetch()    // <<-- aquí habilitas fetch en vez de XHR
    ),
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
