import boto3

class DynamoAuthService:
    
    def __init__(self, table_name, partition_key):
        self.client = boto3.resource('dynamodb')
        self.table_name = table_name
        self.partition_key = partition_key
        try:
            self.table = self.client.Table(self.table_name)
        except self.client.meta.client.exceptions.ResourceInUseException as e:
            self.table = None

    def create_table(self):
        try:
            self.table = self.client.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {
                        'AttributeName': self.partition_key,
                        'KeyType': 'HASH'   # Partition key
                    }
                ],
                AttributeDefinitions=[
                    {
                        'AttributeName': self.partition_key,
                        'AttributeType': 'S'
                    }
                ],
                ProvisionedThroughput={
                    'ReadCapacityUnits': 5,
                    'WriteCapacityUnits': 5
                }
            )
            self.table.wait_until_exists()
            #self.client.get_waiter('table_exists').wait(TableName=self.table_name)
            print(f"Table '{self.table_name}' created successfully.")
        
        except self.client.meta.client.exceptions.ResourceInUseException as e:
            self.table = self.client.Table(self.table_name)
            #print(f"Error creating table '{self.table_name}': {e}")

    def get_item(self, username):
        response = self.table.get_item(
            Key={self.partition_key: username}, 
            ConsistentRead=True)

        return response['Item']

    def put_item(self, item):
        # while True:
        #     if self.table.table_status == 'CREATING':
        #         time.sleep(3)
        #     else: 
        #         break
        self.table.wait_until_exists()
        response = self.table.put_item(Item=item)

        return response

    def delete_item(self, username):
        response = self.table.delete_item(
            Key={self.partition_key: username})

        return response