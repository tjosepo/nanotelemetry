

import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const configDefaults = {
  ignoreNetworkEvents: true,
  // propagateTraceHeaderCorsUrls: [
  // /.+/g, // Regex to match your backend URLs. Update to the domains you wish to include.
  // ]
}

const sdk = new HoneycombWebSDK({
  endpoint: "https://api.eu1.honeycomb.io/v1/tracesssss", // Send to EU instance of Honeycomb. Defaults to sending to US instance.
  debug: true, // Set to false for production environment.
  apiKey: 'bMQrTbM6Jezm7knh9p24rG', // Replace with your Honeycomb Ingest API Key.
  serviceName: 'web2', // Replace with your application name. Honeycomb uses this string to find your dataset when we receive your data. When no matching dataset exists, we create a new one with this name if your API Key has the appropriate permissions.
  instrumentations: [getWebAutoInstrumentations({
    // Loads custom configuration for xml-http-request instrumentation.
    '@opentelemetry/instrumentation-xml-http-request': configDefaults,
    '@opentelemetry/instrumentation-fetch': configDefaults,
    '@opentelemetry/instrumentation-document-load': configDefaults,
  })],
});
sdk.start();