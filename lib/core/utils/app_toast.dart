import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shivam_electricals/core/theme/app_colors.dart';

class AppToast {
  static void success(String message) => _show(message, AppColors.success);

  static void error(String message) => _show(message, AppColors.error);

  static void _show(String message, Color color) {
    Get.rawSnackbar(
      message: message,
      backgroundColor: color,
      margin: const EdgeInsets.all(12),
      borderRadius: 8,
      duration: const Duration(seconds: 3),
      snackPosition: SnackPosition.BOTTOM,
    );
  }
}
