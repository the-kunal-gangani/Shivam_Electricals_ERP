import 'package:get/get.dart';
import 'package:shivam_electricals/core/network/api_exception.dart';
import 'package:shivam_electricals/core/utils/app_toast.dart';

enum ViewStatus { idle, loading, success, empty, error }

abstract class BaseController extends GetxController {
  final Rx<ViewStatus> status = ViewStatus.idle.obs;
  final RxnString errorMessage = RxnString();
  final RxBool busy = false.obs;

  Future<void> load(
    Future<void> Function() task, {
    bool Function()? isEmpty,
  }) async {
    status.value = ViewStatus.loading;
    errorMessage.value = null;
    try {
      await task();
      status.value = (isEmpty?.call() ?? false)
          ? ViewStatus.empty
          : ViewStatus.success;
    } catch (error) {
      errorMessage.value = messageOf(error);
      status.value = ViewStatus.error;
    }
  }

  Future<T?> perform<T>(
    Future<T> Function() action, {
    String? successMessage,
    bool showError = true,
  }) async {
    if (busy.value) return null;
    busy.value = true;
    try {
      final result = await action();
      if (successMessage != null) AppToast.success(successMessage);
      return result;
    } catch (error) {
      if (showError) AppToast.error(messageOf(error));
      return null;
    } finally {
      busy.value = false;
    }
  }

  String messageOf(Object error) {
    return error is ApiException ? error.message : 'Something went wrong.';
  }
}
