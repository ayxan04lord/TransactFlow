from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.user.username}'s profile"


class Transaction(models.Model):
    CATEGORY_CHOICES = [
        ('salary',   'Salary'),
        ('expense',  'Expense'),
        ('transfer', 'Transfer'),
        ('other',    'Other'),
    ]
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    from_account = models.CharField(max_length=100)
    to_account   = models.CharField(max_length=100)
    amount       = models.DecimalField(max_digits=12, decimal_places=2)
    category     = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    note         = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.from_account} → {self.to_account}: ${self.amount}"
