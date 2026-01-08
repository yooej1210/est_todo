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
  // "Í∏∞Í∞ÑÍ≥?Í≤πÏπò???ºÏ†ï" Ï°∞Í±¥:
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
function buildStartWithinWhere(userId, rangeStart, rangeEnd) {
  // Filter by startDate only, excluding items that start before the range.
  return {
    userId,
    AND: [
      { startDate: { not: null } },
      { startDate: { gte: rangeStart } },
      { startDate: { lte: rangeEnd } },
    ],
  };
}
async function create({ userId, text, startDate, endDate, isAllDay, categoryId }) {
  await ensureCategoryOwned(userId, categoryId);

  let s = startDate ?? null;
  let e = endDate ?? null;
  const allDay = !!isAllDay;

  // ???ïÏ±Ö Í∞ïÏ†ú
  if (allDay) {
    if (!s) {
      const err = new Error("isAllDay=true requires startDate");
      err.statusCode = 400;
      throw err;
    }
    const normalizedStart = startOfDayLocal(s);
    const normalizedEnd = e ? endOfDayLocal(e) : endOfDayLocal(normalizedStart);
    if (normalizedEnd.getTime() < normalizedStart.getTime()) {
      const err = new Error("endDate cannot be earlier than startDate");
      err.statusCode = 400;
      throw err;
    }
    s = normalizedStart;
    e = normalizedEnd;
  } else {
    // ?ºÎ∞ò ?ºÏ†ï?¥Î©¥ end < start Î∞©Ïñ¥(?????àÏùÑ ??
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

  // ?∞ÏÑ†?úÏúÑ: from/to > date > filter > ?ÑÏ≤¥
  if (from && to) {
    where = buildOverlapWhere(userId, from, to);
  } else if (date) {
    const d = new Date(`${date}T00:00:00`);
    where = buildStartWithinWhere(userId, startOfDay(d), endOfDay(d));
  } else if (filter === "today") {
    const now = new Date();
    where = buildStartWithinWhere(userId, startOfDay(now), endOfDay(now));
  } else if (filter === "week") {
    const now = new Date();
    where = buildStartWithinWhere(userId, startOfWeekMonday(now), endOfWeekMonday(now));
  }

  return prisma.todo.findMany({
    where,
    orderBy: [
      { isAllDay: "desc" },    // ?òÎ£®Ï¢ÖÏùº???ÑÎ°ú (?êÌïòÎ©???†ú)
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

  // ???ÑÏû¨Í∞?+ Î≥ÄÍ≤ΩÍ∞í???©Ï≥ê???ïÏ±Ö Í∞ïÏ†ú
  const nextIsAllDay = isAllDay !== undefined ? isAllDay : exists.isAllDay;

  // startDate/endDate??"?îÏ≤≠????Í∞????àÏúºÎ©?Í∑∏Í±∏ ?∞Í≥†, ?ÜÏúºÎ©?Í∏∞Ï°¥ ?†Ï?
  const nextStart =
    startDate !== undefined ? startDate : exists.startDate; // startDate??Date|null
  const nextEnd =
    endDate !== undefined ? endDate : exists.endDate;

  // ?ïÏ±Ö Í∞ïÏ†ú
  let normalizedStart = nextStart;
  let normalizedEnd = nextEnd;

  if (nextIsAllDay) {
    if (!normalizedStart) {
      const err = new Error("isAllDay=true requires startDate");
      err.statusCode = 400;
      throw err;
    }
    const normalizedStartDay = startOfDayLocal(normalizedStart);
    const normalizedEndDay = normalizedEnd ? endOfDayLocal(normalizedEnd) : endOfDayLocal(normalizedStartDay);
    if (normalizedEndDay.getTime() < normalizedStartDay.getTime()) {
      const err = new Error("endDate cannot be earlier than startDate");
      err.statusCode = 400;
      throw err;
    }
    normalizedStart = normalizedStartDay;
    normalizedEnd = normalizedEndDay;
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

      // ??start/end???úÏöîÏ≤?ù¥ ?îÍ±∞?? allDay ?ïÏ±Ö?ºÎ°ú ?∏Ìï¥ Í∞ïÏ†ú ??ñ¥??Í≤ΩÏö∞???Ä??
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


