// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

import getSentryDSN from './sentryUtils'

Sentry.init({
    dsn: getSentryDSN(),
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.8,
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
})
