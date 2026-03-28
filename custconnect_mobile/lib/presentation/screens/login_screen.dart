import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/auth_provider.dart';
import '../../core/utils/validators.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _identifierCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscureText = true;
  bool _isAdminMode = false;

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    try {
      await ref.read(authStateProvider.notifier).login(
            _identifierCtrl.text.trim(),
            _passwordCtrl.text,
            isAdmin: _isAdminMode,
          );
      if (mounted) context.go('/dashboard');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;
    final isLoading = ref.watch(authStateProvider).isLoading;

    return Scaffold(
      body: Stack(
        children: [
          Container(
            width: size.width,
            height: size.height,
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: NetworkImage('https://images.unsplash.com/photo-1541339907198-e08756dee9b8?q=80&w=1470&auto=format&fit=crop'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          Container(
            width: size.width,
            height: size.height,
            color: const Color(0xFF1A2744).withOpacity(0.85),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Align(
                      alignment: Alignment.centerLeft,
                      child: IconButton(
                        icon: const Icon(LucideIcons.chevronLeft, color: Colors.white, size: 28),
                        onPressed: () => context.pop(),
                        style: IconButton.styleFrom(backgroundColor: Colors.white.withOpacity(0.15)),
                      ),
                    ),
                    const SizedBox(height: 40),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('CustConnect', style: TextStyle(fontSize: 42, color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: -1)),
                        IconButton(
                          icon: Icon(_isAdminMode ? LucideIcons.shieldAlert : LucideIcons.user, color: Colors.white),
                          onPressed: () => setState(() => _isAdminMode = !_isAdminMode),
                          tooltip: _isAdminMode ? 'Switch to Student' : 'Admin Login',
                        )
                      ],
                    ),
                    Text(
                      _isAdminMode ? 'Sign in to admin console' : 'Sign in to your student hub',
                      style: const TextStyle(fontSize: 16, color: Colors.white70),
                    ),
                    const SizedBox(height: 40),
                    Container(
                      padding: const EdgeInsets.all(30),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.2), offset: const Offset(0, 10), blurRadius: 20)
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(_isAdminMode ? 'Admin Username' : 'Email Address', style: TextStyle(color: theme.colorScheme.secondary, fontWeight: FontWeight.bold, fontSize: 13)),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _identifierCtrl,
                            keyboardType: _isAdminMode ? TextInputType.text : TextInputType.emailAddress,
                            decoration: InputDecoration(
                              prefixIcon: Icon(_isAdminMode ? LucideIcons.userCheck : LucideIcons.mail, size: 20),
                              hintText: _isAdminMode ? 'admin_user' : 'j.doe@university.edu',
                            ),
                            validator: _isAdminMode ? (v) => Validators.required(v, 'Username') : Validators.email,
                          ),
                          const SizedBox(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Password', style: TextStyle(color: theme.colorScheme.secondary, fontWeight: FontWeight.bold, fontSize: 13)),
                              GestureDetector(
                                onTap: () => context.push('/forgot-password'),
                                child: Text('Forgot Password?', style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.bold, fontSize: 13)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _passwordCtrl,
                            obscureText: _obscureText,
                            decoration: InputDecoration(
                              prefixIcon: const Icon(LucideIcons.lock, size: 20),
                              hintText: '••••••••',
                              suffixIcon: IconButton(
                                icon: Icon(_obscureText ? LucideIcons.eyeOff : LucideIcons.eye),
                                onPressed: () => setState(() => _obscureText = !_obscureText),
                              ),
                            ),
                            validator: Validators.password,
                          ),
                          const SizedBox(height: 30),
                          ElevatedButton(
                            onPressed: isLoading ? null : _submit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: theme.primaryColor,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 18),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                              elevation: 5,
                            ),
                            child: isLoading
                                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: const [
                                      Text('Sign In', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                      SizedBox(width: 10),
                                      Icon(LucideIcons.arrowRight, size: 20),
                                    ],
                                  ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 30),
                    if (!_isAdminMode) Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('New to the portal? ', style: TextStyle(color: Colors.white70, fontSize: 15)),
                        GestureDetector(
                          onTap: () => context.push('/register'),
                          child: const Text('Create Account', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold, decoration: TextDecoration.underline)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          )
        ],
      ),
    );
  }
}
