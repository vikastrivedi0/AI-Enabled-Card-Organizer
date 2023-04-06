import boto3
import time

class DynamoDBService:
    
    def __init__(self, table_name, partition_key, partition_key_type):
        self.table_name = table_name
        self.partition_key = partition_key
        self.partition_key_type = partition_key_type
        self.client = boto3.client('dynamodb')

    def create_table(self):
        try:
            response = self.client.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {
                        'AttributeName': self.partition_key,
                        'KeyType': 'HASH'
                    }
                ],
                AttributeDefinitions=[
                    {
                        'AttributeName': self.partition_key,
                        'AttributeType': self.partition_key_type
                    }
                ],
                ProvisionedThroughput={
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                }
            )
            print(f"Table '{self.table_name}' created successfully.")
        except self.client.exceptions.ResourceInUseException as e:
            print(f"Error creating table '{self.table_name}': {e}")

    def get_item(self, email):
        response = self.client.get_item(
            TableName=self.table_name, 
            Key={self.partition_key: {self.partition_key_type: email}}, 
            ConsistentRead=True)

        print(response['Item'])

    def get_all(self):
        response = self.client.scan(
            TableName=self.table_name
            )

        print(response['Items'])

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
        