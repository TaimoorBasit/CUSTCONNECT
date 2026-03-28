import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../data/repositories/gpa_repository.dart';

class GpaCalculatorScreen extends StatefulWidget {
  const GpaCalculatorScreen({super.key});

  @override
  State<GpaCalculatorScreen> createState() => _GpaCalculatorScreenState();
}

class _GpaCalculatorScreenState extends State<GpaCalculatorScreen> {
  final List<Map<String, dynamic>> _subjects = [
    {'name': '', 'credits': '3', 'grade': 'A'}
  ];

  final List<Map<String, dynamic>> _grades = [
    {'grade': 'A+', 'points': 4.0},
    {'grade': 'A', 'points': 4.0},
    {'grade': 'A-', 'points': 3.7},
    {'grade': 'B+', 'points': 3.3},
    {'grade': 'B', 'points': 3.0},
    {'grade': 'B-', 'points': 2.7},
    {'grade': 'C+', 'points': 2.3},
    {'grade': 'C', 'points': 2.0},
    {'grade': 'C-', 'points': 1.7},
    {'grade': 'D+', 'points': 1.3},
    {'grade': 'D', 'points': 1.0},
    {'grade': 'F', 'points': 0.0},
  ];

  bool _loading = false;

  void _addSubject() {
    setState(() {
      _subjects.add({'name': '', 'credits': '3', 'grade': 'A'});
    });
  }

  void _removeSubject(int index) {
    if (_subjects.length == 1) {
      setState(() => _subjects[0] = {'name': '', 'credits': '3', 'grade': 'A'});
      return;
    }
    setState(() {
      _subjects.removeAt(index);
    });
  }

  String _currentGPA() {
    double totalPoints = 0;
    double totalCredits = 0;
    for (var s in _subjects) {
      final gradeObj = _grades.firstWhere((g) => g['grade'] == s['grade'],
          orElse: () => _grades.last);
      final points = (gradeObj['points'] as num).toDouble();
      final credits = double.tryParse(s['credits'].toString()) ?? 0;
      totalPoints += points * credits;
      totalCredits += credits;
    }
    return totalCredits > 0
        ? (totalPoints / totalCredits).toStringAsFixed(2)
        : '0.00';
  }

  Future<void> _handleSave() async {
    setState(() => _loading = true);
    try {
      final data = {
        'semester': 'Current',
        'subjects': _subjects
            .map((s) => {
                  'name':
                      s['name'].toString().isNotEmpty ? s['name'] : 'Course',
                  'credits': int.tryParse(s['credits'].toString()) ?? 0,
                  'grade': s['grade']
                })
            .toList()
      };

      final gpaRepo = GpaRepository();
      final success = await gpaRepo.calculateAndSave(data);
      if (success) {
        if (mounted)
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('GPA saved to profile via Supabase.')));
      }
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final gpa = _currentGPA();

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.chevronLeft),
          onPressed: () => context.pop(),
        ),
        title: const Text('GPA Calculator'),
        actions: [
          IconButton(
            icon: _loading
                ? const SizedBox(
                    width: 20, height: 20, child: CircularProgressIndicator())
                : Icon(LucideIcons.save, color: theme.primaryColor),
            onPressed: _loading ? null : _handleSave,
          )
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(30),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.secondary,
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: const [
                          BoxShadow(color: Colors.black12, blurRadius: 10)
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('ESTIMATED GPA',
                                  style: TextStyle(
                                      color: Colors.white.withOpacity(0.6),
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1)),
                              Text(gpa,
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 56,
                                      fontWeight: FontWeight.w900)),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(25)),
                            child: const Icon(LucideIcons.graduationCap,
                                size: 44, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 25),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: const [
                          BoxShadow(color: Colors.black12, blurRadius: 5)
                        ],
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Course Details',
                                  style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w800)),
                              ElevatedButton.icon(
                                onPressed: _addSubject,
                                icon: const Icon(LucideIcons.plus, size: 18),
                                label: const Text('Add'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: theme.primaryColor,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12)),
                                ),
                              )
                            ],
                          ),
                          const SizedBox(height: 20),
                          ..._subjects.asMap().entries.map((entry) {
                            int idx = entry.key;
                            var s = entry.value;
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 15),
                              child: Row(
                                children: [
                                  Expanded(
                                    flex: 3,
                                    child: TextFormField(
                                      initialValue: s['name'],
                                      onChanged: (v) => setState(
                                          () => _subjects[idx]['name'] = v),
                                      decoration: const InputDecoration(
                                          hintText: 'Course'),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    flex: 1,
                                    child: TextFormField(
                                      initialValue: s['credits'],
                                      keyboardType: TextInputType.number,
                                      onChanged: (v) => setState(
                                          () => _subjects[idx]['credits'] = v),
                                      decoration:
                                          const InputDecoration(hintText: 'Cr'),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  GestureDetector(
                                    onTap: () {
                                      final currentGradeIdx =
                                          _grades.indexWhere(
                                              (g) => g['grade'] == s['grade']);
                                      final nextIdx = (currentGradeIdx + 1) %
                                          _grades.length;
                                      setState(() => _subjects[idx]['grade'] =
                                          _grades[nextIdx]['grade']);
                                    },
                                    child: Container(
                                      width: 45,
                                      height: 45,
                                      alignment: Alignment.center,
                                      decoration: BoxDecoration(
                                          color: theme.primaryColor,
                                          borderRadius:
                                              BorderRadius.circular(12)),
                                      child: Text(s['grade'],
                                          style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w900,
                                              fontSize: 14)),
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(LucideIcons.trash2,
                                        color: Colors.red),
                                    onPressed: () => _removeSubject(idx),
                                  )
                                ],
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                        '💡 Tip: Tap the grade badge to cycle through available grades.',
                        style: TextStyle(
                            color: Colors.grey,
                            fontSize: 13,
                            fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(30)),
                boxShadow: const [
                  BoxShadow(color: Colors.black12, blurRadius: 10)
                ],
              ),
              child: ElevatedButton.icon(
                onPressed: _loading ? null : _handleSave,
                icon: _loading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.white))
                    : const Icon(LucideIcons.save, color: Colors.white),
                label: const Text('Save Record to Profile',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.secondary,
                  minimumSize: const Size(double.infinity, 60),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18)),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
