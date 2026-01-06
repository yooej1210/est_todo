const { prisma } = require("../config/prisma");
const {
  startOfDay,
  endOfDay,
  startOfWeekMonday,
  endOfWeekMonday,
} = require("../utils/date");

async function ensureCategoryOwned(userId, categoryId) {
  if (!categoryId) return;
  const c = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!c) {
    const err = new Error("Category not found");
    err.statusCode = 404;
    throw err;
  }
}

function startOfDayLocal(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDayLocal(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}


function buildOverlapWhere(userId, rangeStart, rangeEnd) {
  // "기간과 겹치는 일정" 조건:
  // startDate <= rangeEnd AND (endDate >= rangeStart OR endDate IS NULL)
  // + startDate IS NOT NULL
  return {
    userId,
    AND: [
      { startDate: { not: null } },
      { startDate: { lte: rangeEnd } },
      {
        OR: [{ endDate: { gte: rangeStart } }, { endDate: null }],
      },
    ],
  };
}

async function create({ userId, text, startDate, endDate, isAllDay, categoryId }) {
  await ensureCategoryOwned(userId, categoryId);

  let s = startDate ?? null;
  let e = endDate ?? null;
  const allDay = !!isAllDay;

  // ✅ 정책 강제
  if (allDay) {
    if (!s) {
      const err = new Error("isAllDay=true requires startDate");
      err.statusCode = 400;
      throw err;
    }
    s = startOfDayLocal(s);
    e = endOfDayLocal(s); // startDate 기준 당일 종료
  } else {
    // 일반 일정이면 end < start 방어(둘 다 있을 때)
    if (s && e && e.getTime() < s.getTime()) {
      const err = new Error("endDate cannot be earlier than startDate");
      err.statusCode = 400;
      throw err;
    }
  }

  return prisma.todo.create({
    data: {
      userId,
      categoryId: categoryId ?? null,
      text,
      startDate: s,
      endDate: e,
      isAllDay: allDay,
    },
    include: { category: true },
  });
}


async function list({ userId, date, filter, from, to }) {
  let where = { userId };

  // 우선순위: from/to > date > filter > 전체
  if (from && to) {
    where = buildOverlapWhere(userId, from, to);
  } else if (date) {
    const d = new Date(`${date}T00:00:00`);
    where = buildOverlapWhere(userId, startOfDay(d), endOfDay(d));
  } else if (filter === "today") {
    const now = new Date();
    where = buildOverlapWhere(userId, startOfDay(now), endOfDay(now));
  } else if (filter === "week") {
    const now = new Date();
    where = buildOverlapWhere(userId, startOfWeekMonday(now), endOfWeekMonday(now));
  }

  return prisma.todo.findMany({
    where,
    orderBy: [
      { isAllDay: "desc" },    // 하루종일이 위로 (원하면 삭제)
      { startDate: "asc" },
      { createdAt: "desc" },
    ],
    include: { category: true },
  });
}

async function update({
  userId,
  id,
  text,
  startDate,
  endDate,
  isAllDay,
  categoryId,
  isCompleted,
}) {
  const exists = await prisma.todo.findFirst({ where: { id, userId } });
  if (!exists) {
    const err = new Error("Todo not found");
    err.statusCode = 404;
    throw err;
  }

  if (categoryId !== undefined) {
    await ensureCategoryOwned(userId, categoryId);
  }

  // ✅ 현재값 + 변경값을 합쳐서 정책 강제
  const nextIsAllDay = isAllDay !== undefined ? isAllDay : exists.isAllDay;

  // startDate/endDate는 "요청에 온 값"이 있으면 그걸 쓰고, 없으면 기존 유지
  const nextStart =
    startDate !== undefined ? startDate : exists.startDate; // startDate는 Date|null
  const nextEnd =
    endDate !== undefined ? endDate : exists.endDate;

  // 정책 강제
  let normalizedStart = nextStart;
  let normalizedEnd = nextEnd;

  if (nextIsAllDay) {
    if (!normalizedStart) {
      const err = new Error("isAllDay=true requires startDate");
      err.statusCode = 400;
      throw err;
    }
    normalizedStart = startOfDayLocal(normalizedStart);
    normalizedEnd = endOfDayLocal(normalizedStart);
  } else {
    if (normalizedStart && normalizedEnd && normalizedEnd.getTime() < normalizedStart.getTime()) {
      const err = new Error("endDate cannot be earlier than startDate");
      err.statusCode = 400;
      throw err;
    }
  }

  return prisma.todo.update({
    where: { id },
    data: {
      ...(text !== undefined ? { text } : {}),
      ...(isAllDay !== undefined ? { isAllDay } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(isCompleted !== undefined ? { isCompleted } : {}),

      // ✅ start/end는 “요청이 왔거나, allDay 정책으로 인해 강제 덮어쓴 경우” 저장
      ...(nextIsAllDay
        ? { startDate: normalizedStart, endDate: normalizedEnd }
        : {
          ...(startDate !== undefined ? { startDate: startDate } : {}),
          ...(endDate !== undefined ? { endDate: endDate } : {}),
        }),
    },
    include: { category: true },
  });
}


async function toggle({ userId, id }) {
  const exists = await prisma.todo.findFirst({ where: { id, userId } });
  if (!exists) {
    const err = new Error("Todo not found");
    err.statusCode = 404;
    throw err;
  }

  return prisma.todo.update({
    where: { id },
    data: { isCompleted: !exists.isCompleted },
    include: { category: true },
  });
}

async function remove({ userId, id }) {
  const exists = await prisma.todo.findFirst({ where: { id, userId } });
  if (!exists) {
    const err = new Error("Todo not found");
    err.statusCode = 404;
    throw err;
  }

  await prisma.todo.delete({ where: { id } });
}

module.exports = { create, list, update, toggle, remove };
