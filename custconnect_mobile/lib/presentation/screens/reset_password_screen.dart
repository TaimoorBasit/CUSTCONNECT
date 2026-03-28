import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/providers.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  const ResetPasswordScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _loading = false;
  bool _obscure = true;

  void _submit() async {
    if (_passwordCtrl.text.isEmpty || _passwordCtrl.text != _confirmCtrl.text) return;
    setState(() => _loading = true);

    try {
      final res = await ref.read(authRepositoryProvider).resetPassword('mock_token', _passwordCtrl.text);
      if (res['success']) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password updated successfully')));
          context.go('/login');
        }
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
              const Text('Secure Your Account', style: TextStyle(fontSize: 38, fontWeight: FontWeight.w900, letterSpacing: -1)),
              const SizedBox(height: 8),
              const Text('Choose a strong password that you haven\'t used before.', style: TextStyle(fontSize: 16, color: Colors.grey)),
              const SizedBox(height: 40),
              TextField(
                controller: _passwordCtrl,
                obscureText: _obscure,
                decoration: InputDecoration(
                  labelText: 'New Password',
                  prefixIcon: const Icon(LucideIcons.lock, size: 20),
                  suffixIcon: IconButton(icon: Icon(_obscure ? LucideIcons.eyeOff : LucideIcons.eye), onPressed: () => setState(() => _obscure = !_obscure)),
                ),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _confirmCtrl,
                obscureText: _obscure,
                decoration: const InputDecoration(
                  labelText: 'Confirm Password',
                  prefixIcon: Icon(LucideIcons.lock, size: 20),
                ),
              ),
              const SizedBox(height: 40),
              ElevatedButton.icon(
                onPressed: _loading ? null : _submit,
                icon: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator()) : const SizedBox(),
                label: const Text('Update Password', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  backgroundColor: Theme.of(context).colorScheme.secondary,
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
