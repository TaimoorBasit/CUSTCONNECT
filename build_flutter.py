import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')

base_dir = r"e:\CustConnect\ios_app"

# Clean up existing dir if we need to start fresh, but let's just overwrite
import shutil
if os.path.exists(base_dir):
    shutil.rmtree(base_dir, ignore_errors=True)

os.makedirs(base_dir, exist_ok=True)

# pubspec.yaml
create_file(f"{base_dir}/pubspec.yaml", """
name: ios_app
description: CustConnect iOS app built with Flutter.
publish_to: 'none'
version: 1.0.0+1
environment:
  sdk: ">=3.0.0 <4.0.0"
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  http: ^1.2.0
  flutter_secure_storage: ^9.0.0
  provider: ^6.1.1
  shared_preferences: ^2.2.2
dev_dependencies:
  flutter_test:
    sdk: flutter
flutter:
  uses-material-design: true
""")

# README
create_file(f"{base_dir}/README.md", """
# CustConnect iOS App
Fully functional iOS App built with Flutter using Cupertino design matching the existing NodeJS backend.
To run: `flutter run`
""")

# lib/config/constants.dart
create_file(f"{base_dir}/lib/config/constants.dart", """
class Constants {
  static const String baseUrl = 'https://custconnect-backend-production.up.railway.app/api';
  static const String tokenKey = 'cc_token';
  static const String userKey = 'cc_user';
}
""")

# lib/utils/secure_storage.dart
create_file(f"{base_dir}/lib/utils/secure_storage.dart", """
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
class SecureStorage {
  final _storage = const FlutterSecureStorage();
  Future<void> write(String key, String value) async => await _storage.write(key: key, value: value);
  Future<String?> read(String key) async => await _storage.read(key: key);
  Future<void> delete(String key) async => await _storage.delete(key: key);
  Future<void> clearAll() async => await _storage.deleteAll();
}
""")

# lib/api/api_service.dart
create_file(f"{base_dir}/lib/api/api_service.dart", """
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../utils/secure_storage.dart';

class ApiService {
  final SecureStorage _storage = SecureStorage();

  Future<Map<String, String>> _getHeaders() async {
    final token = await _storage.read(Constants.tokenKey);
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final uri = Uri.parse('${Constants.baseUrl}$endpoint');
    final response = await http.post(uri, headers: await _getHeaders(), body: jsonEncode(body)).timeout(const Duration(seconds: 45));
    return _handleResponse(response);
  }

  Future<dynamic> get(String endpoint) async {
    final uri = Uri.parse('${Constants.baseUrl}$endpoint');
    final response = await http.get(uri, headers: await _getHeaders()).timeout(const Duration(seconds: 45));
    return _handleResponse(response);
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final decoded = jsonDecode(response.body);
      if (decoded['success'] == true) return decoded;
      throw Exception(decoded['message'] ?? 'Platform Error');
    }
    throw Exception('API Error: ${response.statusCode}');
  }
}
""")

# lib/models/user.dart
create_file(f"{base_dir}/lib/models/user.dart", """
class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  User({required this.id, required this.email, required this.firstName, required this.lastName});
  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'] ?? '', email: json['email'] ?? '', firstName: json['firstName'] ?? '', lastName: json['lastName'] ?? ''
  );
  Map<String, dynamic> toJson() => {'id': id, 'email': email, 'firstName': firstName, 'lastName': lastName};
}
""")

# lib/services/auth_service.dart
create_file(f"{base_dir}/lib/services/auth_service.dart", """
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
""")

# lib/main.dart
create_file(f"{base_dir}/lib/main.dart", """
import 'package:flutter/cupertino.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'services/auth_service.dart';

void main() => runApp(const CustConnectApp());

class CustConnectApp extends StatelessWidget {
  const CustConnectApp({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return const CupertinoApp(
      title: 'CustConnect iOS',
      theme: CupertinoThemeData(primaryColor: CupertinoColors.systemBlue),
      home: InitializationScreen(),
    );
  }
}

class InitializationScreen extends StatefulWidget {
  const InitializationScreen({Key? key}) : super(key: key);
  @override
  State<InitializationScreen> createState() => _InitState();
}
class _InitState extends State<InitializationScreen> {
  bool _isLoading = true;
  var _user;
  @override
  void initState() {
    super.initState();
    AuthService().getSession().then((u) => setState(() { _user = u; _isLoading = false; }));
  }
  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const CupertinoPageScaffold(child: Center(child: CupertinoActivityIndicator()));
    if (_user == null) return const LoginScreen();
    return DashboardScreen(user: _user);
  }
}
""")

# lib/screens/login_screen.dart
create_file(f"{base_dir}/lib/screens/login_screen.dart", """
import 'package:flutter/cupertino.dart';
import '../services/auth_service.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}
class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _pass = TextEditingController();
  bool _isLoading = false;

  void _login() async {
    setState(() => _isLoading = true);
    try {
      final user = await AuthService().login(_email.text.trim(), _pass.text);
      if (user != null && mounted) {
        Navigator.of(context).pushReplacement(CupertinoPageRoute(builder: (_) => DashboardScreen(user: user)));
      }
    } catch (e) {
      showCupertinoDialog(context: context, builder: (c) => CupertinoAlertDialog(
        title: const Text('Error'), content: Text(e.toString()),
        actions: [CupertinoDialogAction(child: const Text('OK'), onPressed: () => Navigator.pop(c))]
      ));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(middle: Text('Sign In')),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('CustConnect', style: TextStyle(fontSize: 30, fontWeight: FontWeight.bold)),
              const SizedBox(height: 30),
              CupertinoTextField(controller: _email, placeholder: 'Email', padding: const EdgeInsets.all(16)),
              const SizedBox(height: 16),
              CupertinoTextField(controller: _pass, placeholder: 'Password', obscureText: true, padding: const EdgeInsets.all(16)),
              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                child: CupertinoButton.filled(
                  onPressed: _isLoading ? null : _login,
                  child: _isLoading ? const CupertinoActivityIndicator() : const Text('Sign In'),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
""")

# lib/screens/dashboard_screen.dart
create_file(f"{base_dir}/lib/screens/dashboard_screen.dart", """
import 'package:flutter/cupertino.dart';
import '../models/user.dart';
import 'tabs/home_tab.dart';
import 'tabs/announcements_tab.dart';
import 'tabs/messages_tab.dart';
import 'tabs/profile_tab.dart';

class DashboardScreen extends StatelessWidget {
  final User user;
  const DashboardScreen({Key? key, required this.user}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoTabScaffold(
      tabBar: CupertinoTabBar(
        items: const [
          BottomNavigationBarItem(icon: Icon(CupertinoIcons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(CupertinoIcons.news), label: 'News'),
          BottomNavigationBarItem(icon: Icon(CupertinoIcons.chat_bubble_2), label: 'Chat'),
          BottomNavigationBarItem(icon: Icon(CupertinoIcons.person), label: 'Profile'),
        ],
      ),
      tabBuilder: (context, index) {
        switch (index) {
          case 0: return HomeTab(user: user);
          case 1: return const AnnouncementsTab();
          case 2: return const MessagesTab();
          case 3: return ProfileTab(user: user);
          default: return HomeTab(user: user);
        }
      },
    );
  }
}
""")

# lib/screens/tabs/home_tab.dart
create_file(f"{base_dir}/lib/screens/tabs/home_tab.dart", """
import 'package:flutter/cupertino.dart';
import '../../models/user.dart';
import '../../api/api_service.dart';

class HomeTab extends StatefulWidget {
  final User user;
  const HomeTab({Key? key, required this.user}) : super(key: key);
  @override
  State<HomeTab> createState() => _HomeTabState();
}
class _HomeTabState extends State<HomeTab> {
  String _gpa = "Loading...";

  @override
  void initState() {
    super.initState();
    _fetchGpa();
  }

  Future<void> _fetchGpa() async {
    try {
      final res = await ApiService().get('/gpa/current');
      setState(() => _gpa = res['data']['cgpa']?.toString() ?? "N/A");
    } catch (e) {
      setState(() => _gpa = "-");
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(middle: Text('Dashboard')),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('Welcome, ${widget.user.firstName}', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: CupertinoColors.activeBlue, borderRadius: BorderRadius.circular(16)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Current CGPA', style: TextStyle(color: CupertinoColors.white, fontSize: 16)),
                  Text(_gpa, style: const TextStyle(color: CupertinoColors.white, fontSize: 40, fontWeight: FontWeight.bold)),
                ]
              )
            ),
            const SizedBox(height: 20),
            _buildGrid()
          ],
        ),
      ),
    );
  }

  Widget _buildGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      children: [
        _buildAction(CupertinoIcons.book, 'Assignments'),
        _buildAction(CupertinoIcons.calendar, 'Attendance'),
        _buildAction(CupertinoIcons.doc_text, 'Results'),
        _buildAction(CupertinoIcons.folder, 'Resources'),
      ],
    );
  }

  Widget _buildAction(IconData icon, String title) {
    return Container(
      decoration: BoxDecoration(color: CupertinoColors.white, borderRadius: BorderRadius.circular(16)),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 40, color: CupertinoColors.activeBlue),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
""")

# lib/screens/tabs/announcements_tab.dart
create_file(f"{base_dir}/lib/screens/tabs/announcements_tab.dart", """
import 'package:flutter/cupertino.dart';
import '../../api/api_service.dart';

class AnnouncementsTab extends StatefulWidget {
  const AnnouncementsTab({Key? key}) : super(key: key);
  @override
  State<AnnouncementsTab> createState() => _AnnouncementsTabState();
}
class _AnnouncementsTabState extends State<AnnouncementsTab> {
  List _posts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchPosts();
  }

  Future<void> _fetchPosts() async {
    try {
      final res = await ApiService().get('/posts');
      setState(() { _posts = res['data'] ?? []; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(middle: Text('Announcements')),
      child: SafeArea(
        child: _loading ? const Center(child: CupertinoActivityIndicator()) : ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _posts.length,
          itemBuilder: (context, index) {
            final post = _posts[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: CupertinoColors.white, borderRadius: BorderRadius.circular(12)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   Text(post['title'] ?? 'Announcement', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                   const SizedBox(height: 8),
                   Text(post['content'] ?? '', style: const TextStyle(color: CupertinoColors.systemGrey)),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
""")

# lib/screens/tabs/messages_tab.dart
create_file(f"{base_dir}/lib/screens/tabs/messages_tab.dart", """
import 'package:flutter/cupertino.dart';
import '../../api/api_service.dart';

class MessagesTab extends StatefulWidget {
  const MessagesTab({Key? key}) : super(key: key);
  @override
  State<MessagesTab> createState() => _MessagesTabState();
}
class _MessagesTabState extends State<MessagesTab> {
  List _messages = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchMessages();
  }

  Future<void> _fetchMessages() async {
    try {
      final res = await ApiService().get('/messages/conversations');
      setState(() { _messages = res['data'] ?? []; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(middle: Text('Messages')),
      child: SafeArea(
        child: _loading ? const Center(child: CupertinoActivityIndicator()) : ListView.builder(
          itemCount: _messages.length,
          itemBuilder: (context, index) {
            final msg = _messages[index];
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: CupertinoColors.systemGrey5)),
              ),
              child: Row(
                children: [
                  const Icon(CupertinoIcons.person_crop_circle_fill, size: 40, color: CupertinoColors.systemGrey),
                  const SizedBox(width: 12),
                  Text("Conversation ID: ${msg['id'] ?? 'Unknown'}", style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
""")

# lib/screens/tabs/profile_tab.dart
create_file(f"{base_dir}/lib/screens/tabs/profile_tab.dart", """
import 'package:flutter/cupertino.dart';
import '../../models/user.dart';
import '../../services/auth_service.dart';
import '../login_screen.dart';

class ProfileTab extends StatelessWidget {
  final User user;
  const ProfileTab({Key? key, required this.user}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(middle: Text('Profile')),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const Icon(CupertinoIcons.person_crop_circle_fill, size: 100, color: CupertinoColors.systemGrey),
            const SizedBox(height: 16),
            const Text('Student Profile', textAlign: TextAlign.center, style: TextStyle(color: CupertinoColors.systemGrey)),
            const SizedBox(height: 8),
            Text('${user.firstName} ${user.lastName}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
            Text(user.email, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, color: CupertinoColors.activeBlue)),
            const SizedBox(height: 40),
            CupertinoButton(
              color: CupertinoColors.destructiveRed,
              onPressed: () async {
                await AuthService().logout();
                Navigator.of(context, rootNavigator: true).pushReplacement(CupertinoPageRoute(builder: (_) => const LoginScreen()));
              },
              child: const Text('Sign Out'),
            )
          ],
        ),
      ),
    );
  }
}
""")

print("iOS App Generation Complete!")
