// Create clients and set shared const values outside of the handler

// Create a DocumentClient that represents the query to get an item
const dynamodb = require('aws-sdk/clients/dynamodb');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

function throwHttpError(msg, statusCode) {
    throw {msg, statusCode};
}

async function getByWriteId(uuid) {
    const query = {
        TableName: tableName,
        IndexName: "idxWriteUUID",
        KeyConditionExpression: "#key = :value",
        ExpressionAttributeNames: {
            "#key": "uuid_write"
        },
        ExpressionAttributeValues: {
            ":value": uuid
        }
    };
    const result = await docClient.query(query).promise();
    console.log("Query result", JSON.stringify(result));
    if (result.Items.length >= 0) {
        return result.Items[0];
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

function isAllowedInfectedValue(infected) {
    const allowedValues = {
        "POSITIVE": "POSITIVE",
        "NEGATIVE": "NEGATIVE"
    };
    return !!allowedValues[infected];
}

async function processRequest(uuid, infected, httpMethod) {
    if (httpMethod !== 'PATCH') {
        throwHttpError(`${httpMethod} is not supported`, 405);
    }
    if (isAllowedInfectedValue(infected)) {
        throwHttpError(`${infected} is not an allowed infected value`, 400);
    }
    let responseBody;
    let statusCode;
    const testCase = await getByWriteId(uuid);
    if (!!testCase) {
        await updateTestCase(testCase, infected);
        statusCode = 200;
        responseBody = "Test Case Updated"
    } else {
        statusCode = 404;
        responseBody = `No test case for uuid ${uuid} found`
    }
    return {
        statusCode,
        body: JSON.stringify(responseBody),
    };
}

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.patchSetTestcaseStatus = async (event) => {
    console.log('received:', JSON.stringify(event));
    const {httpMethod, path, pathParameters} = event;
    const {uuid, infected} = pathParameters;
    try {
        const response =  await processRequest(uuid, infected, httpMethod);
        console.log(`response from: ${path} statusCode: ${response.statusCode} body: ${response.body}`);
        return response;
    } catch (e) {
        return {
            statusCode: e.statusCode,
            body: JSON.stringify({msg: e.msg})
        };
    }
};
