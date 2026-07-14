import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'backend-core',
  }),
  traceExporter: process.env.NODE_ENV === 'production'
    ? new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://172.18.0.1:4318/v1/traces',
      })
    : undefined, // Disabled in dev to avoid flooding the console
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

if (process.env.OTEL_SDK_DISABLED === 'true') {
  console.log('[Telemetry] OpenTelemetry SDK is disabled via OTEL_SDK_DISABLED=true');
} else {
  sdk.start();
  console.log('[Telemetry] OpenTelemetry SDK started, sending to:', process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
}