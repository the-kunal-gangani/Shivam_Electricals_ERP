import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shivam_electricals/app/routes/app_pages.dart';
import 'package:shivam_electricals/app/routes/app_routes.dart';
import 'package:shivam_electricals/core/config/env.dart';
import 'package:shivam_electricals/core/theme/app_theme.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: Env.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      initialRoute: AppRoutes.splash,
      getPages: AppPages.pages,
    );
  }
}
