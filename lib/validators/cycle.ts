import prisma from '../db/client';

/**
 * Kiểm tra xem nếu thiết lập quan hệ parentId -> childId thì có tạo ra vòng lặp tổ tiên hay không.
 * Vòng lặp xảy ra nếu childId đã là tổ tiên (cha/mẹ, ông/bà,...) của parentId.
 */
export async function wouldCreateCycle(parentId: string, childId: string, familyId: string): Promise<boolean> {
  if (parentId === childId) return true;

  const visited = new Set<string>();
  const queue: string[] = [parentId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Nếu gặp childId trong danh sách tổ tiên của parentId -> Tạo vòng lặp
    if (current === childId) {
      return true;
    }
    
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    // Truy vấn tất cả cha mẹ của node hiện tại
    const relations = await prisma.parentChildRelationship.findMany({
      where: {
        childId: current,
        familyId,
        status: 'active',
        archivedAt: null,
      },
      select: {
        parentId: true,
      },
    });

    for (const rel of relations) {
      if (!visited.has(rel.parentId)) {
        queue.push(rel.parentId);
      }
    }
  }

  return false;
}
