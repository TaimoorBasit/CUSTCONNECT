import 'package:flutter/cupertino.dart';
import '../models/user.dart';
import 'tabs/home_tab.dart';
import 'tabs/announcements_tab.dart';
import 'tabs/messages_tab.dart';
import 'tabs/profile_tab.dart';

class DashboardScreen extends StatelessWidget {
  final User user;
  const DashboardScreen({Key? key, required this.user}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CupertinoTabScaffold(
      tabBar: CupertinoTabBar(
        items: const [
          BottomNavigationBarItem(icon: Icon(CupertinoIcons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(CupertinoIcons.news), label: 'News'),
          BottomNavigationBarItem(icon: Icon(CupertinoIcons.chat_bubble_2), label: 'Chat'),
          BottomNavigationBarItem(icon: Icon(CupertinoIcons.person), label: 'Profile'),
        ],
      ),
      tabBuilder: (context, index) {
        switch (index) {
          case 0: return HomeTab(user: user);
          case 1: return const AnnouncementsTab();
          case 2: return const MessagesTab();
          case 3: return ProfileTab(user: user);
          default: return HomeTab(user: user);
        }
      },
    );
  }
}
