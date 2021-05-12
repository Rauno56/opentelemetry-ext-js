import 'mocha';
import expect from 'expect';
import type { InMemorySpanExporter } from '@opentelemetry/tracing';
const memoryExporter: InMemorySpanExporter = require('./instrument');
import { TestAttributes } from '../src/types';
import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';

describe('mocha', () => {

    describe('empty test', () => {

        before(() => {
            memoryExporter.reset();
        });

        it('successful test', () => {
            // this test just validate that a span is created
        });

        it('validate successful test', () => {
            expect(memoryExporter.getFinishedSpans().length).toBe(1);
            const [testSpan] = memoryExporter.getFinishedSpans();

            // name
            expect(testSpan.name).toMatch('successful test');

            // attributes
            expect(testSpan.attributes[TestAttributes.TEST_NAME]).toMatch('successful test');
            expect(testSpan.attributes[TestAttributes.TEST_FULL_NAME]).toMatch('successful test');
            expect(testSpan.attributes[TestAttributes.TEST_SUITES]).toStrictEqual(['mocha', 'empty test']);

            // status
            expect(testSpan.status.code).toBe(SpanStatusCode.UNSET);
            expect(testSpan.status.message).toBeUndefined();

            // kind
            expect(testSpan.kind).toBe(SpanKind.CLIENT);
        });
    });

    describe('span created in test', () => {
       
        before(() => {
            memoryExporter.reset();
        });

        it('test with span', () => {
            const tracer = trace.getTracer('tracer for unittest');
            tracer.startSpan('internal span in test').end();
        });

        it('validate test with span', () => {
            expect(memoryExporter.getFinishedSpans().length).toBe(2);
            const [internalSpan, testSpan] = memoryExporter.getFinishedSpans();

            // make sure that internal span is the child of test span
            expect(internalSpan.parentSpanId).toEqual(testSpan.spanContext.spanId);
        });
    });
});
