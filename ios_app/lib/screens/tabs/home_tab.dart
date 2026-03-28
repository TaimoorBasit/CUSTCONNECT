import 'package:flutter/cupertino.dart';
import '../../models/user.dart';
import '../../api/api_service.dart';

class HomeTab extends StatefulWidget {
  final User user;
  const HomeTab({Key? key, required this.user}) : super(key: key);
  @override
  State<HomeTab> createState() => _HomeTabState();
}
class _HomeTabState extends State<HomeTab> {
  String _gpa = "Loading...";

  @override
  void initState() {
    super.initState();
    _fetchGpa();
  }

  Future<void> _fetchGpa() async {
    try {
      final res = await ApiService().get('/gpa/current');
      setState(() => _gpa = res['data']['cgpa']?.toString() ?? "N/A");
    } catch (e) {
      setState(() => _gpa = "-");
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(middle: Text('Dashboard')),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('Welcome, ${widget.user.firstName}', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: CupertinoColors.activeBlue, borderRadius: BorderRadius.circular(16)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Current CGPA', style: TextStyle(color: CupertinoColors.white, fontSize: 16)),
                  Text(_gpa, style: const TextStyle(color: CupertinoColors.white, fontSize: 40, fontWeight: FontWeight.bold)),
                ]
              )
            ),
            const SizedBox(height: 20),
            _buildGrid()
          ],
        ),
      ),
    );
  }

  Widget _buildGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      children: [
        _buildAction(CupertinoIcons.book, 'Assignments'),
        _buildAction(CupertinoIcons.calendar, 'Attendance'),
        _buildAction(CupertinoIcons.doc_text, 'Results'),
        _buildAction(CupertinoIcons.folder, 'Resources'),
      ],
    );
  }

  Widget _buildAction(IconData icon, String title) {
    return Container(
      decoration: BoxDecoration(color: CupertinoColors.white, borderRadius: BorderRadius.circular(16)),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 40, color: CupertinoColors.activeBlue),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
