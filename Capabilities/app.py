import logging
from chalice import Chalice, Response
from chalicelib import storage_service
from chalicelib import recognition_service
from chalicelib import translation_service
from chalicelib import comprehension_service
from chalicelib import dynamodb_service
from chalicelib import dynamoauth_service

import base64
import json
import hashlib
#####
# chalice app configuration
#####
app = Chalice(app_name='Capabilities')
app.debug = True
UserName="kanishka"
#####
# services initialization
#####
storage_location = 'contentcen301220757.aws.ai'
storage_service = storage_service.StorageService(storage_location)
recognition_service = recognition_service.RecognitionService(storage_service)
translation_service = translation_service.TranslationService()
comprehension_service = comprehension_service.ComprehensionService()
dyanmodb_service=dynamodb_service.DynamoDBService('lead_data','username','S','lead_email','S')
dyanmodb_service.create_table()

dynamoauth_service=dynamoauth_service.DynamoAuthService('user_data','username','S')
dynamoauth_service.create_table()
#####
# RESTful endpoints
#####
@app.route('/images', methods=['POST'], cors=True)
def upload_image():
    """processes file upload and saves file to storage service"""
    request_data = json.loads(app.current_request.raw_body)
    file_name = request_data['filename']
    file_bytes = base64.b64decode(request_data['filebytes'])

    image_info = storage_service.upload_file(file_bytes, file_name)

    return image_info


@app.route('/images/{image_id}/detect-text', methods=['POST'], cors=True)
def detect_image_text(image_id):
    """detects then translates text in the specified image"""
    request_data = json.loads(app.current_request.raw_body)
    from_lang = request_data['fromLang']
    to_lang = request_data['toLang']

    MIN_CONFIDENCE = 80.0

    text_lines = recognition_service.detect_text(image_id)

    detected_text = []

    for line in text_lines:
        # check confidence
        if float(line['confidence']) >= MIN_CONFIDENCE:
            translated_line = translation_service.translate_text(
                line['text'], from_lang, to_lang)
            detected_label = comprehension_service.comprehend_text(
                translated_line['translatedText'])
            detected_text.append({
                'translation': translated_line,
                'labels': detected_label,
            })

            names = []
            addresses = []
            phones = []
            emails = []
            urls = []
            for i in detected_text:
                for j in (i['labels']['labels']):
                    if (j['Type']) == "NAME":
                        names.append(i['translation']['translatedText'])
                    elif (j['Type']) == "ADDRESS":
                        addresses.append(i['translation']['translatedText'])
                    elif (j['Type']) == "PHONE":
                        phones.append(i['translation']['translatedText'])
                    elif (j['Type']) == "EMAIL":
                        emails.append(i['translation']['translatedText'])
                    elif (j['Type']) == "URL":
                        urls.append(i['translation']['translatedText'])

    return {
        'names': names,
        'addresses': addresses,
        'phones': phones,
        'emails': emails,
        'urls': urls
    }


@app.route('/images/{image_id}/translate-text', methods=['POST'], cors=True)
def translate_image_text(image_id):
    """detects then translates text in the specified image"""
    request_data = json.loads(app.current_request.raw_body)
    from_lang = request_data['fromLang']
    to_lang = request_data['toLang']

    MIN_CONFIDENCE = 80.0

    text_lines = recognition_service.detect_text(image_id)

    translated_lines = []
    for line in text_lines:
        # check confidence
        if float(line['confidence']) >= MIN_CONFIDENCE:
            translated_line = translation_service.translate_text(
                line['text'], from_lang, to_lang)
            translated_lines.append({
                'text': line['text'],
                'translation': translated_line,
                'boundingBox': line['boundingBox']
            })

    return translated_lines


@app.route('/save', methods=['POST'], cors=True)
def save_lead():
    """processes file upload and saves file to storage service"""
    request_data = json.loads(app.current_request.raw_body)
    input={
        'username':{'S':UserName},
        'lead_name':{'S':request_data['lead_name']}, 
                 'company_name':{'S':request_data['company_name']},
                 'phone1':{'S':request_data['phone1']},
                 'phone2':{'S':request_data['phone2']}, 
                 'address':{'S':request_data['address']},
                 'website':{'S':request_data['website']},
                 'lead_email':{'S':request_data['lead_email']} 
    }
    
    response=dyanmodb_service.put_item(input)
    # image_info = storage_service.upload_file(file_bytes, file_name)

    return response


@app.route('/search', methods=['POST'], cors=True)
def search_all_lead():
    """processes file upload and saves file to storage service"""
    
    response1=dyanmodb_service.get_all()
    
    response2=dyanmodb_service.query(UserName)

    return [response1,response2]


@app.route('/delete', methods=['POST'], cors=True)
def delete_item():
    """processes file upload and saves file to storage service"""
    request_data = json.loads(app.current_request.raw_body)
    response=dyanmodb_service.delete_item(UserName,request_data['lead_email'])
    return response
    

@app.route('/signup', methods=['POST'], cors=True)
def signup():
    """processes file upload and saves file to storage service"""
    request_data = json.loads(app.current_request.raw_body)
    # dict=request_data[dict]
    #print(request_data)
    password=request_data['password']
    hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
    #dict['password']=hashed_password

    input={
        'username':{'S':request_data['username']},
        'password':{'S':hashed_password}
    }
    response=dynamoauth_service.put_item(input)
    response=json.dumps(response)
    #not returning response in required format
    return response


@app.route('/signin', methods=['POST'], cors=True)
def signin():
    """processes file upload and saves file to storage service"""
    request_data = json.loads(app.current_request.raw_body)
    
    password=request_data['password']
    hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
    #dict['password']=hashed_password

    db_pswd=dynamoauth_service.get_item(request_data['username'])
    if (db_pswd['password']['S']==hashed_password):
        UserName=request_data['username']
        print("logging in ..."+UserName)
        return Response(status_code=200,
                        body={'Message': 'Login Sucess'},
                        headers={'Content-Type': 'application/json'})
    return False
    #{'password': {'S': '4654d793972c3b6a1d48fb0ab58d9cb0de46c3d33d605f9222c283dfaa12d420'}, 'username': {'S': 'kanishka'}}
    # response=dynamoauth_service.put_item(input)
    # response=json.dumps(response)
    # #not returning response in required format
    # return response
