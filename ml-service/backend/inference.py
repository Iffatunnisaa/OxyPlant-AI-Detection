from typing import Any
import numpy as np

from backend.config import TOP_K_DEFAULT
from backend.model_loader import ModelArtifacts

# Confidence thresholds
MIN_CONFIDENCE_THRESHOLD = 0.65
CONFIDENCE_QUALITY_THRESHOLD = 0.75

TTA_WEIGHTS = np.asarray([1.0, 0.95, 0.95, 0.9, 0.9], dtype=np.float32)


def _normalize_text(value: str) -> str:
    return value.strip().lower()


def _get_possible_diseases(artifacts: ModelArtifacts, plant: str) -> list[str]:
    normalized_plant = _normalize_text(plant)
    for key, diseases in artifacts.plant_disease_mapping.items():
        if _normalize_text(key) == normalized_plant:
            return diseases
    return []


def _get_plants_for_disease(artifacts: ModelArtifacts, disease: str) -> list[str]:
    normalized_disease = _normalize_text(disease)
    matches = []
    for plant_name, diseases in artifacts.plant_disease_mapping.items():
        if any(_normalize_text(d) == normalized_disease for d in diseases):
            matches.append(plant_name)
    return matches


def _is_disease_valid_for_plant(artifacts: ModelArtifacts, plant: str, disease: str) -> bool:
    if plant == "unknown":
        return False
    possible = _get_possible_diseases(artifacts, plant)
    return _normalize_text(disease) in {_normalize_text(p) for p in possible}


def _weighted_average_probabilities(probability_list: list[np.ndarray], weights: np.ndarray) -> np.ndarray:
    stacked = np.vstack(probability_list)
    w = weights[: stacked.shape[0]]
    w = w / np.sum(w)
    avg = np.average(stacked, axis=0, weights=w)
    if np.sum(avg) > 0:
        avg = avg / np.sum(avg)
    return avg


def predict_image(
    image_tensors: list[np.ndarray] | np.ndarray,
    artifacts: ModelArtifacts,
    top_k: int = TOP_K_DEFAULT,
    temperature: float = 1.0,
) -> dict[str, Any]:

    # =============================
    # PREPARE INPUT
    # =============================
    if isinstance(image_tensors, list):
        batched_input = np.concatenate(image_tensors, axis=0)
    else:
        batched_input = image_tensors

    raw_output = artifacts.model.predict(batched_input, verbose=0)

    # =============================
    # MULTITASK MODEL
    # =============================
    if artifacts.is_multitask:
        if not isinstance(raw_output, (list, tuple)) or len(raw_output) < 2:
            raise ValueError("Expected multitask output (plant + disease)")

        plant_outputs = np.asarray(raw_output[0], dtype=np.float32)
        disease_outputs = np.asarray(raw_output[1], dtype=np.float32)

        # ===== TTA handling =====
        plant_probabilities = (
            _weighted_average_probabilities([row for row in plant_outputs], TTA_WEIGHTS)
            if plant_outputs.ndim == 2 else plant_outputs.reshape(-1)
        )

        disease_probabilities = (
            _weighted_average_probabilities([row for row in disease_outputs], TTA_WEIGHTS)
            if disease_outputs.ndim == 2 else disease_outputs.reshape(-1)
        )

        # ===== VALIDATION =====
        if not artifacts.plant_labels:
            raise ValueError("plant_labels not loaded")

        if plant_probabilities.size != len(artifacts.plant_labels):
            raise ValueError("Plant output mismatch")

        if disease_probabilities.size != len(artifacts.class_names):
            raise ValueError("Disease output mismatch")

        # =============================
        # RAW PREDICTIONS
        # =============================
        plant_idx = int(np.argmax(plant_probabilities))
        raw_plant = artifacts.plant_labels[plant_idx]

        disease_idx = int(np.argmax(disease_probabilities))
        disease = artifacts.class_names[disease_idx]
        confidence = float(disease_probabilities[disease_idx])

        # =============================
        # 🔥 SMART CORRECTION LOGIC
        # =============================
        possible_plants = _get_plants_for_disease(artifacts, disease)

        if len(possible_plants) == 1:
            # Strong correction (1 disease → 1 plant)
            plant = possible_plants[0]
            multitask_source = "corrected_from_disease"

        elif raw_plant in possible_plants:
            # Model still valid
            plant = raw_plant
            multitask_source = "model_multitask_valid"

        elif len(possible_plants) > 1:
            # Ambiguous → choose based on plant probability
            scores = {
                p: plant_probabilities[artifacts.plant_labels.index(p)]
                for p in possible_plants
                if p in artifacts.plant_labels
            }
            plant = max(scores, key=scores.get) if scores else raw_plant
            multitask_source = "resolved_by_probability"

        else:
            # fallback
            plant = raw_plant
            multitask_source = "fallback_model"

        probabilities = disease_probabilities

    else:
        raise ValueError("Model must be multitask")

    # =============================
    # VALIDATION
    # =============================
    possible_diseases = _get_possible_diseases(artifacts, plant)
    is_valid = _is_disease_valid_for_plant(artifacts, plant, disease)

    # =============================
    # CONFIDENCE QUALITY
    # =============================
    if confidence >= CONFIDENCE_QUALITY_THRESHOLD:
        confidence_quality = "high"
    elif confidence >= MIN_CONFIDENCE_THRESHOLD:
        confidence_quality = "medium"
    else:
        confidence_quality = "low"

    # =============================
    # TOP K PREDICTIONS
    # =============================
    top_indices = np.argsort(probabilities)[::-1][:top_k]

    top_predictions = [
        {
            "label": artifacts.class_names[int(idx)],
            "confidence": float(probabilities[int(idx)]),
            "is_valid_for_plant": _is_disease_valid_for_plant(
                artifacts, plant, artifacts.class_names[int(idx)]
            ),
        }
        for idx in top_indices
    ]

    # =============================
    # OPTIONAL DEBUG (hapus di production)
    # =============================
    print("RAW PLANT:", raw_plant)
    print("FINAL PLANT:", plant)
    print("DISEASE:", disease)
    print("CONFIDENCE:", confidence)
    print("SOURCE:", multitask_source)
    print("POSSIBLE PLANTS:", possible_plants)

    # =============================
    # FINAL OUTPUT
    # =============================
    return {
        "plant": plant,
        "disease": disease,
        "confidence": round(confidence, 4),
        "confidence_quality": confidence_quality,
        "is_confident": confidence >= MIN_CONFIDENCE_THRESHOLD,
        "valid": is_valid,
        "plant_candidates": possible_plants,
        "multitask_source": multitask_source,
        "possible_diseases": possible_diseases,
        "top_3_predictions": top_predictions,
    }