// Create clients and set shared const values outside of the handler

// Create a DocumentClient that represents the query to get an item
const dynamodb = require('aws-sdk/clients/dynamodb');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.getByReadIdHandler = async (event) => {
    const { httpMethod, path, pathParameters } = event;
    if (httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${httpMethod}`);
    }
    // All log statements are written to CloudWatch by default. For more information, see
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
    console.log('received:', JSON.stringify(event));

    // Get id from pathParameters from APIGateway because of `/{id}` at template.yml
    const { uuid } = pathParameters;

    const query = {
        TableName: tableName,
        IndexName: "idxReadUUID",
        KeyConditionExpression: "#key = :value",
        ExpressionAttributeNames:{
            "#key": "uuid_read"
        },
        ExpressionAttributeValues: {
            ":value": uuid
        }
    };

    console.log("Query", JSON.stringify(query));

    // Get the item from the table
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
    const result = await docClient.query(query).promise();
    console.log("result", JSON.stringify(result));
    let response;
    if (result.Items.length <= 0) {
        const responseBody = {
            msg: `No test case for uuid ${uuid} found`
        };
        response = {
            statusCode: 404,
            body: JSON.stringify(responseBody),
        }
    } else {
        delete result.Items[0].uuid_write;
        delete result.Items[0].uuid_read;
        delete result.Items[0].id;
        response = {
            statusCode: 200,
            body: JSON.stringify(result.Items[0]),
            headers: {
                "Content-Type" : "application/json",
                "Access-Control-Allow-Origin" : "*",
                "Access-Control-Allow-Methods" : "GET, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        };
    }

    console.log(`response from: ${path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};
