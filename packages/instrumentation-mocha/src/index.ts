import { trace, context, setSpan, Span, SpanStatusCode, SpanKind }  from '@opentelemetry/api';
import type { Runnable, Suite } from 'mocha';
import { TestAttributes } from './types';
import { VERSION } from './version';

const TEST_SPAN_KEY = Symbol('opentelemetry.mocha.span_key');

const getSuitesRecursive = (suite: Suite): string[] => {
    if(!suite) {
        return [];
    }

    const parentSuites = getSuitesRecursive(suite.parent);
    return suite.title ? [...parentSuites, suite.title] : parentSuites;
}

export const mochaHooks = {

    beforeEach(done) {
        const tracer = trace.getTracer('opentelemetry-instrumentation-mocha', VERSION);
        const test = this.currentTest as Runnable;
        const spanForTest = tracer.startSpan(test.fullTitle(), {
            attributes: {
                [TestAttributes.TEST_NAME]: test.title,
                [TestAttributes.TEST_FULL_NAME]: test.fullTitle(),
                [TestAttributes.TEST_SUITES]: getSuitesRecursive(test.parent),
            },
            root: true,
            kind: SpanKind.CLIENT,
        });
        Object.defineProperty(test, TEST_SPAN_KEY, {
            value: spanForTest,
            enumerable: false,
            configurable: false,
        })
        context.with(setSpan(context.active(), spanForTest), done);
    },

    afterEach(done) {
        const test = this.currentTest as Runnable;
        const spanForTest: Span = test[TEST_SPAN_KEY];
        if(!spanForTest) {
            done();
            return;
        }

        if(test.isFailed()) {
            spanForTest.setStatus({
                code: SpanStatusCode.ERROR,
                message: (test as any).err?.message,
            });
        }
        spanForTest.end();
        done();
    }
}
