import logging
from chalice import Chalice
from chalicelib import storage_service
from chalicelib import recognition_service
from chalicelib import translation_service
from chalicelib import comprehension_service
from chalicelib import dynamoauth_service

import base64
import json


#####
# chalice app configuration
#####
app = Chalice(app_name='Capabilities')
app.debug = True

#####
# services initialization
#####
storage_location = 'contentcen301217554.aws.ai'
storage_service = storage_service.StorageService(storage_location)
recognition_service = recognition_service.RecognitionService(storage_service)
translation_service = translation_service.TranslationService()
comprehension_service = comprehension_service.ComprehensionService()

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


## Input to Auth table of DB
dyn = dynamoauth_service.DynamoAuthService('user_table','username','S')

table_name=dyn.create_table()

item ={
    'username': {'S':'Kanishka'},
    'password':{'S':'8437'}
}
dyn.put_item(item)


username='Kanishka'
item = dyn.get_item(username)
print(item)