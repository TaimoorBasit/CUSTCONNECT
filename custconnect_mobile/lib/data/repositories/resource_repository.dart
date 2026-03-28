import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/resource_model.dart';

class ResourceRepository {
  final SupabaseClient _supabase = Supabase.instance.client;

  Future<List<ResourceModel>> getAll() async {
    final response = await _supabase
        .from('academic_resources')
        .select()
        .order('createdAt', ascending: false);
    
    return (response as List).map((e) => ResourceModel.fromJson(e)).toList();
  }
}
