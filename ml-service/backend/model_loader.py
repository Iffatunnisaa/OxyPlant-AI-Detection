import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import tensorflow as tf

from backend.config import (
    CLASS_NAMES_PATH,
    DISEASE_LABELS_PATH,
    MODEL_PATH,
    PLANT_DISEASE_MAPPING_PATH,
    PLANT_LABELS_PATH,
)

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ModelArtifacts:
    model: tf.keras.Model
    class_names: list[str]
    plant_disease_mapping: dict[str, list[str]]
    plant_labels: list[str]
    disease_labels: list[str]
    is_multitask: bool
    plant_output_classes: int | None
    disease_output_classes: int


def _load_json(path: Path, required: bool = True) -> Any:
    if not path.exists():
        if not required:
            return None
        raise FileNotFoundError(f"Required file not found: {path}")
    with path.open("r", encoding="utf-8") as file_handle:
        return json.load(file_handle)


def _load_text_lines(path: Path) -> list[str]:
    if not path.exists():
        raise FileNotFoundError(f"Required file not found: {path}")
    with path.open("r", encoding="utf-8") as file_handle:
        return [line.strip() for line in file_handle if line.strip()]


def _extract_num_classes(model: tf.keras.Model) -> tuple[int | None, int]:
    output_shape = model.output_shape
    if isinstance(output_shape, list):
        if len(output_shape) < 2:
            raise ValueError(f"Multitask model output is invalid: {output_shape}")

        plant_shape = output_shape[0]
        disease_shape = output_shape[1]
        if (
            not isinstance(plant_shape, tuple)
            or not isinstance(disease_shape, tuple)
            or len(plant_shape) < 2
            or len(disease_shape) < 2
            or plant_shape[-1] is None
            or disease_shape[-1] is None
        ):
            raise ValueError(f"Unable to infer multitask output classes from shape: {output_shape}")

        return int(plant_shape[-1]), int(disease_shape[-1])

    if not isinstance(output_shape, tuple) or len(output_shape) < 2 or output_shape[-1] is None:
        raise ValueError(f"Unable to infer model output classes from shape: {output_shape}")

    return None, int(output_shape[-1])


def _build_class_names_from_mapping(mapping: dict[str, list[str]]) -> list[str]:
    # Keep insertion order from mapping JSON for deterministic fallback behavior.
    labels: list[str] = []
    for plant_name, diseases in mapping.items():
        for disease_name in diseases:
            labels.append(f"{plant_name}___{disease_name}")

    # Preserve order while removing accidental duplicates.
    seen: set[str] = set()
    deduped: list[str] = []
    for label in labels:
        if label not in seen:
            deduped.append(label)
            seen.add(label)
    return deduped


def load_artifacts() -> ModelArtifacts:
    """Load model and metadata once at service startup."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

    logger.info("Loading TensorFlow model from %s", MODEL_PATH)
    model = tf.keras.models.load_model(MODEL_PATH)
    plant_output_classes, disease_output_classes = _extract_num_classes(model)
    is_multitask = plant_output_classes is not None

    mapping_data = _load_json(PLANT_DISEASE_MAPPING_PATH)
    if not isinstance(mapping_data, dict):
        raise ValueError("plant_disease_mapping.json must contain a JSON object")

    plant_labels = _load_text_lines(PLANT_LABELS_PATH)
    disease_labels = _load_text_lines(DISEASE_LABELS_PATH)

    normalized_mapping: dict[str, list[str]] = {}
    for plant_name, diseases in mapping_data.items():
        if isinstance(diseases, list):
            normalized_mapping[str(plant_name)] = [str(item) for item in diseases]

    class_names_raw = _load_json(CLASS_NAMES_PATH, required=False)
    class_names_data: list[str] = []

    if class_names_raw is None:
        logger.warning("class_names.json not found. Falling back to labels generated from plant_disease_mapping.json")
        class_names_data = _build_class_names_from_mapping(normalized_mapping)
    else:
        if not isinstance(class_names_raw, list) or not class_names_raw:
            raise ValueError("class_names.json must contain a non-empty JSON array")
        class_names_data = [str(label) for label in class_names_raw]

    if len(class_names_data) != disease_output_classes:
        if class_names_raw is not None:
            raise ValueError(
                "class_names.json length does not match model output classes "
                f"({len(class_names_data)} vs {disease_output_classes})"
            )

        logger.warning(
            "Fallback class names length (%d) does not match model classes (%d). "
            "Using generic class_0..class_n labels."
            ,
            len(class_names_data),
            disease_output_classes,
        )
        class_names_data = [f"class_{idx}" for idx in range(disease_output_classes)]

    if is_multitask and plant_output_classes is not None and len(plant_labels) != plant_output_classes:
        raise ValueError(
            "plant_labels.txt length does not match plant output classes "
            f"({len(plant_labels)} vs {plant_output_classes})"
        )

    if len(disease_labels) != disease_output_classes:
        logger.warning(
            "disease_labels.txt length (%d) does not match disease output classes (%d)",
            len(disease_labels),
            disease_output_classes,
        )

    logger.info(
        "Loaded artifacts: %d classes, %d plants, %d diseases",
        len(class_names_data),
        len(plant_labels),
        len(disease_labels),
    )

    return ModelArtifacts(
        model=model,
        class_names=class_names_data,
        plant_disease_mapping=normalized_mapping,
        plant_labels=plant_labels,
        disease_labels=disease_labels,
        is_multitask=is_multitask,
        plant_output_classes=plant_output_classes,
        disease_output_classes=disease_output_classes,
    )
