import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shivam_electricals/core/base/base_controller.dart';

class StateView extends StatelessWidget {
  const StateView({
    super.key,
    required this.controller,
    required this.builder,
    required this.onRetry,
    this.emptyMessage = 'Nothing here yet.',
  });

  final BaseController controller;
  final Widget Function() builder;
  final VoidCallback onRetry;
  final String emptyMessage;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      switch (controller.status.value) {
        case ViewStatus.idle:
        case ViewStatus.loading:
          return const Center(child: CircularProgressIndicator());
        case ViewStatus.error:
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    controller.errorMessage.value ?? 'Something went wrong.',
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(120, 44),
                    ),
                    onPressed: onRetry,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          );
        case ViewStatus.empty:
          return Center(child: Text(emptyMessage));
        case ViewStatus.success:
          return builder();
      }
    });
  }
}
