import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shivam_electricals/core/config/env.dart';
import 'package:shivam_electricals/core/theme/app_colors.dart';
import 'package:shivam_electricals/features/splash/controllers/splash_controller.dart';

class SplashView extends GetView<SplashController> {
  const SplashView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.bolt, size: 72, color: Colors.white),
            const SizedBox(height: 16),
            Text(
              Env.appName,
              style: Theme.of(context).textTheme.headlineSmall
                  ?.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }
}
