import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shivam_electricals/features/dashboard/controllers/dashboard_controller.dart';

class StaffHomeView extends GetView<DashboardController> {
  const StaffHomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Staff Dashboard'),
        actions: [
          IconButton(
            onPressed: controller.logout,
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Center(child: Text('Welcome, ${controller.user?.name ?? ''}')),
    );
  }
}
