import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const runtimeConfigPath = resolve(repositoryRoot, 'src/assets/runtime-config.js');

const applicationOrigin = normalizeApplicationOrigin(requiredEnvironment('PUBLIC_APP_ORIGIN'));
const clientId = requiredEnvironment('CLAVEUNICA_CLIENT_ID');
const authorizationUrl = normalizeHttpsUrl(
  process.env.CLAVEUNICA_AUTHORIZATION_URL ?? 'https://accounts.claveunica.gob.cl/openid/authorize/',
  'CLAVEUNICA_AUTHORIZATION_URL',
);
const logoutUrl = normalizeHttpsUrl(
  process.env.CLAVEUNICA_LOGOUT_URL ?? 'https://accounts.claveunica.gob.cl/api/v1/accounts/app/logout',
  'CLAVEUNICA_LOGOUT_URL',
);

const originalRuntimeConfig = await readFile(runtimeConfigPath, 'utf8');
const sandboxRuntimeConfig = `window.__AUT2_CONFIG__ = Object.freeze(${JSON.stringify({
  apiBaseUrl: '',
  claveUnica: {
    clientId,
    redirectUri: `${applicationOrigin}/authentication/callback-clave-unica`,
    logoutRedirectUri: `${applicationOrigin}/authentication/signin`,
    authorizationUrl,
    logoutUrl,
  },
}, null, 2)});\n`;

await writeFile(runtimeConfigPath, sandboxRuntimeConfig, 'utf8');

try {
  await run(process.execPath, ['./node_modules/@angular/cli/bin/ng.js', 'build', '--configuration=sandbox']);
} finally {
  await writeFile(runtimeConfigPath, originalRuntimeConfig, 'utf8');
}

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} debe estar configurada para compilar el sandbox.`);
  }

  return value;
}

function normalizeApplicationOrigin(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('PUBLIC_APP_ORIGIN debe ser un origen HTTPS sin ruta, consulta ni fragmento.');
  }

  return url.origin;
}

function normalizeHttpsUrl(value, variableName) {
  const url = new URL(value);
  if (url.protocol !== 'https:') {
    throw new Error(`${variableName} debe usar HTTPS.`);
  }

  return url.toString();
}

function run(command, argumentsList) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, argumentsList, {
      cwd: repositoryRoot,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', (exitCode) => {
      if (exitCode === 0) {
        resolvePromise();
        return;
      }

      reject(new Error(`${command} termino con codigo ${exitCode ?? 'desconocido'}.`));
    });
  });
}
