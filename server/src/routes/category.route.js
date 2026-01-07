/**
 * @swagger
 * tags:
 *   - name: Category
 *     description: 카테고리 관리
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: 카테고리 생성
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: 공부
 *               color:
 *                 type: string
 *                 example: "#FF6B6B"
 *     responses:
 *       201:
 *         description: 생성 성공
 *       401:
 *         description: 인증 필요
 *       409:
 *         description: 동일 이름 카테고리 중복
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: 카테고리 목록 조회
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 조회 성공
 *       401:
 *         description: 인증 필요
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: 카테고리 수정
 *     tags: [Category]
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
 *               name:
 *                 type: string
 *                 example: 운동
 *               color:
 *                 type: string
 *                 example: "#4DABF7"
 *     responses:
 *       200:
 *         description: 수정 성공
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 카테고리 없음
 *       409:
 *         description: 동일 이름 중복
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: 카테고리 삭제 (연결된 todo.categoryId는 NULL 처리)
 *     tags: [Category]
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
 *         description: 카테고리 없음
 */


const router = require("express").Router();
const { z } = require("zod");
const { validate } = require("../utils/validate");
const { authRequired } = require("../middlewares/auth");
const categoryController = require("../controllers/category.controller");

const ALLOWED_COLORS = [
  "#F1F1EF",
  "#F4EEEE",
  "#FBECDD",
  "#FBF3DB",
  "#EDF3EC",
  "#E7F3F8",
  "#F6F3F9",
  "#FAF1F5",
  "#FDEBEC",
];


const createSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(20),
    color: z
      .string()
      .refine((v) => ALLOWED_COLORS.includes(v), { message: "허용되지 않은 카테고리 색상입니다." })
      .default("#E7F3F8"),
  }),
});

const updateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(30).optional(),

    color: z
      .string()
      .refine((v) => ALLOWED_COLORS.includes(v), {
        message: "허용되지 않은 카테고리 색상입니다.",
      })
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});


const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

router.use(authRequired);

router.post("/", validate(createSchema), categoryController.create);
router.get("/", categoryController.list);
router.patch("/:id", validate(updateSchema), categoryController.update);
router.delete("/:id", validate(idParamSchema), categoryController.remove);

module.exports = router;
