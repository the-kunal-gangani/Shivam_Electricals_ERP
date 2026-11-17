import 'package:dio/dio.dart';
import 'package:shivam_electricals/core/config/env.dart';
import 'package:shivam_electricals/core/network/api_exception.dart';
import 'package:shivam_electricals/core/network/auth_interceptor.dart';
import 'package:shivam_electricals/core/session/session_service.dart';

class ApiClient {
  ApiClient(SessionService session) {
    final options = BaseOptions(
      baseUrl: Env.apiBaseUrl,
      connectTimeout: Env.connectTimeout,
      receiveTimeout: Env.receiveTimeout,
      headers: {'Accept': 'application/json'},
    );
    final plainDio = Dio(options);
    _dio = Dio(options)
      ..interceptors.add(AuthInterceptor(session: session, plainDio: plainDio));
  }

  late final Dio _dio;

  Future<T> get<T>(
    String path, {
    Map<String, dynamic>? query,
    bool auth = true,
    required T Function(dynamic data) parse,
  }) {
    return _send(
      () => _dio.get<dynamic>(
        path,
        queryParameters: query,
        options: Options(extra: {'auth': auth}),
      ),
      parse,
    );
  }

  Future<T> post<T>(
    String path, {
    Object? body,
    bool auth = true,
    required T Function(dynamic data) parse,
  }) {
    return _send(
      () => _dio.post<dynamic>(
        path,
        data: body,
        options: Options(extra: {'auth': auth}),
      ),
      parse,
    );
  }

  Future<T> put<T>(
    String path, {
    Object? body,
    required T Function(dynamic data) parse,
  }) {
    return _send(() => _dio.put<dynamic>(path, data: body), parse);
  }

  Future<T> patch<T>(
    String path, {
    Object? body,
    required T Function(dynamic data) parse,
  }) {
    return _send(() => _dio.patch<dynamic>(path, data: body), parse);
  }

  Future<T> delete<T>(String path, {required T Function(dynamic data) parse}) {
    return _send(() => _dio.delete<dynamic>(path), parse);
  }

  Future<T> _send<T>(
    Future<Response<dynamic>> Function() call,
    T Function(dynamic data) parse,
  ) async {
    try {
      final response = await call();
      final body = response.data;
      final data = body is Map<String, dynamic> ? body['data'] : body;
      return parse(data);
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }
}
