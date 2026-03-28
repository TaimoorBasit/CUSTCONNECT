import 'package:supabase_flutter/supabase_flutter.dart' as sb;
import '../models/user_model.dart';
import '../services/storage_service.dart';

class AuthRepository {
  final sb.SupabaseClient _supabase = sb.Supabase.instance.client;
  final StorageService _storageService;

  AuthRepository(this._storageService);

  Future<UserModel> login(String emailOrUsername, String password) async {
    try {
      // Step 1: Sign in with Supabase Auth
      final response = await _supabase.auth.signInWithPassword(
        email: emailOrUsername.contains('@') ? emailOrUsername : null,
        // Since Supabase requires email, if they use username we might need a workaround or fetch user by username first.
        // For now, assuming email for Student login.
        password: password,
      );

      if (response.user == null) {
        throw 'Invalid credentials';
      }

      // Step 2: Fetch user profile from your 'users' table in Supabase (synced from Prisma)
      final userData = await _supabase
          .from('users')
          .select()
          .eq('id', response.user!.id)
          .single();

      final user = UserModel.fromJson(userData);
      
      // Save locally (though Supabase handles session, keeping it for now for consistency)
      await _storageService.saveUser(user);
      
      // Note: Supabase saves token automatically in its own storage handler.
      
      return user;
    } on sb.AuthException catch (e) {
      throw e.message;
    } catch (e) {
      throw 'Login Error: $e';
    }
  }

  Future<void> logout() async {
    await _supabase.auth.signOut();
    await _storageService.clearAll();
  }
}
