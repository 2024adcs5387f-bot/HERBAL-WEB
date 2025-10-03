from django.urls import path
from .views import ChatView, HerbsByDiseaseView, PrecautionsByDiseaseView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='chat'),
    path('herbs/<str:disease>/', HerbsByDiseaseView.as_view(), name='herbs-by-disease'),
    path('precautions/<str:disease>/', PrecautionsByDiseaseView.as_view(), name='precautions-by-disease'),
]
