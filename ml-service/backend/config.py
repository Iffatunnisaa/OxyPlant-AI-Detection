from pathlib import Path

# Base directories
PACKAGE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = PACKAGE_DIR.parent
MODEL_DIR = PROJECT_DIR / "model"

# Model and metadata paths
MODEL_PATH = MODEL_DIR / "final_model_tf" / "best_model_ta99.keras"
CLASS_NAMES_PATH = MODEL_DIR / "class_names.json"
PLANT_DISEASE_MAPPING_PATH = MODEL_DIR / "plant_disease_mapping.json"
PLANT_LABELS_PATH = MODEL_DIR / "plant_labels.txt"
DISEASE_LABELS_PATH = MODEL_DIR / "disease_labels.txt"

# Inference settings
IMG_SIZE = (256, 256)
TOP_K_DEFAULT = 3

# Upload settings
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png"}
