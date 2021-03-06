![logo](logo.png)

## Purpose
This backend creates, updates and delivers corona test result. For every test case two uuids are generated. One for the laboratory and one for the patient. The laboratory can update the result (infect=POSITIVE/NEGATIVE), the patient is able to read this result.

## General approach
The backend uses three AWS lambdas to provide its service:

- getTestCaseByReadId: reads a result for a patient 
- patchSetTestcaseStatus: updates the field 'infected' in the DB (test result)
- postTestcaseFunction: creates new testcases

The testcases are stored in a dynamoDB and an API gateway is used to provide HTTP endpoints. The configuration of lambdas, api gateway and database can be found in the [template](cloudformation template.yml).

## Database
The dynamodb contains one table, called CoronaTestCase:
 
- partitionKey is the id
- there are two global indexes
    - one for the uuid_read (patients uuid)
    - one for the uuid_write (laboratory uuid)

The result itself is stored in the field infected. Possible values are 'NOT_TESTED', 'POSITIVE' and 'NEGATIVE'.

## Lambdas
The lambdas are called through an API Gateway. But you can also test them in the AWS console. In order to do so, the event must contain the httpMethod and some other information (see lamdas in src/handlers).

## Build & deployment
Tests are started for each commit on master and every PR. Github Action for this is configured in [.github/workflows/nodejs.yml](.github/workflows/nodejs.yml).

Deployment is done via AWS codebuild (tests are executed here too). The configuration can be found in [buildspec.yml](buildspec.yml).

