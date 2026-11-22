const {
  OTLPLogExporter,
} = require("@opentelemetry/exporter-logs-otlp-http");

const {
  BatchLogRecordProcessor,
} = require("@opentelemetry/sdk-logs");

const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const {
  OTLPMetricExporter,
} = require("@opentelemetry/exporter-metrics-otlp-http");

const logExporter = new OTLPLogExporter({
  url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT,
});

const {
  PeriodicExportingMetricReader,
} = require("@opentelemetry/sdk-metrics");

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
});

const metricExporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
});

const sdk = new NodeSDK({
  serviceName: "gitlab2-app",

  traceExporter,

  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 5000,
    }),
  ],

  logRecordProcessors: [
    new BatchLogRecordProcessor({
        exporter: logExporter,
    }),
  ],

  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("OpenTelemetry terminated"))
    .catch((error) => console.error("Error terminating OpenTelemetry", error))
    .finally(() => process.exit(0));
});