
/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: 투두/일정 생성
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: "하루종일 일정"
 *               isAllDay:
 *                 type: boolean
 *                 description: "true면 startDate는 필수이며, endDate는 서버에서 자동으로 당일 23:59:59.999로 저장됩니다."
 *                 example: true
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: "isAllDay=true일 때 필수(해당 날짜 기준으로 00:00~23:59로 저장)"
 *                 example: "2026-01-06T09:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: "isAllDay=true면 무시됩니다(서버가 자동 계산)"
 *                 example: "2026-01-06T10:00:00.000Z"
 *               categoryId:
 *                 type: string
 *                 nullable: true
 */



const router = require("express").Router();
const { z } = require("zod");
const { validate } = require("../utils/validate");
const { authRequired } = require("../middlewares/auth");
const todoController = require("../controllers/todo.controller");


// -------- Zod Schemas --------
const createSchema = z.object({
  body: z
    .object({
      text: z.string().min(1).max(300),
      startDate: z.iso.datetime().optional().nullable(),
      endDate: z.iso.datetime().optional().nullable(),
      isAllDay: z.boolean().optional(),
      categoryId: z.string().uuid().optional().nullable(),
    })
    .superRefine((val, ctx) => {
      if (val.isAllDay === true && !val.startDate) {
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: "하루 종일 선택 시 시작 일시도 함께 보내주세요.",
        });
      }

      if (val.isAllDay !== true && val.startDate && val.endDate) {
        const s = new Date(val.startDate).getTime();
        const e = new Date(val.endDate).getTime();
        if (e < s) {
          ctx.addIssue({
            code: "custom",
            path: ["endDate"],
            message: "종료 일시는 시작 일시보다 빠를 수 없어요",
          });
        }
      }
    }),
});

const updateSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z
    .object({
      text: z.string().min(1).max(300).optional(),
      startDate: z.iso.datetime().optional().nullable(),
      endDate: z.iso.datetime().optional().nullable(),
      isAllDay: z.boolean().optional(),
      categoryId: z.string().uuid().optional().nullable(),
      isCompleted: z.boolean().optional(),
    })
    .superRefine((val, ctx) => {
      if (val.isAllDay === true && val.startDate === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: "하루 종일 선택 시 시작 일시도 함께 보내주세요.",
        });
      }

      if (val.isAllDay !== true && val.startDate && val.endDate) {
        const s = new Date(val.startDate).getTime();
        const e = new Date(val.endDate).getTime();
        if (e < s) {
          ctx.addIssue({
            code: "custom",
            path: ["endDate"],
            message: "종료 일시는 시작 일시보다 빠를 수 없어요",
          });
        }
      }
    }),
});

const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

const listSchema = z.object({
  query: z.object({
    date: z.string().optional(),
    filter: z.enum(["today", "week"]).optional(),
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
  }),
});

// -------- Routes --------
router.use(authRequired);

router.post("/", validate(createSchema), todoController.create);
router.get("/", validate(listSchema), todoController.list);
router.patch("/:id", validate(updateSchema), todoController.update);
router.patch("/:id/toggle", validate(idParamSchema), todoController.toggle);
router.delete("/:id", validate(idParamSchema), todoController.remove);

module.exports = router;
