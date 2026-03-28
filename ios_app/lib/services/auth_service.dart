import 'dart:convert';
import '../api/api_service.dart';
import '../models/user.dart';
import '../config/constants.dart';
import '../utils/secure_storage.dart';

class AuthService {
  final ApiService _api = ApiService();
  final SecureStorage _storage = SecureStorage();

  Future<User?> login(String email, String password) async {
    final res = await _api.post('/auth/login', {'email': email, 'password': password});
    await _storage.write(Constants.tokenKey, res['data']['token']);
    await _storage.write(Constants.userKey, jsonEncode(res['data']['user']));
    return User.fromJson(res['data']['user']);
  }

  Future<void> logout() async => await _storage.clearAll();

  Future<User?> getSession() async {
    final token = await _storage.read(Constants.tokenKey);
    final userStr = await _storage.read(Constants.userKey);
    if (token != null && userStr != null) return User.fromJson(jsonDecode(userStr));
    return null;
  }
}
