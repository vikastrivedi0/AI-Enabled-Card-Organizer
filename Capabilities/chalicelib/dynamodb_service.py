import boto3
import time

class DynamoDBService:
    
    def __init__(self, table_name, partition_key, partition_type, sort_key, sort_type):
        self.table_name = table_name
        self.partition_key = partition_key
        self.partition_type = partition_type
        self.sort_key = sort_key
        self.sort_type = sort_type
        self.client = boto3.client('dynamodb')

    def create_table(self):
        try:
            table = self.client.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {
                        'AttributeName': self.partition_key,
                        'KeyType': 'HASH'   # Partition key
                    }, 
                    {
                        'AttributeName': self.sort_key, 
                        'KeyType': 'RANGE'  # Sort key
                    }
                ],
                AttributeDefinitions=[
                    {
                        'AttributeName': self.partition_key,
                        'AttributeType': self.partition_type
                    }, 
                    {
                        'AttributeName': self.sort_key,
                        'AttributeType': self.sort_type
                    }
                ],
                ProvisionedThroughput={
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                }
            )

            self.client.get_waiter('table_exists').wait(TableName=table_name)
            print(f"Table '{self.table_name}' created successfully.")

        except self.client.exceptions.ResourceInUseException as e:
            print(f"Error creating table '{self.table_name}': {e}")

    def get_item(self, username, lead_email):
        try:
            response = self.client.get_item(
                TableName=self.table_name, 
                Key={self.partition_key: {self.partition_type: username}, 
                self.sort_key: {self.sort_type: lead_email}}, 
                ConsistentRead=True)
            print("get_item() returned:", response['Item'])
            return response['Item']

        except self.client.exceptions.ResourceNotFoundException:
            print(f"Item does not exist...")

    def get_all(self):
        response = self.client.scan(
            TableName=self.table_name
            )

        print(response['Items'])
        return response['Items']

    def query(self, username):
        response = self.client.query(
            TableName = self.table_name, 
            KeyConditionExpression='username = :pk', 
            ExpressionAttributeValues={':pk': {'S': username}}
            )

        for item in response['Items']:
            print(item)

        return response['Items']

    def delete_item(self, username, lead_email):
        response = self.client.delete_item(
            TableName=self.table_name, 
            Key={self.partition_key: {self.partition_type: username}, 
                self.sort_key: {self.sort_type: lead_email}}
            )

    def put_item(self, item):
        while True:
            if self.client.describe_table(TableName=self.table_name)['Table']['TableStatus'] == 'CREATING':
                time.sleep(3)
            else: 
                break

        response = self.client.put_item(
            TableName=self.table_name, 
            Item=item
            )

        print(response)
        