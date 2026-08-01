from rest_framework.response import Response

def success_response(data, message='', status=200):
    return Response({'status': 'success', 'data': data, 'message': message}, status=status)

def error_response(message, code='ERROR', status=400):
    return Response({'status': 'error', 'code': code, 'message': message}, status=status)
