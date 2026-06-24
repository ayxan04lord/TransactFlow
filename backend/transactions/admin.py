from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Transaction, Profile


class ProfileInline(admin.StackedInline):
    model    = Profile
    can_delete = False
    verbose_name_plural = 'Profile'


class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display   = ('id', 'user', 'from_account', 'to_account', 'amount', 'category', 'status', 'created_at')
    list_filter    = ('category', 'status', 'created_at', 'user')
    search_fields  = ('from_account', 'to_account', 'user__username', 'note')
    ordering       = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    list_editable  = ('status',)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display  = ('user', 'bio')
    search_fields = ('user__username',)
