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
