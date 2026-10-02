// Test della regola sentry-no-pii-collection: userInfo porta IP e utente,
// httpHeaders porta X-Forwarded-For e il segreto x-origin-verify del Worker.

export const conPii = {
  dataCollection: {
    // ruleid: sentry-no-pii-collection
    userInfo: true,
    // ruleid: sentry-no-pii-collection
    httpHeaders: true,
    cookies: false,
  },
};

export const vecchiaOpzione = {
  // ruleid: sentry-no-pii-collection
  sendDefaultPii: true,
};

export const senzaPii = {
  dataCollection: {
    // ok: sentry-no-pii-collection
    userInfo: false,
    // ok: sentry-no-pii-collection
    httpHeaders: false,
    // ok: sentry-no-pii-collection
    cookies: true,
  },
};
