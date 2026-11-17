import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shivam_electricals/app/routes/app_routes.dart';
import 'package:shivam_electricals/core/session/session_service.dart';

class AuthMiddleware extends GetMiddleware {
  @override
  int? get priority => 1;

  @override
  RouteSettings? redirect(String? route) {
    final loggedIn = Get.find<SessionService>().isLoggedIn;
    return loggedIn ? null : const RouteSettings(name: AppRoutes.login);
  }
}
