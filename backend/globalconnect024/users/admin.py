from django.contrib import admin 
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import CustomUser , AffiliateCertificate

@admin.register(AffiliateCertificate)
class AffiliateCertificateAdmin(admin.ModelAdmin):
    list_display = ('certificate_number', 'full_name', 'issued_date', 'is_valid', 'used_by')
    search_fields = ('certificate_number', 'full_name', 'used_by__username', 'used_by__email')
    list_filter = ('is_valid', 'issued_date')
    readonly_fields = ('issued_date',)

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active', 'groups')

    fieldsets = (
        (_('Login Info'), {'fields': ('username', 'password')}),
        (_('Personal Info'), {'fields': ('first_name', 'last_name', 'email', 'role', 'country', 'city', 'promotion_methods','certificate_number')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important Dates'), {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'role','certificate_number', 'password1', 'password2','is_staff','is_superuser','is_active'),
        }),
    )
    def save_model(self, request, obj, form, change):
     if not change:  # Creating new user
        password1 = form.cleaned_data.get("password1")
        if password1:
           obj.set_password(password1)
     super(CustomUserAdmin, self).save_model(request, obj, form, change)


    def get_fieldsets(self, request, obj=None):
        """Hide certificate_number for non-affiliates."""
        fieldsets =super().get_fieldsets(request, obj)
        if obj and obj.role != 'user':#role 'user =affiliate
            # Remove certificate_number field
            new_fieldsets = []
            for name, opts in fieldsets:
                fields = list(opts.get('fields', ()))
                if 'certificate_number' in fields:
                    fields.remove('certificate_number')
                new_fieldsets.append((name, {'fields': fields}))
            return new_fieldsets
        return fieldsets
   