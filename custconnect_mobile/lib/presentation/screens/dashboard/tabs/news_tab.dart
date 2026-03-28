import 'package:flutter/material.dart';

class NewsTab extends StatelessWidget {
  const NewsTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Announcements')),
      body: const Center(child: Text('Coming Soon: University Announcements')),
    );
  }
}
