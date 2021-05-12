import { trace, context, setSpan, Span, SpanStatusCode }  from '@opentelemetry/api';
import type { Runnable, Suite } from 'mocha';
import { VERSION } from './version';

const TEST_SPAN_KEY = Symbol('opentelemetry.mocha.span_key');

const getSuitesRecursive = (suite: Suite): string[] => {
    if(!suite) {
        return [];
    }

    const parentSuites = getSuitesRecursive(suite.parent);
    return suite.title ? [suite.title, ...parentSuites] : parentSuites;
}

export const mochaHooks = {

    beforeEach(done) {
        const tracer = trace.getTracer('opentelemetry-instrumentation-mocha', VERSION);
        const test = this.currentTest as Runnable;
        const spanForTest = tracer.startSpan(test.fullTitle(), {
            attributes: {
                'test.name': test.title,
                'test.full_name': test.fullTitle(),
                'test.suites': getSuitesRecursive(test.parent),
            },
            root: true,
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
