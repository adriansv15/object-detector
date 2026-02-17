import unittest
import io
from PIL import Image
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import numpy as np
from backend.app import app

class TestYOLOApi(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def create_tiny_image(self):
        """Generates a valid 1x1 pixel JPEG in memory."""
        file_io = io.BytesIO()
        # Create a 1x1 white pixel image
        img = Image.new("RGB", (1, 1), color="white")
        img.save(file_io, format="JPEG")
        return file_io.getvalue()

    @patch('backend.app.model') 
    def test_upload_with_mock_yolo(self, mock_yolo_instance):
        # 1. Setup the Mock Result Object
        mock_result = MagicMock()
        
        # FIX: Return a REAL numpy array, not a MagicMock
        # PIL's fromarray requires the __array_interface__ found in real arrays
        fake_image_array = np.zeros((100, 100, 3), dtype=np.uint8)
        mock_result.plot.return_value = fake_image_array
        
        # 2. Mock 'len(results[0].boxes)'
        # We create a dummy list for boxes so len() works on it
        mock_result.boxes = [None] * 3 

        # 3. Make the model call return our mock result
        mock_yolo_instance.return_value = [mock_result]

        # 4. Perform the request with your tiny valid image
        image_bytes = self.create_tiny_image()
        response = self.client.post(
            "/upload",
            files={"file": ("test.jpg", image_bytes, "image/jpeg")}
        )

        # 5. Assertions
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["count"], 3)
        self.assertTrue(data["image"].startswith("data:image/jpeg;base64,"))


if __name__ == "__main__":
    unittest.main()
