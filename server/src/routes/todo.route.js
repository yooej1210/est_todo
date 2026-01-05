/**
 * @swagger
 * tags:
 *   - name: Todo
 *     description: 투두 관리
 */

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: 투두 생성
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Prisma 공부하기
 *               content:
 *                 type: string
 *                 example: Swagger까지 붙이기
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-01-06T09:00:00.000Z"
 *               categoryId:
 *                 type: string
 *                 nullable: true
 *                 example: "0f3c2f4a-1a2b-3c4d-5e6f-1234567890ab"
 *     responses:
 *       201:
 *         description: 생성 성공
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: categoryId가 있는데 카테고리 없음
 */

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: 투두 목록 조회 (date 또는 filter 사용)
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *         description: "YYYY-MM-DD"
 *         example: "2026-01-05"
 *       - in: query
 *         name: filter
 *         required: false
 *         schema:
 *           type: string
 *           enum: [today, week]
 *         example: "today"
 *     responses:
 *       200:
 *         description: 조회 성공
 *       401:
 *         description: 인증 필요
 */

/**
 * @swagger
 * /api/todos/{id}:
 *   patch:
 *     summary: 투두 수정
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "0f3c2f4a-1a2b-3c4d-5e6f-1234567890ab"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *                 nullable: true
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               categoryId:
 *                 type: string
 *                 nullable: true
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 수정 성공
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 투두 없음
 */

/**
 * @swagger
 * /api/todos/{id}/toggle:
 *   patch:
 *     summary: 완료/미완료 토글
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "0f3c2f4a-1a2b-3c4d-5e6f-1234567890ab"
 *     responses:
 *       200:
 *         description: 토글 성공
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 투두 없음
 */

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: 투두 삭제
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "0f3c2f4a-1a2b-3c4d-5e6f-1234567890ab"
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 투두 없음
 */


const router = require("express").Router();
const { z } = require("zod");
const { validate } = require("../utils/validate");
const { authRequired } = require("../middlewares/auth");
const todoController = require("../controllers/todo.controller");

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100),
    content: z.string().max(2000).optional(),
    dueDate: z.string().datetime().optional(),     // ISO string
    categoryId: z.string().uuid().optional().nullable(),
  }),
});

const updateSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    content: z.string().max(2000).optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    categoryId: z.string().uuid().optional().nullable(),
    isCompleted: z.boolean().optional(),
  }),
});

const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

const listSchema = z.object({
  query: z.object({
    date: z.string().optional(),                 // YYYY-MM-DD
    filter: z.enum(["today", "week"]).optional() // today|week
  }),
});

router.use(authRequired);

router.post("/", validate(createSchema), todoController.create);
router.get("/", validate(listSchema), todoController.list);
router.patch("/:id", validate(updateSchema), todoController.update);
router.patch("/:id/toggle", validate(idParamSchema), todoController.toggle);
router.delete("/:id", validate(idParamSchema), todoController.remove);

module.exports = router;
