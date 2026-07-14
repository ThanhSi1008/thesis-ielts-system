import os
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

def setup_telemetry(app):
    if os.getenv("OTEL_SDK_DISABLED") == "true":
        print("[Telemetry] OpenTelemetry SDK is disabled via OTEL_SDK_DISABLED=true")
        return
    resource = Resource(attributes={"service.name": "backend-ai"})
    provider = TracerProvider(resource=resource)
    provider.add_span_processor(
        BatchSpanProcessor(OTLPSpanExporter(
            endpoint=os.getenv(
                "OTEL_EXPORTER_OTLP_ENDPOINT",
                "http://172.18.0.1:4318/v1/traces"
            )
        ))
    )
    trace.set_tracer_provider(provider)
    FastAPIInstrumentor.instrument_app(app)
