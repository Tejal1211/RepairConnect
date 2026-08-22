"""
image_processor.py
-------------------
OpenCV-based preprocessing and quality-checking for uploaded damage photos.

Responsibilities of this module (and ONLY this module):
  - Validate that the uploaded bytes are actually a readable image
  - Detect blur (Laplacian variance)
  - Detect brightness problems (too dark / too bright)
  - Resize very large images while preserving aspect ratio
  - Apply light contrast enhancement when the image is dim
  - Reduce noise where appropriate
  - Return structured quality metadata

IMPORTANT: OpenCV here does NOT diagnose the item. It only judges whether the
photo is technically good enough to hand to the Gemini multimodal model.
Any statement about "what's wrong with the device" comes from gemini_service.py,
never from this file.
"""

import os
import uuid
from dataclasses import dataclass

import cv2
import numpy as np

PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "static", "processed")
os.makedirs(PROCESSED_DIR, exist_ok=True)

MAX_DIMENSION = 1600          # px - resize cap, keeps payloads small for the AI call
BLUR_THRESHOLD_POOR = 60.0    # Laplacian variance below this => too blurry
BLUR_THRESHOLD_FAIR = 120.0
BRIGHTNESS_MIN = 40           # 0-255 scale
BRIGHTNESS_MAX = 235


class InvalidImageError(Exception):
    """Raised when the uploaded bytes cannot be decoded as an image."""


@dataclass
class ProcessedImage:
    valid: bool
    quality: str
    blur_score: float
    brightness: float
    width: int
    height: int
    processed_image_path: str | None
    message: str | None = None


def _decode_image(image_bytes: bytes) -> np.ndarray:
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise InvalidImageError("The uploaded file could not be read as an image.")
    return img


def _blur_score(gray: np.ndarray) -> float:
    """Laplacian variance - higher = sharper image."""
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def _brightness(gray: np.ndarray) -> float:
    return float(np.mean(gray))


def _resize_preserving_aspect(img: np.ndarray, max_dim: int = MAX_DIMENSION) -> np.ndarray:
    h, w = img.shape[:2]
    longest = max(h, w)
    if longest <= max_dim:
        return img
    scale = max_dim / float(longest)
    new_w, new_h = int(w * scale), int(h * scale)
    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)


def _enhance_contrast_if_dim(img: np.ndarray, brightness: float) -> np.ndarray:
    """Apply CLAHE contrast enhancement only when the image is on the dark side."""
    if brightness >= 90:
        return img
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def _denoise_if_needed(img: np.ndarray, blur: float) -> np.ndarray:
    """Light denoise only for reasonably sharp images - denoising a blurry
    image further hides real detail rather than helping."""
    if blur < BLUR_THRESHOLD_FAIR:
        return img
    return cv2.fastNlMeansDenoisingColored(img, None, 3, 3, 7, 21)


def process_image(image_bytes: bytes) -> ProcessedImage:
    """
    Full OpenCV pipeline. Returns a ProcessedImage with quality metadata and
    a path to the (possibly enhanced) image ready for the Gemini call.
    """
    try:
        img = _decode_image(image_bytes)
    except InvalidImageError as exc:
        return ProcessedImage(
            valid=False,
            quality="invalid",
            blur_score=0.0,
            brightness=0.0,
            width=0,
            height=0,
            processed_image_path=None,
            message=str(exc),
        )

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = _blur_score(gray)
    brightness = _brightness(gray)
    height, width = img.shape[:2]

    # Decide quality bucket
    if blur < BLUR_THRESHOLD_POOR or brightness < BRIGHTNESS_MIN or brightness > BRIGHTNESS_MAX:
        quality = "poor"
    elif blur < BLUR_THRESHOLD_FAIR:
        quality = "fair"
    else:
        quality = "good"

    message = None
    if quality == "poor":
        if blur < BLUR_THRESHOLD_POOR:
            message = "The image appears too blurry for a reliable visual assessment. Please upload a clearer, well-focused photo."
        elif brightness < BRIGHTNESS_MIN:
            message = "The image is too dark for a reliable visual assessment. Try retaking the photo in better lighting."
        else:
            message = "The image is overexposed / too bright. Try retaking the photo away from direct light or flash glare."

    # Preprocess regardless (even a "poor" quality image is still saved so the
    # user can see what was analyzed, but we ask them to retake if too poor)
    processed = _resize_preserving_aspect(img)
    processed = _enhance_contrast_if_dim(processed, brightness)
    processed = _denoise_if_needed(processed, blur)

    filename = f"{uuid.uuid4().hex}.jpg"
    out_path = os.path.join(PROCESSED_DIR, filename)
    cv2.imwrite(out_path, processed, [cv2.IMWRITE_JPEG_QUALITY, 90])

    return ProcessedImage(
        valid=True,
        quality=quality,
        blur_score=round(blur, 2),
        brightness=round(brightness, 2),
        width=int(width),
        height=int(height),
        processed_image_path=out_path,
        message=message,
    )
