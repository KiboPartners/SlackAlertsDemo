import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { request } from 'https';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL
const KIBO_DEMO_TENANT= process.env.KIBO_DEMO_TENANT

interface KiboEventHeaders {
  'content-length': string;
  'content-type': string;
  'x-amzn-trace-id': string;
  'x-forwarded-for': string;
  'x-forwarded-port': string;
  'x-forwarded-proto': string;
  'x-vol-catalog': string;
  'x-vol-correlation': string;
  'x-vol-currency': string;
  'x-vol-hmac-sha256': string;
  'x-vol-locale': string;
  'x-vol-master-catalog': string;
  'x-vol-price-plan': string;
  'x-vol-pricelist': string;
  'x-vol-purchase-location': string;
  'x-vol-site': string;
  'x-vol-tenant': string;
  'x-vol-tenant-domain': string;
 }

 interface KiboEventExtendedProperty {
  key: string;
  value: string;
 }
 
 // Define the main interface for the object
 interface KiboEvent {
  eventId: string;
  extendedProperties: KiboEventExtendedProperty[];
  topic: string;
  entityId: string;
  timestamp: string;
  correlationId: string;
  isTest: boolean;
 }

 const postToSlackChannel = async (endpoint: string, message: string) => {
  return new Promise((resolve, reject) => {
    // Define the data to send
    const data = JSON.stringify({ message: message });
    console.log(data)

    // Define the options for the POST request
    const options = {
      hostname: 'hooks.slack.com',
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    // Create the request
    const req = request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);

      res.on('data', (d) => {
        process.stdout.write(d);
        resolve(void(0));
      });
    });

    req.on('error', (error) => {
      console.error(error);
      reject(error);
    });

    req.write(data);

    // End the request
    req.end();
  });
}



export const handler = async (
  eventRaw: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const headers = (eventRaw.headers as any) as KiboEventHeaders
  const event = JSON.parse(eventRaw.body || '') as KiboEvent

  console.log(JSON.stringify({event: event, headers: headers}))

  if (headers['x-vol-tenant'] == KIBO_DEMO_TENANT &&
    event.topic == "shipment.workflowstatechanged" && event.extendedProperties.find(e => e.key == "newState")?.value == "REJECTED") {
    await postToSlackChannel(SLACK_WEBHOOK_URL, `Shipment ${event.entityId} has been rejected by location ${event.extendedProperties.find(e => e.key == "fulfillmentLocationCode")?.value}
https://t${headers["x-vol-tenant"]}.sandbox.mozu.com/admin/s-${headers["x-vol-site"]}/orders/edit/${event.extendedProperties.find(e => e.key == "orderId")?.value}`)
  }

  if (headers['x-vol-tenant'] == KIBO_DEMO_TENANT &&
    event.topic == "shipment.statuschanged" && event.extendedProperties.find(e => e.key == "newStatus")?.value == "CANCELED") {
      await postToSlackChannel(SLACK_WEBHOOK_URL, `Shipment ${event.entityId} has been cancelled
https://t${headers["x-vol-tenant"]}.sandbox.mozu.com/admin/s-${headers["x-vol-site"]}/orders/edit/${event.extendedProperties.find(e => e.key == "orderId")?.value}`)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({})
  };
};
