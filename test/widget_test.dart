import 'package:flutter_test/flutter_test.dart';
import 'package:shivam_electricals/core/session/user_role.dart';

void main() {
  test('unknown roles use least-privilege staff access', () {
    expect(UserRole.parse('unknown'), UserRole.staff);
    expect(UserRole.parse('admin'), UserRole.admin);
  });
}
