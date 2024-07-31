
# Slack Alerts Demo

This file contains a Lambda function written in TypeScript to handle events from Kibo Commerce platform and post notifications to a Slack channel based on certain conditions.

It is written in the Serverless framework, which lets you easily deploy changes to a Lambda function.

## Functionality
The Lambda function defined in this file will:
1. Parse the incoming APIGatewayProxyEvent and extract required headers and event data.
2. Check if the event matches specific criteria (e.g. shipment rejection or cancellation).
3. Post a message to a Slack channel using the provided Slack webhook endpoint when a shipment is rejected or cancelled.

## Usage

Follow these steps to set up a webhook in Slack: [https://api.slack.com/messaging/webhooks](https://api.slack.com/messaging/webhooks)

You can make any modifications to the list of conditions and Slack endpionts based on your use case.

## Deployment

```
npm install
cp env.example.json env.dev.json
# Modify SLACK_WEBHOOK_URL and KIBO_DEMO_TENANT in your env.dev.json
serverless deploy --stage dev
```

This will return a URL for the deployment. You can then follow the directions in [https://docs.kibocommerce.com/help/event-subscription](https://docs.kibocommerce.com/help/event-subscription] to set up this endpoint as a listener for the event subscriptions you desire.

To follow the example here, enable the `shipment.workflowstatechanged` event.

