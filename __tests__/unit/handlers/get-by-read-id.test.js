const dynamodb = require('aws-sdk/clients/dynamodb');

const lambda = require('../../../src/handlers/get-by-read-id');
const uuid = require('uuid');

// This includes all tests for putItemHandler
describe('Get Test Case handler', () => {
    let querySpy;
    beforeAll(() => {
        querySpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
    });

    afterAll(() => {
        querySpy.mockRestore();
    });

    function buildEvent(method, uuid) {
        return  {
            httpMethod: method,
            pathParameters: {
                "uuid": uuid
            }
        };
    }

    function setQueryMockResult(result) {
        querySpy.mockReturnValue({
            promise: () => Promise.resolve(result)
        });
    }

    // This test invokes patch-set-testcase-status handler and compares the result
    it('should return result for a valid request', async () => {
        const expectedResult = { data: "data" }
        setQueryMockResult({Items: [expectedResult]})
        const event = buildEvent('GET', uuid.v4());
        const result = await lambda.getByReadIdHandler(event);
        expect(result).toBeTruthy();
        expect(result.statusCode).toEqual(200);
        expect(querySpy).toHaveBeenCalled;
        expect(JSON.parse(result.body)).toEqual(expectedResult)
    })

    it('should return correct headers', async () => {
        const expectedResult = { data: "data" }
        setQueryMockResult({Items: [expectedResult]})
        const event = buildEvent('GET', uuid.v4());
        const result = await lambda.getByReadIdHandler(event);
        expect(result).toBeTruthy();
        expect(result.statusCode).toEqual(200);
        expect(result.headers['Content-Type']).toEqual('application/json');
        expect(result.headers['Access-Control-Allow-Origin']).toEqual('*');
        expect(result.headers['Access-Control-Allow-Methods']).toEqual('GET, OPTIONS');
        expect(result.headers['Access-Control-Allow-Headers']).toEqual('*');
    })

    it('should remove sensitive data', async () => {
        const expectedResult = { uuid_write: "uuid_write", uuid_read: "uuid_read", id: "id" }
        setQueryMockResult({Items: [expectedResult]})
        const event = buildEvent('GET', uuid.v4());
        const result = await lambda.getByReadIdHandler(event);
        expect(result).toBeTruthy();
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).not.toHaveProperty("uuid_read")
        expect(JSON.parse(result.body)).not.toHaveProperty("uuid_write")
        expect(JSON.parse(result.body)).not.toHaveProperty("id")
    })

    it('should return 404 if nothing is found in db', async () => {
        setQueryMockResult({Items: []})
        const event = buildEvent('GET', uuid.v4());
        const result = await lambda.getByReadIdHandler(event);
        expect(result).toBeTruthy();
        console.log(result);
        expect(result.statusCode).toEqual(404);
        expect(querySpy).toHaveBeenCalled;
    })

});
