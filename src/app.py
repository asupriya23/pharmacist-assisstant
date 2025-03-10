# from flask import Flask, request, jsonify
# from flask_cors import CORS  # Import CORS
# from transformers import TrOCRProcessor, VisionEncoderDecoderModel
# from PIL import Image
# import io

# app = Flask(__name__)
# CORS(app)  # Enable CORS for all routes

# # Load the TrOCR model and processor
# processor = TrOCRProcessor.from_pretrained('microsoft/trocr-large-handwritten')
# model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-large-handwritten')

# @app.route('/predict', methods=['POST'])
# def predict():
#     if 'image' not in request.files:
#         return jsonify({'error': 'No image uploaded'}), 400

#     # Read the image from the request
#     image_file = request.files['image']
#     image = Image.open(io.BytesIO(image_file.read())).convert("RGB")

#     # Process the image
#     pixel_values = processor(images=image, return_tensors="pt").pixel_values

#     # Generate text
#     generated_ids = model.generate(pixel_values)
#     generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

#     return jsonify({'recognized_text': generated_text})

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)


from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import easyocr
from PIL import Image
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the TrOCR model and processor
# processor = TrOCRProcessor.from_pretrained('microsoft/trocr-large-handwritten')
# model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-large-handwritten')

reader = easyocr.Reader(['en'])

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    image_file = request.files['image']
    image_path = "temp_image.jpg"
    image_file.save(image_path)  # Save temporarily for EasyOCR

    results = reader.readtext(image_path)
    detected_text = " ".join([text for _, text, _ in results])
    print(detected_text)

    return jsonify({'transcription': detected_text})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


