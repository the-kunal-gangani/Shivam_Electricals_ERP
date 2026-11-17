import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shivam_electricals/app/routes/app_routes.dart';
import 'package:shivam_electricals/core/base/base_controller.dart';
import 'package:shivam_electricals/core/session/session_service.dart';
import 'package:shivam_electricals/features/auth/data/auth_repository.dart';

class LoginController extends BaseController {
  LoginController(this._auth, this._session);

  final AuthRepository _auth;
  final SessionService _session;

  final formKey = GlobalKey<FormState>();
  final identifierController = TextEditingController();
  final passwordController = TextEditingController();
  final RxBool obscure = true.obs;

  void toggleObscure() => obscure.toggle();

  String? validateIdentifier(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Enter your email or phone';
    }
    return null;
  }

  String? validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'Enter your password';
    return null;
  }

  Future<void> submit() async {
    if (!(formKey.currentState?.validate() ?? false)) return;

    final result = await perform(
      () => _auth.login(
        identifier: identifierController.text.trim(),
        password: passwordController.text,
      ),
    );
    if (result == null) return;

    await _session.start(
      authUser: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    );
    Get.offAllNamed(AppRoutes.homeFor(result.user.role));
  }

  @override
  void onClose() {
    identifierController.dispose();
    passwordController.dispose();
    super.onClose();
  }
}
