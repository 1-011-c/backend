// Create clients and set shared const values outside of the handler

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const uuid = require('uuid');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.TEST_CASE_TABLE_NAME;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.postTestcaseHandler = async (event) => {
    const { body, httpMethod, path } = event;
    if (httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${httpMethod} method.`);
    }

    const Item = {
        "id": uuid.v4(), // Technical ID TODO remove this later
        "uuid_read": uuid.v4(),
        "uuid_write": uuid.v4(),
        "infected": "NOT_TESTED",
        "date": new Date().toISOString()
    };

    console.log('Created Test case', JSON.stringify(Item));

    // Creates a new item, or replaces an old item with a new item
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    const params = {
        TableName: tableName,
        Item,
    };
    await docClient.put(params).promise();

    const response = {
        statusCode: 200,
        body: Item,
    };

    console.log(`response from: ${path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};
