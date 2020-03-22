// Create clients and set shared const values outside of the handler

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const uuid = require('uuid');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

async function createTestCase() {
    const testCase = {
        "id": uuid.v4(),
        "uuid_read": uuid.v4(),
        "uuid_write": uuid.v4(),
        "infected": "NOT_TESTED",
        "date": new Date().toISOString()
    };
    const params = {
        TableName: tableName,
        Item: testCase,
    };
   await docClient.put(params).promise();
   return testCase;
}


exports.postTestcaseHandler = async (event) => {
    console.log("Event", JSON.stringify(event, 2, 2));
    const {body, httpMethod, path, queryStringParameters} = event;
    if (httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${httpMethod} method.`);
    }
    let amount = 1;
    if (queryStringParameters && queryStringParameters.amount) {
        const parsedAmount = Number.parseInt(queryStringParameters.amount);
        if (!!parsedAmount) {
            amount = parsedAmount;
        }
    }
    if (amount > 50) {
        amount = 50;
    }

    const cases = [];
    for (let i = 0; i < amount; i++) {
        const testCase = await createTestCase();
        cases.push(testCase);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify(cases),
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin" : "*",
            "Access-Control-Allow-Methods" : "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    };

    console.log(`response from: ${path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};
