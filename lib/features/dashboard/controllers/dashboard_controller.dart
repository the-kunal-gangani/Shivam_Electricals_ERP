import 'package:shivam_electricals/core/base/base_controller.dart';
import 'package:shivam_electricals/core/session/auth_user.dart';
import 'package:shivam_electricals/core/session/session_service.dart';
import 'package:shivam_electricals/features/auth/data/auth_repository.dart';

class DashboardController extends BaseController {
  DashboardController(this._session, this._auth);

  final SessionService _session;
  final AuthRepository _auth;

  AuthUser? get user => _session.user.value;

  Future<void> logout() async {
    await perform(() => _auth.logout(_session.refreshToken), showError: false);
    await _session.clear();
  }
}
