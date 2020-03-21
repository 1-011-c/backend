const dynamodb = require('aws-sdk/clients/dynamodb');

const lambda = require('../../../src/handlers/post-testcase');

// This includes all tests for putItemHandler
describe('Post Test Case handler', () => {
    let putSpy;
    beforeAll(() => {
        putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    });

    afterAll(() => {
        putSpy.mockRestore();
    });

    beforeEach(() => {
        putSpy.mockReturnValue({
            promise: () => Promise.resolve('data'),
        });
    });

    function buildEvent(amount) {
        return  {
            httpMethod: 'POST',
            queryStringParameters: {
                "amount": amount
            }
        };
    }

    // This test invokes putItemHandler and compares the result
    it('should add add a new testcase (amount 1)', async () => {
        const event = buildEvent(null);

        // Invoke putItemHandler()
        const result = await lambda.postTestcaseHandler(event);

        // Compare the result with the expected result
        expect(result).toBeTruthy();
        const body = JSON.parse(result.body);
        expect(body[0].id).toBeTruthy();
        expect(body[0].uuid_read).toBeTruthy();
        expect(body[0].uuid_write).toBeTruthy();
        expect(body[0].infected).toEqual("NOT_TESTED");
        expect(body[0].date).toBeTruthy();
    });

    it('should create multiple results', async () => {
        const event = buildEvent("10");
        const result = await lambda.postTestcaseHandler(event);
        expect(result).toBeTruthy();
        const body = JSON.parse(result.body);
        expect(body.length).toEqual(10);
    });

    it('should limit to 50 creations per call', async ()  => {
        const event = buildEvent("51");
        const result = await lambda.postTestcaseHandler(event);
        expect(result).toBeTruthy();
        const body = JSON.parse(result.body);
        expect(body.length).toEqual(50);
    });

    it('should default to 1 for unparseable numbers', async ()  => {
        const event = buildEvent("??sada");
        const result = await lambda.postTestcaseHandler(event);
        expect(result).toBeTruthy();
        const body = JSON.parse(result.body);
        expect(body.length).toEqual(1);
    });
});
