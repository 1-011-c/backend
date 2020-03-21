const dynamodb = require('aws-sdk/clients/dynamodb');

const lambda = require('../../../src/handlers/post-testcase');

// This includes all tests for putItemHandler
describe('Post Test Case handler', () => {
    let putSpy;

    // One-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown
    beforeAll(() => {
        // Mock DynamoDB put method
        // https://jestjs.io/docs/en/jest-object.html#jestspyonobject-methodname
        putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    });

    // Clean up mocks
    afterAll(() => {
        putSpy.mockRestore();
    });

    // This test invokes putItemHandler and compares the result
    it('should add add a new testcase (amount 1)', async () => {
        // Return the specified value whenever the spied put function is called
        putSpy.mockReturnValue({
            promise: () => Promise.resolve('data'),
        });

        const event = {
            httpMethod: 'POST'
        };

        // Invoke putItemHandler()
        const result = await lambda.postTestcaseHandler(event);
        const expectedResult = {
            statusCode: 200,
            body: event.body,
        };

        // Compare the result with the expected result
        expect(result).toBeTruthy();
        const body = JSON.parse(result.body);
        expect(body[0].id).toBeTruthy();
        expect(body[0].uuid_read).toBeTruthy();
        expect(body[0].uuid_write).toBeTruthy();
        expect(body[0].infected).toEqual("NOT_TESTED");
        expect(body[0].date).toBeTruthy();
    });
});
