import boto3


class ComprehensionService:
    def __init__(self):
        self.client = boto3.client('comprehend')

    def comprehend_text(self, text, language = 'en'):
        response = self.client.detect_pii_entities(
            Text = text,
            LanguageCode = language
        )

        labels = {
            'labels': response['Entities'],
        }

        return labels
