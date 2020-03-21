// Create clients and set shared const values outside of the handler

// Create a DocumentClient that represents the query to get an item
const dynamodb = require('aws-sdk/clients/dynamodb');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

async function getByWriteId(uuid) {
    const query = {
        TableName: tableName,
        IndexName: "idxReadUUID",
        KeyConditionExpression: "#key = :value",
        ExpressionAttributeNames: {
            "#key": "uuid_write"
        },
        ExpressionAttributeValues: {
            ":value": uuid
        }
    };
    const items = await docClient.query(query).promise().Items;
    if (items.length >= 0) {
        return items[0];
    }
    return null;
}

async function updateTestCase(item, infected) {
    var updateQuery = {
        TableName: tableName,
        Key: {
            "id": item.id,
        },
        UpdateExpression: "set infected = :infected",
        ExpressionAttributeValues: {
            ":infected": infected,
        },
        ReturnValues: "UPDATED_NEW"
    };
    console.log("Update query is ", JSON.stringify(updateQuery));
    const updateResult = await docClient.update(updateQuery).promise();
    console.log("Update result is ", JSON.stringify(updateResult));
}

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.patchSetTestcaseStatus = async (event) => {
    const {httpMethod, path, pathParameters} = event;
    if (httpMethod !== 'PATCH') {
        throw new Error(`getMethod only accept GET method, you tried: ${httpMethod}`);
    }
    // All log statements are written to CloudWatch by default. For more information, see
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
    console.log('received:', JSON.stringify(event));

    // Get id from pathParameters from APIGateway because of `/{id}` at template.yml
    const {uuid, infected} = pathParameters;

    const testCase = getByWriteId(uuid);
    let responseBody;
    let statusCode;
    if (!!testCase) {
        await updateTestCase(testCase, infected);
        statusCode = 200;
        responseBody = "Test Case Updated"
    } else {
        statusCode = 404;
        responseBody = `No test case for uuid ${uuid} found`
    }

    const response = {
        statusCode,
        body: JSON.stringify(responseBody),
    };

    console.log(`response from: ${path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};
