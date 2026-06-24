from django.urls import path
from .views import RegisterView, MeView, ChangePasswordView, AvatarUploadView

urlpatterns = [
    path('register/',        RegisterView.as_view(),       name='register'),
    path('me/',              MeView.as_view(),              name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('avatar/',          AvatarUploadView.as_view(),   name='avatar'),
]
