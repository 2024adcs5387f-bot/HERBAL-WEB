# Chatbot Backend (Django + DRF)

Django REST API that extracts symptoms from free text, predicts likely diseases, recommends herbs, and returns precautions.

## Endpoints

- POST `/api/chat/`
- GET `/api/herbs/{disease}/`
- GET `/api/precautions/{disease}/`

## Quickstart

1. Create and activate a virtual environment

   ```bash
   python -m venv .venv
   .venv\\Scripts\\activate
   ```

2. Install dependencies

   ```bash
   pip install -r requirements.txt
   ```

3. Add your data files to `data/` (leave a space where you will put your prebuilt model files):

   - all_unique_symptoms.pkl  
   - df_precaution_cleaned.csv  
   - disease_symptom_map.pkl  
   - herb_symptom_map.pkl  
   - post_info_map.pkl  

4. Run the server

   ```bash
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```

## Example Requests

- Chat

  ```bash
  curl -X POST http://localhost:8000/api/chat/ \
    -H "Content-Type: application/json" \
    -d '{"message":"I feel weak and have chills with fever"}'
  ```

  Example response
  ```json
  {
    "normalized_symptoms": ["weakness", "chills", "fever"],
    "possible_diseases": ["Malaria", "Typhoid"],
    "recommended_herbs": ["Neem", "Aloe Vera"],
    "precautions": ["Sleep under mosquito nets", "Stay hydrated"]
  }
  ```

- Herbs for a disease

  ```bash
  curl http://localhost:8000/api/herbs/Malaria/
  ```

- Precautions for a disease

  ```bash
  curl http://localhost:8000/api/precautions/Malaria/
  ```

## Configuration

- Set `DATA_DIR` env var to point to your data folder (defaults to `data/`).
- `DEBUG=1` for development.

## Notes

- If NLTK corpora are missing, lemmatization gracefully falls back to no-op.
- Fuzzy matching uses RapidFuzz `WRatio` to map tokens to known symptoms.
