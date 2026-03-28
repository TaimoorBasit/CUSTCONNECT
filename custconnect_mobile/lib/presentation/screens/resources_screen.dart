import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../data/repositories/resource_repository.dart';
import '../../data/models/resource_model.dart';

class ResourcesScreen extends StatefulWidget {
  const ResourcesScreen({Key? key}) : super(key: key);

  @override
  State<ResourcesScreen> createState() => _ResourcesScreenState();
}

class _ResourcesScreenState extends State<ResourcesScreen> {
  String _searchQuery = '';
  List<ResourceModel> _resources = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchResources();
  }

  Future<void> _fetchResources() async {
    try {
      final resourceRepo = ResourceRepository();
      final data = await resourceRepo.getAll();
      if (mounted) {
        setState(() {
          _resources = data;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final filtered = _resources.where((r) => 
      r.title.toLowerCase().contains(_searchQuery.toLowerCase()) || 
      (r.courseCode?.toLowerCase().contains(_searchQuery.toLowerCase()) ?? false)
    ).toList();

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(icon: const Icon(LucideIcons.chevronLeft), onPressed: () => context.pop()),
        title: const Text('University Library'),
        actions: [
          IconButton(icon: const Icon(LucideIcons.uploadCloud), onPressed: () {})
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 15),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(18),
                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 5)],
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.search, size: 20, color: Colors.grey),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      onChanged: (v) => setState(() => _searchQuery = v),
                      decoration: const InputDecoration(
                        hintText: 'Search resources...',
                        border: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        fillColor: Colors.transparent,
                      ),
                    ),
                  )
                ],
              ),
            ),
          ),
          Expanded(
            child: _loading 
            ? const Center(child: CircularProgressIndicator())
            : filtered.isEmpty
              ? Center(child: Text('No premium resources found.', style: TextStyle(color: Colors.grey.shade600)))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: filtered.length + 1,
                  itemBuilder: (ctx, idx) {
                    if (idx == 0) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 20),
                        child: Row(
                          children: [
                            Icon(LucideIcons.bookOpen, size: 20, color: theme.primaryColor),
                            const SizedBox(width: 10),
                            const Text('Premium Resources', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                          ],
                        ),
                      );
                    }
                    final r = filtered[idx - 1];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 5)],
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 54, height: 54,
                            decoration: BoxDecoration(color: theme.primaryColor.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                            child: Icon(LucideIcons.fileText, color: theme.primaryColor),
                          ),
                          const SizedBox(width: 15),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(r.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(color: theme.colorScheme.secondary.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                                      child: Text(r.courseCode ?? 'GEN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: theme.colorScheme.secondary)),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(r.fileSize != null ? '${(r.fileSize! / 1024).toStringAsFixed(1)}KB' : '0KB', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                    const Padding(padding: EdgeInsets.symmetric(horizontal: 8), child: Text('•', style: TextStyle(color: Colors.grey))),
                                    Text(r.createdAt ?? 'Today', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Container(
                            width: 36, height: 36,
                            decoration: BoxDecoration(color: theme.primaryColor, borderRadius: BorderRadius.circular(12)),
                            child: const Icon(LucideIcons.download, size: 18, color: Colors.white),
                          )
                        ],
                      ),
                    );
                  },
              ),
          )
        ],
      ),
    );
  }
}
