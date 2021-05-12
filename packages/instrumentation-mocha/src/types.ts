
export enum TestAttributes {

    /** Name of the test itself, without suites */
    TEST_NAME = 'test.name',

    /** Name of the test with the suites */
    TEST_FULL_NAME = 'test.full_name',

    /** Array of suites in which the test reside, in order of nesting (from outer to inner) */
    TEST_SUITES = 'test.suites',
}