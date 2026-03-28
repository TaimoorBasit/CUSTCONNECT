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
