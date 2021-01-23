const AWS = require("aws-sdk");

// Set the region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: "eu-central-1",
});
const db = new AWS.DynamoDB.DocumentClient();

async function get(id: string) {
  const params = {
    TableName: "ddb",
    KeyConditionExpression: "tip = :hkey",
    ExpressionAttributeValues: {
      ":hkey": id,
    },
    ScanIndexForward: false,
  };
  return new Promise((resolve) => {
    db.query(params, (err: any, data: { Count: number; Items: any[] }) => {
      const x = data.Count >= 1 ? data.Items[0] : {};
      resolve(x);
    });
  });
}

function put(json: object) {
  return new Promise((resolve) => {
    db.put({ TableName: "ddb", Item: json }, function () {
      resolve({});
    });
  });
}

async function q1({
  fields,
  collection,
  descending,
  limit,
}: {
  fields: any;
  collection: string;
  descending: boolean;
  limit: number;
}) {
  const params = {
    TableName: "ddb",
    KeyConditionExpression: "tip = :hkey  and vreme >= :zkey",
    FilterExpression: `${Object.keys(query)[0]} = :ukey`,
    ExpressionAttributeValues: {
      ":zkey": 1,
      ":hkey": collection,
      ":ukey": Object.values(query)[0],
    },
    Limit: limit || 100,
    ScanIndexForward: descending || true,
    ReturnConsumedCapacity: "TOTAL",
    ProjectionExpression: fields || undefined,
  };

  return new Promise((resolve) => {
    db.query(params, (err: any, data: { Count: number; Items: any[] }) => {
      if (data.Count === 1) {
        resolve(data.Items[0]);
      }
      resolve(data);
    });
  });
}

async function query<T>({
  id,
  collection,
  limit,
  descending,
  count,
  fields,
}: {
  id: string;
  collection: string;
  limit: number;
  descending?: boolean;
  count?: number;
  fields?: object;
}) {
  const params = {
    TableName: "ddb",
    KeyConditionExpression: "tip = :hkey and vreme >= :ukey",
    ExpressionAttributeValues: {
      ":hkey": collection,
      ":ukey": id || 1,
    },
    Limit: limit || 100,
    ScanIndexForward: descending || false,
    ReturnConsumedCapacity: "TOTAL",
    ProjectionExpression: fields || undefined,
    Select: count ? "COUNT" : undefined,
  };

  return new Promise((resolve) => {
    db.query(params, (err: any, data: { Count: number; Items: any[] }) => {
      if (data.Count === 1) {
        resolve(data.Items[0]);
      }
      resolve(data);
    });
  });
}

module.exports = { get, put, query, q1 };
