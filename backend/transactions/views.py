import csv
from django.http import HttpResponse
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.throttling import ScopedRateThrottle
from django.contrib.auth.models import User
from .models import Transaction, Profile
from .serializers import (
    RegisterSerializer, UserSerializer, UserUpdateSerializer,
    ChangePasswordSerializer, TransactionSerializer, ProfileSerializer,
    ProfileUpdateSerializer,
)


# ─── AUTH ─────────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes   = [ScopedRateThrottle]
    throttle_scope     = 'login'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': 'Account created successfully.', 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # also update bio if provided
        bio = request.data.get('bio')
        if bio is not None:
            profile, _ = Profile.objects.get_or_create(user=request.user)
            profile.bio = bio
            profile.save()
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes   = [ScopedRateThrottle]
    throttle_scope     = 'login'

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password changed successfully.'})


class AvatarUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        return self.post(request)


# ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class   = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs        = Transaction.objects.filter(user=self.request.user)
        search    = self.request.query_params.get('search')
        category  = self.request.query_params.get('category')
        status_p  = self.request.query_params.get('status')
        date_from = self.request.query_params.get('date_from')
        date_to   = self.request.query_params.get('date_to')
        sort      = self.request.query_params.get('sort', '-created_at')

        if search:
            qs = qs.filter(
                Q(from_account__icontains=search) |
                Q(to_account__icontains=search) |
                Q(note__icontains=search)
            )
        if category:  qs = qs.filter(category=category)
        if status_p:  qs = qs.filter(status=status_p)
        if date_from: qs = qs.filter(created_at__date__gte=date_from)
        if date_to:   qs = qs.filter(created_at__date__lte=date_to)

        allowed_sorts = ['created_at', '-created_at', 'amount', '-amount']
        if sort in allowed_sorts:
            qs = qs.order_by(sort)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # disable pagination for full list (frontend handles display)
    def list(self, request, *args, **kwargs):
        page_param = request.query_params.get('page')
        if page_param:
            return super().list(request, *args, **kwargs)
        # no page param → return all
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class TransactionStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.db.models import Sum
        from django.utils import timezone
        import datetime

        qs = Transaction.objects.filter(user=request.user)

        # monthly breakdown — last 6 months
        monthly = []
        today = timezone.now().date()
        for i in range(5, -1, -1):
            # go back by month accurately
            month = (today.replace(day=1) - datetime.timedelta(days=1)).replace(day=1) if i == 0 else today.replace(day=1)
            year  = today.year
            mon   = today.month - i
            while mon <= 0:
                mon  += 12
                year -= 1
            label = datetime.date(year, mon, 1).strftime('%b %Y')
            total = qs.filter(created_at__year=year, created_at__month=mon).aggregate(t=Sum('amount'))['t'] or 0
            monthly.append({'month': label, 'total': float(total)})

        by_category = []
        for cat_key, cat_label in Transaction.CATEGORY_CHOICES:
            total = qs.filter(category=cat_key).aggregate(t=Sum('amount'))['t'] or 0
            count = qs.filter(category=cat_key).count()
            by_category.append({'category': cat_label, 'key': cat_key, 'total': float(total), 'count': count})

        by_status = []
        for st_key, st_label in Transaction.STATUS_CHOICES:
            count = qs.filter(status=st_key).count()
            by_status.append({'status': st_label, 'key': st_key, 'count': count})

        # net balance — salary minus expense
        salary  = qs.filter(category='salary').aggregate(t=Sum('amount'))['t'] or 0
        expense = qs.filter(category='expense').aggregate(t=Sum('amount'))['t'] or 0

        return Response({
            'total_count':  qs.count(),
            'total_volume': float(qs.aggregate(t=Sum('amount'))['t'] or 0),
            'net_balance':  float(salary) - float(expense),
            'monthly':      monthly,
            'by_category':  by_category,
            'by_status':    by_status,
        })


class TransactionExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Transaction.objects.filter(user=request.user)
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="transactions.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'From', 'To', 'Amount', 'Category', 'Status', 'Note', 'Date'])
        for tx in qs:
            writer.writerow([
                tx.id, tx.from_account, tx.to_account, tx.amount,
                tx.category, tx.status, tx.note,
                tx.created_at.strftime('%Y-%m-%d %H:%M')
            ])
        return response
