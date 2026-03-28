import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/api_constants.dart';
import '../models/user_model.dart';

class StorageService {
  final _secureStorage = const FlutterSecureStorage();

  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: ApiConstants.tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: ApiConstants.tokenKey);
  }

  Future<void> saveUser(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(ApiConstants.userKey, jsonEncode(user.toJson()));
  }

  Future<UserModel?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString(ApiConstants.userKey);
    if (userStr != null) {
      return UserModel.fromJson(jsonDecode(userStr));
    }
    return null;
  }

  Future<void> clearAll() async {
    await _secureStorage.delete(key: ApiConstants.tokenKey);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(ApiConstants.userKey);
  }
}
