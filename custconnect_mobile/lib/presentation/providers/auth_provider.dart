import 'package:flutter/material.dart';
import '../../data/models/user_model.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/storage_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _authRepository;
  final StorageService _storageService;
  
  UserModel? _user;
  bool _isLoading = true;
  String? _error;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  AuthProvider(this._authRepository, this._storageService) {
    _checkStatus();
  }

  Future<void> _checkStatus() async {
    _user = await _storageService.getUser();
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _user = await _authRepository.login(email, password);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authRepository.logout();
    _user = null;
    notifyListeners();
  }
}
