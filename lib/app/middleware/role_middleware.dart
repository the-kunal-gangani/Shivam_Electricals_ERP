import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shivam_electricals/app/routes/app_routes.dart';
import 'package:shivam_electricals/core/session/session_service.dart';
import 'package:shivam_electricals/core/session/user_role.dart';

class RoleMiddleware extends GetMiddleware {
  RoleMiddleware(this.allowed);

  final UserRole allowed;

  @override
  int? get priority => 2;

  @override
  RouteSettings? redirect(String? route) {
    final role = Get.find<SessionService>().role;
    if (role == allowed) return null;
    return RouteSettings(name: AppRoutes.homeFor(role));
  }
}
