import io

import numpy as np
from PIL import Image, ImageEnhance, ImageOps, UnidentifiedImageError

from backend.config import IMG_SIZE


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Convert uploaded image bytes into a normalized model-ready tensor."""
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError as error:
        raise ValueError("Uploaded file is not a valid image") from error

    image = image.resize(IMG_SIZE)
    image_array = np.asarray(image, dtype=np.float32) / 255.0
    return np.expand_dims(image_array, axis=0)


def _to_tensor(image: Image.Image) -> np.ndarray:
    resized_image = image.resize(IMG_SIZE)
    image_array = np.asarray(resized_image, dtype=np.float32) / 255.0
    return np.expand_dims(image_array, axis=0)


def generate_tta_tensors(image_bytes: bytes) -> list[np.ndarray]:
    """Generate a small set of safe test-time augmentation tensors.

    The goal is not to heavily transform the image, but to average predictions
    across light variations that often occur in real user photos.
    """
    try:
        base_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError as error:
        raise ValueError("Uploaded file is not a valid image") from error

    variants = [
        base_image,
        ImageEnhance.Brightness(base_image).enhance(1.08),
        ImageEnhance.Brightness(base_image).enhance(0.92),
        ImageEnhance.Contrast(base_image).enhance(1.12),
        ImageOps.autocontrast(base_image),
    ]

    return [_to_tensor(variant) for variant in variants]
