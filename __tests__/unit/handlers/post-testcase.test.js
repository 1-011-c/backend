// Import dynamodb from aws-sdk
const dynamodb = require('aws-sdk/clients/dynamodb');

// Import all functions from put-item.js
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
    it('should add add a new testcase', async () => {
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
        expect(body.id).toBeTruthy();
        expect(body.uuid_read).toBeTruthy();
        expect(body.uuid_write).toBeTruthy();
        expect(body.infected).toEqual("NOT_TESTED");
        expect(body.date).toBeTruthy();
    });
});
