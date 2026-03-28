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
