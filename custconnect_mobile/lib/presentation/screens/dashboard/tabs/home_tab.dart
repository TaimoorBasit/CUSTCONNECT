import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../providers/auth_provider.dart';

class CampusService {
  final String name;
  final IconData icon;
  final String description;
  final Color color;
  final Color bgLight;

  const CampusService(this.name, this.icon, this.description, this.color, this.bgLight);
}

const _services = [
  CampusService('Campus Feed', Icons.people_outline, 'Connect with your university community', Color(0xFFA51C30), Color(0xFFFFF5F5)),
  CampusService('Bus Tracking', Icons.map_outlined, 'Live transit updates and schedules', Color(0xFF1a2744), Color(0xFFF0F3FA)),
  CampusService('Campus Cafes', Icons.storefront_outlined, 'Explore menus and student deals', Color(0xFFD97706), Color(0xFFFFFBEB)),
  CampusService('Resource Bank', Icons.menu_book_outlined, 'Academic materials and notes', Color(0xFF1a2744), Color(0xFFF0F3FA)),
  CampusService('GPA Calculator', Icons.school_outlined, 'Track your academic performance', Color(0xFFA51C30), Color(0xFFFFF5F5)),
  CampusService('Campus Events', Icons.calendar_today_outlined, 'Discover what\'s happening on campus', Color(0xFF059669), Color(0xFFECFDF5)),
  CampusService('Print Centre', Icons.print_outlined, 'Submit and manage print requests', Color(0xFF7C3AED), Color(0xFFF5F3FF)),
  CampusService('Lost & Found', Icons.search_outlined, 'Report or find lost items on campus', Color(0xFF0369A1), Color(0xFFF0F9FF)),
  CampusService('Direct Messages', Icons.chat_bubble_outline, 'Chat with peers and faculty', Color(0xFFA51C30), Color(0xFFFFF5F5)),
  CampusService('Social Hub', Icons.group_add_outlined, 'Expand your campus network', Color(0xFF1a2744), Color(0xFFF0F3FA)),
  CampusService('Tools & Docs', Icons.description_outlined, 'Useful academic tools and documents', Color(0xFFD97706), Color(0xFFFFFBEB)),
  CampusService('Notifications', Icons.notifications_none_outlined, 'Stay updated with campus alerts', Color(0xFF059669), Color(0xFFECFDF5)),
];

class HomeTab extends StatelessWidget {
  const HomeTab({Key? key}) : super(key: key);

  String _getGreeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  String _getDayInfo() {
    return DateFormat('EEEE, d MMMM yyyy').format(DateTime.now());
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final featured = _services.take(4).toList();
    final rest = _services.skip(4).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8F7F4),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Hero + Featured overlapping
            Stack(
              clipBehavior: Clip.none,
              children: [
                // Top Hero Banner
                Container(
                  color: const Color(0xFF1a2744),
                  padding: const EdgeInsets.fromLTRB(24, 60, 24, 80),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Date pill
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white.withOpacity(0.1)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.access_time, color: Colors.white54, size: 14),
                              const SizedBox(width: 8),
                              Text(
                                _getDayInfo(),
                                style: const TextStyle(
                                  color: Colors.white54,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        '${_getGreeting()},',
                        style: const TextStyle(
                          color: Colors.white54,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${user?.firstName ?? 'Student'} ${user?.lastName ?? ''}'.trim(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.location_on, color: Colors.white38, size: 16),
                          const SizedBox(width: 8),
                          Text(
                            'CustConnect University',
                            style: const TextStyle(
                              color: Colors.white38,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                // Top Crimson Line
                Positioned(
                  top: 0, left: 0, right: 0,
                  child: Container(height: 4, color: const Color(0xFFA51C30)),
                ),

                // Featured Strip overlapping the banner
                Positioned(
                  left: 16, right: 16, bottom: -32,
                  child: SizedBox(
                    height: 110,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: featured.map((s) => Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4.0),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: const [
                                BoxShadow(
                                  color: Colors.black12,
                                  blurRadius: 8,
                                  offset: Offset(0, 4),
                                )
                              ],
                            ),
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 40, height: 40,
                                  decoration: BoxDecoration(
                                    color: s.bgLight,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(s.icon, color: s.color, size: 20),
                                ),
                                const Spacer(),
                                Text(
                                  s.name,
                                  style: const TextStyle(
                                    color: Colors.black87,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 12,
                                    height: 1.1,
                                  ),
                                  maxLines: 2,
                                ),
                              ],
                            ),
                          ),
                        ),
                      )).toList(),
                    ),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 64),
            
            // Main Content Area
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // All Services Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text('All Services', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1a2744))),
                          SizedBox(height: 2),
                          Text('Everything available on your portal', style: TextStyle(fontSize: 13, color: Colors.grey)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF5F5),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFA51C30).withOpacity(0.1)),
                        ),
                        child: const Text('12 available', style: TextStyle(color: Color(0xFFA51C30), fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Rest of Services List
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: EdgeInsets.zero,
                    itemCount: rest.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final s = rest[index];
                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey.shade100),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 40, height: 40,
                              decoration: BoxDecoration(
                                color: s.bgLight,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(s.icon, color: s.color, size: 20),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                  const SizedBox(height: 2),
                                  Text(s.description, style: const TextStyle(color: Colors.grey, fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis),
                                ],
                              ),
                            ),
                            Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey.shade300),
                          ],
                        ),
                      );
                    },
                  ),
                  
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
