import 'package:shivam_electricals/core/network/api_client.dart';
import 'package:shivam_electricals/core/network/api_endpoints.dart';
import 'package:shivam_electricals/core/session/auth_user.dart';
import 'package:shivam_electricals/features/auth/data/models/auth_session.dart';

class AuthRepository {
  AuthRepository(this._api);

  final ApiClient _api;

  Future<AuthSession> login({
    required String identifier,
    required String password,
  }) {
    return _api.post<AuthSession>(
      ApiEndpoints.login,
      auth: false,
      body: {'identifier': identifier, 'password': password},
      parse: (data) => AuthSession.fromJson(data as Map<String, dynamic>),
    );
  }

  Future<AuthUser> me() {
    return _api.get<AuthUser>(
      ApiEndpoints.me,
      parse: (data) => AuthUser.fromJson(data as Map<String, dynamic>),
    );
  }

  Future<void> logout(String? refreshToken) {
    return _api.post<void>(
      ApiEndpoints.logout,
      body: {'refreshToken': refreshToken},
      parse: (_) {},
    );
  }
}
