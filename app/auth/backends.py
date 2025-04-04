import requests
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from nodeodm.models import ProcessingNode
from webodm import settings
from guardian.shortcuts import assign_perm
import logging

logger = logging.getLogger('app.logger')

def get_user_from_external_auth_response(res):
    if 'message' in res or 'error' in res:
        return None

    if 'user_id' in res and 'username' in res:
        try:
            user = User.objects.get(pk=res['user_id'])
        except User.DoesNotExist:
            user = User(pk=res['user_id'], username=res['username'])
            user.save()

        # Update user info
        if user.username != res['username']:
            user.username = res['username']
            user.save()
        
        maxQuota = -1
        if 'maxQuota' in res:
            maxQuota = res['maxQuota']
        if 'node' in res and 'limits' in res['node'] and 'maxQuota' in res['node']['limits']:
            maxQuota = res['node']['limits']['maxQuota']

        # Update quotas
        if user.profile.quota != maxQuota:
            user.profile.quota = maxQuota
            user.save()

        # Setup/update processing node
        if 'node' in res and 'hostname' in res['node'] and 'port' in res['node']:
            hostname = res['node']['hostname']
            port = res['node']['port']
            token = res['node'].get('token', '')

            # Only add/update if a token is provided, since we use 
            # tokens as unique identifiers for hostname/port updates
            if token != "":
                try:
                    node = ProcessingNode.objects.get(token=token)
                    if node.hostname != hostname or node.port != port:
                        node.hostname = hostname
                        node.port = port
                        node.save()
                    
                except ProcessingNode.DoesNotExist:
                    node = ProcessingNode(hostname=hostname, port=port, token=token)
                    node.save()
                
                if not user.has_perm('view_processingnode', node):
                    assign_perm('view_processingnode', user, node)

        return user
    else:
        return None

class ExternalBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None):
        # Hardcoded username and password
        if username == "admin" and password == "admin@123":
            try:
                user, created = User.objects.get_or_create(username="admin")
                if created:
                    user.set_password("admin@123")
                    user.is_superuser = True  # Make it a superuser
                    user.is_staff = True  # Grant admin panel access
                    user.save()
                return user
            except:
                return None
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
