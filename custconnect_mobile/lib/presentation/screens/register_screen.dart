import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/auth_provider.dart';
import '../../core/utils/validators.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fNameCtrl = TextEditingController();
  final _lNameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _studentIdCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscureText = true;

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    try {
      await ref.read(authStateProvider.notifier).register({
        'firstName': _fNameCtrl.text.trim(),
        'lastName': _lNameCtrl.text.trim(),
        'email': _emailCtrl.text.trim(),
        'studentId': _studentIdCtrl.text.trim(),
        'password': _passwordCtrl.text,
      });
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Account Created'),
            content: const Text('Please check your university email to verify your account.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  context.go('/login');
                },
                child: const Text('OK'),
              )
            ],
          )
        );
      }
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
                image: NetworkImage('https://images.unsplash.com/photo-1523050335456-e6cc8390b46d?q=80&w=1471&auto=format&fit=crop'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          Container(
            width: size.width,
            height: size.height,
            color: const Color(0xFF1A2744).withOpacity(0.9),
          ),
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 20),
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
                    const SizedBox(height: 30),
                    const Text('Join Us', style: TextStyle(fontSize: 40, color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: -1)),
                    const Text('Unlock your premium campus experience', style: TextStyle(fontSize: 16, color: Colors.white70)),
                    const SizedBox(height: 30),
                    Container(
                      padding: const EdgeInsets.all(25),
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
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    Text('First Name', style: TextStyle(color: theme.colorScheme.secondary, fontWeight: FontWeight.bold, fontSize: 12)),
                                    const SizedBox(height: 8),
                                    TextFormField(
                                      controller: _fNameCtrl,
                                      validator: (v) => Validators.required(v, 'First Name'),
                                      decoration: const InputDecoration(prefixIcon: Icon(LucideIcons.user, size: 18), hintText: 'John'),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    Text('Last Name', style: TextStyle(color: theme.colorScheme.secondary, fontWeight: FontWeight.bold, fontSize: 12)),
                                    const SizedBox(height: 8),
                                    TextFormField(
                                      controller: _lNameCtrl,
                                      validator: (v) => Validators.required(v, 'Last Name'),
                                      decoration: const InputDecoration(hintText: 'Doe'),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 18),
                          Text('University Email', style: TextStyle(color: theme.colorScheme.secondary, fontWeight: FontWeight.bold, fontSize: 12)),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _emailCtrl,
                            keyboardType: TextInputType.emailAddress,
                            validator: Validators.email,
                            decoration: const InputDecoration(prefixIcon: Icon(LucideIcons.mail, size: 18), hintText: 'j.doe@university.edu'),
                          ),
                          const SizedBox(height: 18),
                          Text('Student ID (Optional)', style: TextStyle(color: theme.colorScheme.secondary, fontWeight: FontWeight.bold, fontSize: 12)),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _studentIdCtrl,
                            decoration: const InputDecoration(prefixIcon: Icon(LucideIcons.hash, size: 18), hintText: '2024-ABC-123'),
                          ),
                          const SizedBox(height: 18),
                          Text('Create Password', style: TextStyle(color: theme.colorScheme.secondary, fontWeight: FontWeight.bold, fontSize: 12)),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _passwordCtrl,
                            obscureText: _obscureText,
                            validator: Validators.password,
                            decoration: InputDecoration(
                              prefixIcon: const Icon(LucideIcons.lock, size: 18),
                              hintText: '••••••••',
                              suffixIcon: IconButton(
                                icon: Icon(_obscureText ? LucideIcons.eyeOff : LucideIcons.eye),
                                onPressed: () => setState(() => _obscureText = !_obscureText),
                              ),
                            ),
                          ),
                          const SizedBox(height: 25),
                          ElevatedButton(
                            onPressed: isLoading ? null : _submit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: theme.primaryColor,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 18),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                            ),
                            child: isLoading
                                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: const [
                                      Text('Create Account', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                      SizedBox(width: 10),
                                      Icon(LucideIcons.arrowRight, size: 20),
                                    ],
                                  ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 25),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('Already have an account? ', style: TextStyle(color: Colors.white70, fontSize: 15)),
                        GestureDetector(
                          onTap: () => context.go('/login'),
                          child: const Text('Sign In', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold, decoration: TextDecoration.underline)),
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
