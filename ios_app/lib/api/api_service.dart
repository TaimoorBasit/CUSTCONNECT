import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../utils/secure_storage.dart';

class ApiService {
  final SecureStorage _storage = SecureStorage();

  Future<Map<String, String>> _getHeaders() async {
    final token = await _storage.read(Constants.tokenKey);
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final uri = Uri.parse('${Constants.baseUrl}$endpoint');
    final response = await http.post(uri, headers: await _getHeaders(), body: jsonEncode(body)).timeout(const Duration(seconds: 45));
    return _handleResponse(response);
  }

  Future<dynamic> get(String endpoint) async {
    final uri = Uri.parse('${Constants.baseUrl}$endpoint');
    final response = await http.get(uri, headers: await _getHeaders()).timeout(const Duration(seconds: 45));
    return _handleResponse(response);
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final decoded = jsonDecode(response.body);
      if (decoded['success'] == true) return decoded;
      throw Exception(decoded['message'] ?? 'Platform Error');
    }
    throw Exception('API Error: ${response.statusCode}');
  }
}
