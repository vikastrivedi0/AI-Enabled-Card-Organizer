import boto3
import time
from cryptography.fernet import Fernet

class DynamoAuthService:
    
    def __init__(self, table_name, partition_key, partition_key_type):
        self.table_name = table_name
        self.partition_key = partition_key
        self.partition_key_type = partition_key_type
        self.client = boto3.client('dynamodb')
        self.fernet = Fernet.generate_key()
   
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

    def encrypt_password(self, password):
        iv = Fernet.generate_key()
        cipher_suite = Fernet(self.fernet)
        cipher_text = cipher_suite.encrypt(password.encode())
        return iv + cipher_text

    def decrypt_password(self, encrypted_password):
        iv = encrypted_password[:16]
        cipher_text = encrypted_password[16:]
        cipher_suite = Fernet(self.fernet)
        password = cipher_suite.decrypt(iv + cipher_text)
        return password.decode()

    def put_item(self, item):
        while True:
            if self.client.describe_table(TableName=self.table_name)['Table']['TableStatus'] == 'CREATING':
                time.sleep(3)
            else: 
                break

        # encrypted_password = self.encrypt_password(item['password']['S'])
        # item['password'] = {'B': encrypted_password}

        response = self.client.put_item(
            TableName=self.table_name, 
            Item=item
        )

        print(response)


    def get_item(self, partition_key_value):
        response = self.client.get_item(
            TableName=self.table_name,
            Key={
                self.partition_key: {
                    self.partition_key_type: partition_key_value
                }
            }
        )

        item = response.get('Item')
        return item
        # if item:
        #     # Get the encrypted password from the item
        #     encrypted_password = item.get('password').get('B')

        #     # Decrypt the password using the same encryption algorithm and key
        #     decrypted_password = self.decrypt_password(encrypted_password)

        #     # Update the item dictionary with the decrypted password
        #     item['password'] = {'S': decrypted_password}

        #     return item
        # else:
        #     return None