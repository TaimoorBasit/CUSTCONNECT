import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/providers.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  bool _loading = false;

  void _submit() async {
    if (_emailCtrl.text.isEmpty) return;
    setState(() => _loading = true);

    try {
      final res = await ref.read(authRepositoryProvider).forgotPassword(_emailCtrl.text);
      if (res['success']) {
        if (mounted) context.push('/reset-password');
      } else {
        throw Exception(res['message']);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(icon: const Icon(LucideIcons.chevronLeft), onPressed: () => context.pop()),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Reset Access', style: TextStyle(fontSize: 42, fontWeight: FontWeight.w900, letterSpacing: -1)),
              const SizedBox(height: 8),
              const Text('Enter your university email and we\'ll send you instructions to reset your password.', style: TextStyle(fontSize: 16, color: Colors.grey)),
              const SizedBox(height: 40),
              TextField(
                controller: _emailCtrl,
                decoration: const InputDecoration(
                  labelText: 'University Email',
                  prefixIcon: Icon(LucideIcons.mail, size: 20),
                ),
              ),
              const SizedBox(height: 30),
              ElevatedButton.icon(
                onPressed: _loading ? null : _submit,
                icon: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator()) : const SizedBox(),
                label: const Text('Send Reset Link', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  backgroundColor: Theme.of(context).primaryColor,
                  foregroundColor: Colors.white,
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
