import 'package:dio/dio.dart';
import 'package:shivam_electricals/core/network/api_endpoints.dart';
import 'package:shivam_electricals/core/session/session_service.dart';

class AuthInterceptor extends QueuedInterceptor {
  AuthInterceptor({required this.session, required this.plainDio});

  final SessionService session;
  final Dio plainDio;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (options.extra['auth'] != false) {
      final token = session.accessToken;
      if (token != null) options.headers['Authorization'] = 'Bearer $token';
      final storeId = session.activeStoreId.value;
      if (storeId != null) options.headers['X-Store-Id'] = storeId;
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final request = err.requestOptions;
    final skip = request.extra['auth'] == false;

    if (err.response?.statusCode != 401 || skip) {
      return handler.next(err);
    }

    final refresh = session.refreshToken;
    if (refresh == null) {
      await session.clear();
      return handler.next(err);
    }

    final sentToken = (request.headers['Authorization'] as String?)
        ?.replaceFirst('Bearer ', '');

    if (sentToken == session.accessToken) {
      try {
        final response = await plainDio.post<dynamic>(
          ApiEndpoints.refresh,
          data: {'refreshToken': refresh},
        );
        final data =
            (response.data as Map<String, dynamic>)['data']
                as Map<String, dynamic>;
        await session.updateTokens(
          data['accessToken'] as String,
          data['refreshToken'] as String,
        );
      } on DioException {
        await session.clear();
        return handler.next(err);
      } on TypeError {
        await session.clear();
        return handler.next(err);
      }
    }

    try {
      request.headers['Authorization'] = 'Bearer ${session.accessToken}';
      final retried = await plainDio.fetch<dynamic>(request);
      handler.resolve(retried);
    } on DioException catch (error) {
      handler.next(error);
    }
  }
}
