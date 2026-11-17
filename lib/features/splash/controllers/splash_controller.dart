import 'package:get/get.dart';
import 'package:shivam_electricals/app/routes/app_routes.dart';
import 'package:shivam_electricals/core/session/session_service.dart';
import 'package:shivam_electricals/features/auth/data/auth_repository.dart';

class SplashController extends GetxController {
  SplashController(this._session, this._auth);

  final SessionService _session;
  final AuthRepository _auth;

  @override
  void onReady() {
    super.onReady();
    _start();
  }

  Future<void> _start() async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    final loggedIn = _session.isLoggedIn;
    Get.offAllNamed(AppRoutes.homeFor(loggedIn ? _session.role : null));
    if (loggedIn) _refreshProfile();
  }

  Future<void> _refreshProfile() async {
    try {
      final fresh = await _auth.me();
      await _session.updateUser(fresh);
    } on Exception {
      // Cached session remains usable when the profile endpoint is offline.
    }
  }
}
