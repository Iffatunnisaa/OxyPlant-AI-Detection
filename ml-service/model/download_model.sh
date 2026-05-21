#!/usr/bin/env bash

set -euo pipefail

echo "Place your trained TensorFlow model and artifacts under model/."
echo "Expected paths: model/final_model_tf, model/label_mappings.json, model/scaler.joblib, model/target_encoder.joblib"
