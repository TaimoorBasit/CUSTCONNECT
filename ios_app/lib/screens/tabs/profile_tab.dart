import 'package:flutter/cupertino.dart';
import '../../models/user.dart';
import '../../services/auth_service.dart';
import '../login_screen.dart';

class ProfileTab extends StatelessWidget {
  final User user;
  const ProfileTab({Key? key, required this.user}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(middle: Text('Profile')),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const Icon(CupertinoIcons.person_crop_circle_fill, size: 100, color: CupertinoColors.systemGrey),
            const SizedBox(height: 16),
            const Text('Student Profile', textAlign: TextAlign.center, style: TextStyle(color: CupertinoColors.systemGrey)),
            const SizedBox(height: 8),
            Text('${user.firstName} ${user.lastName}', textAlign: TextAlign.center, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
            Text(user.email, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, color: CupertinoColors.activeBlue)),
            const SizedBox(height: 40),
            CupertinoButton(
              color: CupertinoColors.destructiveRed,
              onPressed: () async {
                await AuthService().logout();
                Navigator.of(context, rootNavigator: true).pushReplacement(CupertinoPageRoute(builder: (_) => const LoginScreen()));
              },
              child: const Text('Sign Out'),
            )
          ],
        ),
      ),
    );
  }
}
