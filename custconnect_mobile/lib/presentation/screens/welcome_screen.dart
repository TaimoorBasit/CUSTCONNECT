import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Stack(
        children: [
          // Background Image (Solid color as fallback, but typically an Image.network here or AssetImage)
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
          // Overlay
          Container(
            width: size.width,
            height: size.height,
            color: const Color(0xFF1A2744).withOpacity(0.85),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(30.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 54,
                            height: 54,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: Colors.white.withOpacity(0.2)),
                            ),
                            child: const Icon(LucideIcons.graduationCap, color: Colors.white, size: 32),
                          ),
                          const SizedBox(width: 15),
                          const Text(
                            'CustConnect',
                            style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -1),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: theme.primaryColor,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text('v2.0 PREMIUM', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900)),
                      )
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Your Campus,\nPerfected.',
                        style: TextStyle(fontSize: 62, fontWeight: FontWeight.w900, color: Colors.white, height: 1.0, letterSpacing: -2.5),
                      ),
                      SizedBox(height: 25),
                      Text(
                        'The ultimate ecosystem for student life. Access your tools, social feed, and resources in one premium space.',
                        style: TextStyle(fontSize: 18, color: Colors.white70, height: 1.5, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      ElevatedButton(
                        onPressed: () => context.push('/register'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: theme.colorScheme.secondary,
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
                          minimumSize: const Size(double.infinity, 60),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('Create Account', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: theme.colorScheme.secondary)),
                            const SizedBox(width: 12),
                            Icon(LucideIcons.arrowRight, color: theme.colorScheme.secondary, size: 20),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),
                      TextButton(
                        onPressed: () => context.push('/login'),
                        child: RichText(
                          text: const TextSpan(
                            text: 'Already a member? ',
                            style: TextStyle(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.w500),
                            children: [
                              TextSpan(text: 'Sign In', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, decoration: TextDecoration.underline)),
                            ],
                          ),
                        ),
                      ),
                      TextButton(
                        onPressed: () => context.push('/forgot-password'),
                        child: const Text('Need technical support?', style: TextStyle(color: Colors.white54, fontSize: 13, fontWeight: FontWeight.w500)),
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
