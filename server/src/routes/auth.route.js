/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: 인증/인가
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, nickname, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@test.com
 *               nickname:
 *                 type: string
 *                 example: eunju
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       201:
 *         description: 생성 성공
 *       409:
 *         description: 이메일 중복
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인 (accessToken, refreshToken 발급)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@test.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 토큰 재발급 (refreshToken으로 accessToken 재발급 + refresh 회전)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOi..."
 *     responses:
 *       200:
 *         description: 재발급 성공
 *       401:
 *         description: refresh 만료/폐기
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃 (Redis refresh 삭제)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *       401:
 *         description: 토큰 없음/만료
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */


const router = require("express").Router();
const { z } = require("zod");
const { validate } = require("../utils/validate");
const authController = require("../controllers/auth.controller");
const { authRequired } = require("../middlewares/auth");

const signupSchema = z.object({
  body: z.object({
    email: z.string().email("이메일 형식이 올바르지 않습니다"),
    nickname: z.string().min(1, "닉네임을 입력하세요").max(30),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다").max(72)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("이메일 형식이 올바르지 않습니다"),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다").max(72)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", authRequired, authController.logout);

module.exports = router;
