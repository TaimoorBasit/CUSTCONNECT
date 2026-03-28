import 'package:flutter/cupertino.dart';
import '../../api/api_service.dart';

class MessagesTab extends StatefulWidget {
  const MessagesTab({Key? key}) : super(key: key);
  @override
  State<MessagesTab> createState() => _MessagesTabState();
}
class _MessagesTabState extends State<MessagesTab> {
  List _messages = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchMessages();
  }

  Future<void> _fetchMessages() async {
    try {
      final res = await ApiService().get('/messages/conversations');
      setState(() { _messages = res['data'] ?? []; _loading = false; });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(middle: Text('Messages')),
      child: SafeArea(
        child: _loading ? const Center(child: CupertinoActivityIndicator()) : ListView.builder(
          itemCount: _messages.length,
          itemBuilder: (context, index) {
            final msg = _messages[index];
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: CupertinoColors.systemGrey5)),
              ),
              child: Row(
                children: [
                  const Icon(CupertinoIcons.person_crop_circle_fill, size: 40, color: CupertinoColors.systemGrey),
                  const SizedBox(width: 12),
                  Text("Conversation ID: ${msg['id'] ?? 'Unknown'}", style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
