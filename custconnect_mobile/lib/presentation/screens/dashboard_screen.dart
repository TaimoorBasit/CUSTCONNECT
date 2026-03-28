import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  void _logout(BuildContext context, WidgetRef ref) async {
    await ref.read(authStateProvider.notifier).logout();
    if (context.mounted) {
      context.go('/welcome');
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final user = ref.watch(authStateProvider).value;
    final initials = user != null ? '${user.firstName[0]}${user.lastName[0]}'.toUpperCase() : 'AJ';

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Good Morning,', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: theme.colorScheme.secondary)),
                          Text(user?.firstName ?? 'Student', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
                        ],
                      ),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(color: theme.colorScheme.surface, borderRadius: BorderRadius.circular(14)),
                            child: Icon(LucideIcons.bell, color: theme.colorScheme.secondary),
                          ),
                          const SizedBox(width: 15),
                          GestureDetector(
                            onTap: () => _logout(context, ref),
                            child: Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: theme.primaryColor,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: Colors.white, width: 3),
                              ),
                              child: Center(
                                child: Text(initials, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                              ),
                            ),
                          )
                        ],
                      )
                    ],
                  ),
                  const SizedBox(height: 30),
                  // CGPA Banner
                  Container(
                    padding: const EdgeInsets.all(30),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.secondary,
                      borderRadius: BorderRadius.circular(35),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
                              child: Row(
                                children: const [
                                  Icon(LucideIcons.trendingUp, size: 12, color: Colors.white),
                                  SizedBox(width: 6),
                                  Text("DEAN'S LIST", style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                                ],
                              ),
                            ),
                            const Text('3.85', style: TextStyle(color: Colors.white, fontSize: 50, fontWeight: FontWeight.w900)),
                            Text('Current Cumulative GPA', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12, fontWeight: FontWeight.w600)),
                          ],
                        ),
                        Container(
                          width: 70, height: 70,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white.withOpacity(0.1), width: 6),
                          ),
                          child: const Center(child: Text('92%', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900))),
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 35),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Quick Actions', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                      Text('Customize', style: TextStyle(color: theme.primaryColor, fontSize: 14, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(child: _ActionCard(title: 'GPA Calc', desc: 'Track Performance', iconData: LucideIcons.barChart3, color: theme.primaryColor, onTap: ()=>context.push('/gpa'))),
                      const SizedBox(width: 15),
                      Expanded(child: _ActionCard(title: 'Library', desc: 'Digital Assets', iconData: LucideIcons.bookOpen, color: theme.colorScheme.secondary, onTap: ()=>context.push('/resources'))),
                    ],
                  ),
                  const SizedBox(height: 15),
                  Row(
                    children: [
                      Expanded(child: _ActionCard(title: 'Social', desc: 'Campus Feed', iconData: LucideIcons.messageSquare, color: Colors.amber.shade700, onTap: (){})),
                      const SizedBox(width: 15),
                      Expanded(child: _ActionCard(title: 'Transport', desc: 'Live Tracking', iconData: LucideIcons.bus, color: Colors.orange.shade700, onTap: (){})),
                    ],
                  ),
                  const SizedBox(height: 35),
                  const Text('Academic Status', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 15),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(color: theme.colorScheme.surface, borderRadius: BorderRadius.circular(24)),
                    child: Row(
                      children: [
                        Container(
                          width: 44, height: 44,
                          decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(14)),
                          child: Icon(LucideIcons.bell, color: Colors.brown.shade700, size: 20),
                        ),
                        const SizedBox(width: 15),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text('Midterm schedules are now available for Spring 2026.', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                              SizedBox(height: 4),
                              Text('Posted 2h ago', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                            ],
                          ),
                        )
                      ],
                    ),
                  )
                ],
              ),
            ),
            
            // Bottom Tab Bar matching Figma design
            Align(
              alignment: Alignment.bottomCenter,
              child: Container(
                margin: const EdgeInsets.only(bottom: 20, left: 20, right: 20),
                height: 85,
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 20, offset: const Offset(0, 10))],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(LucideIcons.home, color: theme.primaryColor),
                        const SizedBox(height: 6),
                        Container(width: 4, height: 4, decoration: BoxDecoration(color: theme.primaryColor, shape: BoxShape.circle))
                      ],
                    ),
                    IconButton(icon: const Icon(LucideIcons.bookOpen, color: Colors.grey), onPressed: ()=>context.push('/resources')),
                    Container(
                      transform: Matrix4.translationValues(0, -25, 0),
                      width: 64, height: 64,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.secondary,
                        shape: BoxShape.circle,
                        border: Border.all(color: theme.scaffoldBackgroundColor, width: 5),
                      ),
                      child: const Icon(LucideIcons.plus, color: Colors.white, size: 30),
                    ),
                    IconButton(icon: const Icon(LucideIcons.barChart3, color: Colors.grey), onPressed: ()=>context.push('/gpa')),
                    IconButton(icon: const Icon(LucideIcons.user, color: Colors.grey), onPressed: ()=>_logout(context, ref)),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final String title;
  final String desc;
  final IconData iconData;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.title, required this.desc, required this.iconData, required this.color, required this.onTap
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(24),
          border: Border(top: BorderSide(color: color, width: 3)),
          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 5)],
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(16)),
              child: Icon(iconData, color: color),
            ),
            const SizedBox(height: 15),
            Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            const SizedBox(height: 4),
            Text(desc, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}
