import 'package:flutter/cupertino.dart';
import '../../api/api_service.dart';

class AnnouncementsTab extends StatefulWidget {
  const AnnouncementsTab({Key? key}) : super(key: key);
  @override
  State<AnnouncementsTab> createState() => _AnnouncementsTabState();
}
class _AnnouncementsTabState extends State<AnnouncementsTab> {
  List _posts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchPosts();
  }

  Future<void> _fetchPosts() async {
    try {
      final res = await ApiService().get('/posts');
      setState(() { _posts = res['data'] ?? []; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(middle: Text('Announcements')),
      child: SafeArea(
        child: _loading ? const Center(child: CupertinoActivityIndicator()) : ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: _posts.length,
          itemBuilder: (context, index) {
            final post = _posts[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: CupertinoColors.white, borderRadius: BorderRadius.circular(12)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   Text(post['title'] ?? 'Announcement', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                   const SizedBox(height: 8),
                   Text(post['content'] ?? '', style: const TextStyle(color: CupertinoColors.systemGrey)),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
