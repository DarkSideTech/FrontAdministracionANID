// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  activeLogInformation: false,
  apiUrl: 'http://localhost:5002/api',
  clientIdClaveUnica: '111222333444555666777888999000',
  redirecUriClaveUnica: 'http://localhost:4210/#/authentication/callback-clave-unica',
  uriLogoutClaveUnica: 'http://localhost:4210/#/authentication/signin',
  baseUrl: 'http://localhost:4210/',
  claveUnicaUrl: 'https://accounts.claveunica.gob.cl/openid/authorize/?',
  claveUnicaLogoutUrl: 'https://accounts.claveunica.gob.cl/api/v1/accounts/app/logout',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
