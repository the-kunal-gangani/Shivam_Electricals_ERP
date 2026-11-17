import 'dart:convert';

import 'package:get/get.dart';
import 'package:shivam_electricals/core/session/auth_user.dart';
import 'package:shivam_electricals/core/session/permission.dart';
import 'package:shivam_electricals/core/session/user_role.dart';
import 'package:shivam_electricals/core/storage/secure_storage_service.dart';

class SessionService extends GetxService {
  SessionService(this._storage);

  final SecureStorageService _storage;

  final Rxn<AuthUser> user = Rxn<AuthUser>();
  final RxnString activeStoreId = RxnString();

  String? _accessToken;
  String? _refreshToken;

  String? get accessToken => _accessToken;
  String? get refreshToken => _refreshToken;
  bool get isLoggedIn => user.value != null && _accessToken != null;
  UserRole? get role => user.value?.role;
  bool get isAdmin => role == UserRole.admin;

  bool can(Permission permission) {
    final current = user.value;
    if (current == null) return false;
    if (current.role == UserRole.admin) return true;
    return current.permissions.contains(permission.key);
  }

  Future<void> restore() async {
    final access = await _storage.read(StorageKeys.accessToken);
    final refresh = await _storage.read(StorageKeys.refreshToken);
    final rawUser = await _storage.read(StorageKeys.user);
    final storeId = await _storage.read(StorageKeys.activeStoreId);

    if (access == null || refresh == null || rawUser == null) return;

    try {
      final restored = AuthUser.fromJson(
        jsonDecode(rawUser) as Map<String, dynamic>,
      );
      _accessToken = access;
      _refreshToken = refresh;
      activeStoreId.value =
          storeId ??
          (restored.storeIds.isEmpty ? null : restored.storeIds.first);
      user.value = restored;
    } on FormatException {
      await clear();
    } on TypeError {
      await clear();
    }
  }

  Future<void> start({
    required AuthUser authUser,
    required String accessToken,
    required String refreshToken,
  }) async {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    await _storage.write(StorageKeys.accessToken, accessToken);
    await _storage.write(StorageKeys.refreshToken, refreshToken);
    await _storage.write(StorageKeys.user, jsonEncode(authUser.toJson()));

    final firstStore = authUser.storeIds.isEmpty
        ? null
        : authUser.storeIds.first;
    activeStoreId.value = firstStore;
    if (firstStore != null) {
      await _storage.write(StorageKeys.activeStoreId, firstStore);
    }
    user.value = authUser;
  }

  Future<void> updateTokens(String access, String refresh) async {
    _accessToken = access;
    _refreshToken = refresh;
    await _storage.write(StorageKeys.accessToken, access);
    await _storage.write(StorageKeys.refreshToken, refresh);
  }

  Future<void> updateUser(AuthUser fresh) async {
    if (user.value?.role != fresh.role) {
      await clear();
      return;
    }
    await _storage.write(StorageKeys.user, jsonEncode(fresh.toJson()));
    user.value = fresh;
  }

  Future<void> setActiveStore(String? storeId) async {
    activeStoreId.value = storeId;
    if (storeId == null) {
      await _storage.delete(StorageKeys.activeStoreId);
    } else {
      await _storage.write(StorageKeys.activeStoreId, storeId);
    }
  }

  Future<void> clear() async {
    _accessToken = null;
    _refreshToken = null;
    activeStoreId.value = null;
    await _storage.clearAll();
    user.value = null;
  }
}
