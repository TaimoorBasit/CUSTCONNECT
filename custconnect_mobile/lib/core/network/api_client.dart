import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';
import '../../data/services/storage_service.dart';

class ApiClient {
  final StorageService _storageService;

  ApiClient(this._storageService);

  Future<Map<String, String>> _headers() async {
    final token = await _storageService.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> get(String endpoint) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}$endpoint'),
        headers: await _headers(),
      ).timeout(const Duration(seconds: 30));
      return _handleResponse(response);
    } catch (e) {
      print('Network Error: $e');
      throw e.toString();
    }
  }

  Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}$endpoint'),
        headers: await _headers(),
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 30));
      return _handleResponse(response);
    } catch (e) {
      print('Network Error: $e');
      throw e.toString();
    }
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode <= 299) {
      return jsonDecode(response.body);
    } else {
      final decoded = jsonDecode(response.body);
      throw decoded['message'] ?? 'Unknown API Error occurred';
    }
  }
}
