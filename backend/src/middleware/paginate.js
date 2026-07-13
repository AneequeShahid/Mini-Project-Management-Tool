export function paginate(page = 1, limit = 20) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  return { skip: (p - 1) * l, limit: l, page: p, perPage: l };
}

export function paginatedResponse(data, total, page, perPage) {
  return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}
