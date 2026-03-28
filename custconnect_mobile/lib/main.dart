import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/theme/app_theme.dart';
import 'data/services/storage_service.dart';
import 'data/repositories/auth_repository.dart';
import 'presentation/providers/auth_provider.dart';
import 'routes/app_router.dart';
import 'core/constants/supabase_constants.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Supabase
  await Supabase.initialize(
    url: SupabaseConstants.url,
    anonKey: SupabaseConstants.anonKey,
  );
  
  final storageService = StorageService();
  final authRepository = AuthRepository(storageService);

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
      title: 'CustConnect',
      theme: AppTheme.lightTheme,
      routerConfig: AppRouter.router,
      debugShowCheckedModeBanner: false,
      builder: (context, child) {
        // Enforce mobile-like dimensions on Web/Desktop browsers
        return Container(
          color: Colors.grey[900], // Dark background outside the app bounds
          child: Center(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: ConstrainedBox(
                constraints: const BoxConstraints(
                  maxWidth: 450, // Standard phone max width
                  maxHeight: 900, // Standard phone max height
                ),
                child: child!,
              ),
            ),
          ),
        );
      },
    );
  }
}
