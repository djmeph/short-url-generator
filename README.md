# Short URL Redirect

Create two tables in DynamoDb:

`short-url-link`

`short-url-hit`

Give the link table a primary index of `slug` as a string with no sorting key. Give the hit table a primary index of `slug` and a sorting key named `timestamp` both as strings.

```
# serverless.yml

service: short-url-redirect

provider:
  name: aws
  runtime: nodejs8.10
  stage: redirect
  region: us-east-1
functions:
  prod:
    handler: index.handler
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'
```

Use `serverless deploy` to push to Lambda.

You'll need to use a custom domain with a redirected Base Path Mapping in order to assign to a domain with a flat path structure. Generate an SSL certificate for the domain you are using before setting this up.

Must grant DynamoDb read and write permissions to the Lambda script IAM role.
