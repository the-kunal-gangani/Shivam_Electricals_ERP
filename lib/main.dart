import 'package:flutter/material.dart';
import 'package:shivam_electricals/app/app.dart';
import 'package:shivam_electricals/app/bootstrap.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Bootstrap.init();
  runApp(const App());
}
