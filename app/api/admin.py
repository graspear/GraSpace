# Importing necessary modules from Django and Django REST framework
from django.contrib.auth.models import User, Group  # Built-in models for users and groups
from app.models import Profile  # Custom profile model
from rest_framework import serializers, viewsets, generics, status, exceptions
from rest_framework.decorators import action  # To add custom actions to viewsets
from rest_framework.permissions import IsAdminUser  # Restricts access to admin users
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.hashers import make_password  # For securely hashing passwords
from app import models  # Local models (if more needed beyond Profile)

# Serializer for the User model
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'  # Serialize all fields in the User model

# ViewSet for managing User objects - Admin-only
class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]  # Only admin users can access this view

    # Custom queryset filtering based on email (optional)
    def get_queryset(self):
        queryset = User.objects.all()
        email = self.request.query_params.get('email', None)
        if email is not None:
            queryset = queryset.filter(email=email)
        return queryset

    # Custom create method to hash the password before saving the user
    def create(self, request):
        data = request.data.copy()
        password = data.get('password')
        data['password'] = make_password(password)  # Securely hash the password
        user = UserSerializer(data=data)
        user.is_valid(raise_exception=True)
        user.save()
        return Response(user.data, status=status.HTTP_201_CREATED)

# Serializer for the Group model
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'  # Serialize all fields in the Group model

# ViewSet for managing Group objects - Admin-only
class AdminGroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [IsAdminUser]

    # Custom queryset filtering based on group name (optional)
    def get_queryset(self):
        queryset = Group.objects.all()
        name = self.request.query_params.get('name', None)
        if name is not None:
            queryset = queryset.filter(name=name)
        return queryset

# Serializer for the custom Profile model
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        exclude = ('id', )  # Exclude the 'id' field from serialization
        read_only_fields = ('user', )  # 'user' field should not be editable through this serializer

# ViewSet for managing Profile objects - Admin-only
class AdminProfileViewSet(viewsets.ModelViewSet):
    pagination_class = None  # No pagination for this viewset
    serializer_class = ProfileSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'user'  # Lookup profile by user field instead of default 'pk'

    def get_queryset(self):
        return Profile.objects.all()

    # Custom action to update the quota deadline for a user’s profile
    @action(detail=True, methods=['post'])
    def update_quota_deadline(self, request, user=None):
        try:
            hours = float(request.data.get('hours', ''))  # Convert hours to float
            if hours < 0:
                raise ValueError("hours must be >= 0")  # Validation
        except ValueError as e:
            raise exceptions.ValidationError(str(e))  # Raise DRF validation error

        try:
            p = Profile.objects.get(user=user)  # Get the profile object using the user identifier
        except ObjectDoesNotExist:
            raise exceptions.NotFound()  # If profile not found, return 404

        # Call a method on the profile model to update the deadline and return result
        return Response({'deadline': p.set_quota_deadline(hours)}, status=status.HTTP_200_OK)
