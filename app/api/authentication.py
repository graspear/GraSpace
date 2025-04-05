# Importing base JWT authentication class from DRF JWT package
from rest_framework_jwt.authentication import BaseJSONWebTokenAuthentication

# Custom JWT Authentication class to extract token from query string
class JSONWebTokenAuthenticationQS(BaseJSONWebTokenAuthentication):
    
    # Override the method to fetch JWT token from the query parameters (e.g., ?jwt=TOKEN)
    def get_jwt_value(self, request):
         return request.query_params.get('jwt')  # Retrieves the 'jwt' token from the URL query parameters
