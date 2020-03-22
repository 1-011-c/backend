const dynamodb = require('aws-sdk/clients/dynamodb');

const lambda = require('../../../src/handlers/patch-set-testcase-status');
const uuid = require('uuid');

// This includes all tests for putItemHandler
describe('Patch Test Case handler', () => {
    let updateSpy;
    let querySpy;
    beforeAll(() => {
        updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
        querySpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
    });

    afterAll(() => {
        updateSpy.mockRestore();
        querySpy.mockRestore();
    });

    beforeEach(() => {
        updateSpy.mockReturnValue({
            promise: () => Promise.resolve('data')
        });
    });

    function buildEvent(method, uuid, infected) {
        return  {
            httpMethod: method,
            pathParameters: {
                "uuid": uuid,
                "infected": infected
            }
        };
    }

    function setQueryMockResult(result) {
        querySpy.mockReturnValue({
            promise: () => Promise.resolve(result)
        });
    }

    // This test invokes patch-set-testcase-status handler and compares the result
    it('should process a valid request', async () => {
        setQueryMockResult({Items: [{data: "data"}]})
        const event = buildEvent('PATCH', uuid.v4(), 'NEGATIVE');
        const result = await lambda.patchSetTestcaseStatus(event);
        expect(result).toBeTruthy();
        console.log(result);
        expect(result.statusCode).toEqual(200);
        expect(updateSpy).toHaveBeenCalled;
        expect(querySpy).toHaveBeenCalled;
    })

    it('should detect invalid uuids', async () => {
        setQueryMockResult({Items: []})
        const event = buildEvent('PATCH', 'invalid', 'NEGATIVE');
        const result = await lambda.patchSetTestcaseStatus(event);
        expect(result).toBeTruthy();
        expect(result.statusCode).toEqual(404);
        expect(updateSpy).not.toHaveBeenCalled;
        expect(querySpy).toHaveBeenCalled;
    })

    it('should detect invalid http method', async () => {
        setQueryMockResult({Items: [{data: "data"}]})
        const event = buildEvent('POST', uuid.v4(), 'NEGATIVE');
        const result = await lambda.patchSetTestcaseStatus(event);
        expect(result).toBeTruthy();
        expect(result.statusCode).toEqual(405);
        expect(updateSpy).not.toHaveBeenCalled;
        expect(querySpy).not.toHaveBeenCalled;
    })

    it('should detect invalid infected value', async () => {
        setQueryMockResult({Items: [{data: "data"}]})
        const event = buildEvent('PATCH', uuid.v4(), 'something');
        const result = await lambda.patchSetTestcaseStatus(event);
        expect(result).toBeTruthy();
        expect(result.statusCode).toEqual(400);
        expect(updateSpy).not.toHaveBeenCalled;
        expect(querySpy).not.toHaveBeenCalled;
    })
});
