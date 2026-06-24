from django.urls import path
from .views import (
    TransactionListCreateView, TransactionDetailView,
    TransactionStatsView, TransactionExportView
)

urlpatterns = [
    # specific paths MUST come before <int:pk>
    path('transactions/stats/',    TransactionStatsView.as_view(),      name='transaction-stats'),
    path('transactions/export/',   TransactionExportView.as_view(),     name='transaction-export'),
    path('transactions/',          TransactionListCreateView.as_view(), name='transaction-list'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(),     name='transaction-detail'),
]
