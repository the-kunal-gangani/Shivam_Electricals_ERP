class Paginated<T> {
  const Paginated({
    required this.items,
    required this.page,
    required this.limit,
    required this.total,
  });

  final List<T> items;
  final int page;
  final int limit;
  final int total;

  bool get hasMore => page * limit < total;

  factory Paginated.fromJson(
    dynamic json,
    T Function(Map<String, dynamic> item) parseItem,
  ) {
    final map = json as Map<String, dynamic>;
    final rawItems = map['items'] as List<dynamic>;
    return Paginated<T>(
      items: rawItems
          .map((item) => parseItem(item as Map<String, dynamic>))
          .toList(),
      page: map['page'] as int,
      limit: map['limit'] as int,
      total: map['total'] as int,
    );
  }
}
