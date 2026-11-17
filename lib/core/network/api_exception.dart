import 'package:dio/dio.dart';

enum ApiErrorType {
  network,
  timeout,
  unauthorized,
  forbidden,
  notFound,
  validation,
  conflict,
  server,
  unknown,
}

class ApiException implements Exception {
  const ApiException({
    required this.type,
    required this.message,
    this.statusCode,
    this.fieldErrors = const {},
  });

  final ApiErrorType type;
  final String message;
  final int? statusCode;
  final Map<String, String> fieldErrors;

  factory ApiException.fromDio(DioException error) {
    if (error.error is ApiException) return error.error! as ApiException;

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const ApiException(
          type: ApiErrorType.timeout,
          message: 'The server is taking too long. Please try again.',
        );
      case DioExceptionType.connectionError:
        return const ApiException(
          type: ApiErrorType.network,
          message: 'No internet connection.',
        );
      case DioExceptionType.badResponse:
        return ApiException._fromResponse(error.response);
      default:
        return const ApiException(
          type: ApiErrorType.unknown,
          message: 'Something went wrong.',
        );
    }
  }

  factory ApiException._fromResponse(Response<dynamic>? response) {
    final status = response?.statusCode ?? 0;
    final body = response?.data;
    var message = 'Something went wrong.';
    final fields = <String, String>{};

    if (body is Map<String, dynamic>) {
      message = body['message'] as String? ?? message;
      final errors = body['errors'];
      if (errors is Map) {
        errors.forEach((key, value) {
          fields[key.toString()] = value.toString();
        });
      }
    }

    return ApiException(
      type: _typeFor(status),
      message: message,
      statusCode: status,
      fieldErrors: fields,
    );
  }

  static ApiErrorType _typeFor(int status) {
    if (status == 401) return ApiErrorType.unauthorized;
    if (status == 403) return ApiErrorType.forbidden;
    if (status == 404) return ApiErrorType.notFound;
    if (status == 409) return ApiErrorType.conflict;
    if (status == 400 || status == 422) return ApiErrorType.validation;
    if (status >= 500) return ApiErrorType.server;
    return ApiErrorType.unknown;
  }

  @override
  String toString() => message;
}
