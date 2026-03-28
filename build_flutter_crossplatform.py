import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')

base_dir = r"e:\CustConnect\custconnect_mobile"

# Create pubspec.yaml
create_file(f"{base_dir}/pubspec.yaml", """
name: custconnect_mobile
description: A new Flutter cross-platform project for CustConnect.

publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  http: ^1.2.0
  provider: ^6.1.1
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  go_router: ^13.2.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
""")

# core/constants/api_constants.dart
create_file(f"{base_dir}/lib/core/constants/api_constants.dart", """
class ApiConstants {
  static const String baseUrl = 'https://custconnect-backend-production.up.railway.app/api';
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String currentUserEndpoint = '/auth/me';
  
  static const String tokenKey = 'secure_auth_token';
  static const String userKey = 'shared_pref_user';
}
""")

# core/constants/app_colors.dart
create_file(f"{base_dir}/lib/core/constants/app_colors.dart", """
import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF1E88E5);
  static const Color secondary = Color(0xFF0D47A1);
  static const Color background = Color(0xFFF5F5F5);
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color error = Color(0xFFD32F2F);
  static const Color success = Color(0xFF388E3C);
}
""")

# core/network/api_client.dart
create_file(f"{base_dir}/lib/core/network/api_client.dart", """
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';
import '../../data/services/storage_service.dart';

class ApiClient {
  final StorageService _storageService;

  ApiClient(this._storageService);

  Future<Map<String, String>> _headers() async {
    final token = await _storageService.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> get(String endpoint) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}$endpoint'),
        headers: await _headers(),
      ).timeout(const Duration(seconds: 30));
      return _handleResponse(response);
    } catch (e) {
      throw 'Network error: Make sure you have internet connection.';
    }
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}$endpoint'),
        headers: await _headers(),
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 30));
      return _handleResponse(response);
    } catch (e) {
      throw 'Network error: Make sure you have internet connection.';
    }
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode <= 299) {
      return jsonDecode(response.body);
    } else {
      final decoded = jsonDecode(response.body);
      throw decoded['message'] ?? 'Unknown API Error occurred';
    }
  }
}
""")

# core/theme/app_theme.dart
create_file(f"{base_dir}/lib/core/theme/app_theme.dart", """
import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.background,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }
}
""")

# core/utils/validators.dart
create_file(f"{base_dir}/lib/core/utils/validators.dart", """
class Validators {
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) return 'Email is required';
    if (!value.contains('@')) return 'Invalid email format';
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  }
}
""")

# data/models/user_model.dart
create_file(f"{base_dir}/lib/data/models/user_model.dart", """
class UserModel {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final bool isVerified;
  final List<String> roles;

  const UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.isVerified,
    required this.roles,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final rolesList = json['roles'] as List<dynamic>? ?? [];
    return UserModel(
      id: json['id']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      firstName: json['firstName']?.toString() ?? '',
      lastName: json['lastName']?.toString() ?? '',
      isVerified: json['isVerified'] ?? false,
      roles: rolesList.map((e) => e['name']?.toString() ?? '').toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'firstName': firstName,
    'lastName': lastName,
    'isVerified': isVerified,
    'roles': roles.map((e) => {'name': e}).toList(),
  };
}
""")

# data/services/storage_service.dart
create_file(f"{base_dir}/lib/data/services/storage_service.dart", """
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
""")

# data/repositories/auth_repository.dart
create_file(f"{base_dir}/lib/data/repositories/auth_repository.dart", """
import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../models/user_model.dart';
import '../services/storage_service.dart';

class AuthRepository {
  final ApiClient _apiClient;
  final StorageService _storageService;

  AuthRepository(this._apiClient, this._storageService);

  Future<UserModel> login(String emailOrUsername, String password) async {
    final response = await _apiClient.post(ApiConstants.loginEndpoint, {
      'email': emailOrUsername,
      'password': password,
    });
    
    if (response['success'] == true) {
      final token = response['data']['token'];
      final userJson = response['data']['user'];
      
      final user = UserModel.fromJson(userJson);
      await _storageService.saveToken(token);
      await _storageService.saveUser(user);
      return user;
    } else {
      throw response['message'] ?? 'Login Failed';
    }
  }

  Future<void> logout() async {
    try {
      await _apiClient.post('/auth/logout', {});
    } catch (_) {} // Ignore network errors on logout
    await _storageService.clearAll();
  }
}
""")

# presentation/providers/auth_provider.dart
create_file(f"{base_dir}/lib/presentation/providers/auth_provider.dart", """
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
""")

# presentation/screens/auth/login_screen.dart
create_file(f"{base_dir}/lib/presentation/screens/auth/login_screen.dart", """
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../../core/utils/validators.dart';
import '../../../core/constants/app_colors.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      final provider = context.read<AuthProvider>();
      final success = await provider.login(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (success) {
        context.go('/dashboard');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(provider.error ?? 'Login Failed'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'CustConnect',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.primary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 48),
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'Email or Username', border: OutlineInputBorder()),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder()),
                  obscureText: true,
                  validator: Validators.validatePassword,
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: isLoading ? null : _submit,
                  child: isLoading 
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Sign In'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
""")

# presentation/screens/dashboard/dashboard_screen.dart
create_file(f"{base_dir}/lib/presentation/screens/dashboard/dashboard_screen.dart", """
import 'package:flutter/material.dart';
import 'tabs/home_tab.dart';
import 'tabs/news_tab.dart';
import 'tabs/profile_tab.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  final _tabs = const [HomeTab(), NewsTab(), ProfileTab()];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _tabs[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (idx) => setState(() => _currentIndex = idx),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.article), label: 'News'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
""")

# presentation/screens/dashboard/tabs/home_tab.dart
create_file(f"{base_dir}/lib/presentation/screens/dashboard/tabs/home_tab.dart", """
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Welcome back, ${user?.firstName ?? 'Student'}!', 
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            children: [
              _buildCard(context, Icons.event, 'Events', Colors.orange),
              _buildCard(context, Icons.find_in_page, 'Lost & Found', Colors.green),
              _buildCard(context, Icons.local_cafe, 'Cafeteria', Colors.brown),
              _buildCard(context, Icons.directions_bus, 'Transport', Colors.blue),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildCard(BuildContext context, IconData icon, String title, Color color) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: color),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
""")

# presentation/screens/dashboard/tabs/news_tab.dart
create_file(f"{base_dir}/lib/presentation/screens/dashboard/tabs/news_tab.dart", """
import 'package:flutter/material.dart';

class NewsTab extends StatelessWidget {
  const NewsTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Announcements')),
      body: const Center(child: Text('Coming Soon: University Announcements')),
    );
  }
}
""")

# presentation/screens/dashboard/tabs/profile_tab.dart
create_file(f"{base_dir}/lib/presentation/screens/dashboard/tabs/profile_tab.dart", """
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../providers/auth_provider.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircleAvatar(radius: 50, child: Icon(Icons.person, size: 50)),
            const SizedBox(height: 16),
            Text('${user?.firstName} ${user?.lastName}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text(user?.email ?? '', style: const TextStyle(fontSize: 16, color: Colors.grey)),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () async {
                await context.read<AuthProvider>().logout();
                if (context.mounted) context.go('/login');
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('Logout'),
            )
          ],
        ),
      ),
    );
  }
}
""")

# routes/app_router.dart
create_file(f"{base_dir}/lib/routes/app_router.dart", """
import 'package:go_router/go_router.dart';
import '../presentation/screens/auth/login_screen.dart';
import '../presentation/screens/dashboard/dashboard_screen.dart';
import '../data/services/storage_service.dart';

class AppRouter {
  static final router = GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
    ],
    redirect: (context, state) async {
      final storage = StorageService();
      final hasToken = await storage.getToken() != null;
      
      final isLoginRoute = state.uri.path == '/login';
      
      if (!hasToken && !isLoginRoute) return '/login';
      if (hasToken && isLoginRoute) return '/dashboard';
      return null;
    },
  );
}
""")

# lib/main.dart
create_file(f"{base_dir}/lib/main.dart", """
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'data/services/storage_service.dart';
import 'core/network/api_client.dart';
import 'data/repositories/auth_repository.dart';
import 'presentation/providers/auth_provider.dart';
import 'routes/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  final storageService = StorageService();
  final apiClient = ApiClient(storageService);
  final authRepository = AuthRepository(apiClient, storageService);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider(authRepository, storageService)),
      ],
      child: const CustConnectApp(),
    ),
  );
}

class CustConnectApp extends StatelessWidget {
  const CustConnectApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'CustConnect Mobile',
      theme: AppTheme.lightTheme,
      routerConfig: AppRouter.router,
      debugShowCheckedModeBanner: false,
    );
  }
}
""")

print("SUCCESS")
