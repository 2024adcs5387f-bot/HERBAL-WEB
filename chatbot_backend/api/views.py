from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import logging

from .services.predictor import PredictorService

logger = logging.getLogger(__name__)
predictor = PredictorService(data_dir=settings.DATA_DIR)

@method_decorator(csrf_exempt, name="dispatch")
class ChatView(APIView):
    def post(self, request):
        try:
            # Primary: DRF-parsed JSON
            message = None
            try:
                if hasattr(request, 'data') and isinstance(request.data, dict):
                    message = request.data.get('message')
            except Exception:
                # DRF parse error; fall back to raw body
                pass

            if not message:
                # Try raw body as JSON
                try:
                    import json
                    body = request.body.decode('utf-8') if hasattr(request, 'body') else ''
                    if body:
                        obj = json.loads(body)
                        if isinstance(obj, dict):
                            message = obj.get('message')
                except Exception:
                    pass

            if not message:
                # Try form-encoded fallback
                try:
                    message = request.POST.get('message')
                except Exception:
                    pass

            if not message:
                # Try query param as last resort
                try:
                    message = request.GET.get('message')
                except Exception:
                    pass

            if not message or not isinstance(message, str):
                return Response({'detail': 'message is required'}, status=status.HTTP_400_BAD_REQUEST)

            normalized_symptoms = predictor.extract_symptoms(message)
            diseases_scored = predictor.predict_diseases(normalized_symptoms)
            disease_names = [d.get('name') for d in diseases_scored]
            herbs_scored = predictor.recommend_herbs(disease_names, fallback_from_symptoms=normalized_symptoms)
            precautions_grouped = predictor.get_precautions_grouped(diseases_scored)
            posts_scored = predictor.retrieve_posts(normalized_symptoms)

            # Legacy flat fields for backward compatibility
            flat_precautions = []
            seen = set()
            for g in precautions_grouped:
                for p in g.get('precautions', []):
                    if p not in seen:
                        seen.add(p)
                        flat_precautions.append(p)

            return Response({
                'normalized_symptoms': normalized_symptoms,
                # New structured outputs
                'possible_diseases_scored': diseases_scored,
                'recommended_herbs_scored': herbs_scored,
                'precautions_by_disease': precautions_grouped,
                # Legacy fields
                'possible_diseases': disease_names,
                'recommended_herbs': [h.get('name') for h in herbs_scored],
                'precautions': flat_precautions,
                'posts_scored': posts_scored,
            })
        except Exception as e:
            logger.exception("/api/chat error")
            return Response({'detail': 'Internal error while processing chat'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name="dispatch")
class HerbsByDiseaseView(APIView):
    def get(self, request, disease: str):
        # Try exact, then case-insensitive match
        herbs = predictor.recommend_herbs([disease])
        if not herbs:
            alt = next((k for k in predictor.disease_to_herbs.keys() if k.lower() == disease.lower()), None)
            if alt:
                herbs = predictor.recommend_herbs([alt])
        return Response({'disease': disease, 'herbs': herbs})


@method_decorator(csrf_exempt, name="dispatch")
class PrecautionsByDiseaseView(APIView):
    def get(self, request, disease: str):
        precautions = predictor.get_precautions([disease])
        if not precautions:
            # Case-insensitive fallback
            alt = next((k for k in predictor.disease_precautions.keys() if k.lower() == disease.lower()), None)
            if alt:
                precautions = predictor.get_precautions([alt])
        return Response({'disease': disease, 'precautions': precautions})
