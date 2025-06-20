/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       properties:
 *         rating_id:
 *           type: integer
 *         donation_id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         rate:
 *           type: number
 *           format: float
 *         review:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     RatingInput:
 *       type: object
 *       required:
 *         - donation_id
 *         - rate
 *       properties:
 *         donation_id:
 *           type: integer
 *         rate:
 *           type: number
 *           format: float
 *           minimum: 1
 *           maximum: 5
 *         review:
 *           type: string
 *           nullable: true
 *
 *     RatingByDonor:
 *       type: object
 *       properties:
 *         rating_id:
 *           type: integer
 *         rate:
 *           type: number
 *         review:
 *           type: string
 *         donation_id:
 *           type: integer
 *         donation_title:
 *           type: string
 *         donation_picture:
 *           type: string
 *         rater_name:
 *           type: string
 *         rater_picture:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Manage donation ratings
 */

/**
 * @swagger
 * /ratings:
 *   get:
 *     summary: Get all ratings
 *     tags: [Ratings]
 *     responses:
 *       200:
 *         description: List of all ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rating'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /ratings/{id}:
 *   get:
 *     summary: Get a rating by ID
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the rating
 *     responses:
 *       200:
 *         description: Rating data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       404:
 *         description: Rating not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Create a new rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RatingInput'
 *     responses:
 *       201:
 *         description: Rating created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /ratings/donor/{donorId}:
 *   get:
 *     summary: Get ratings for a specific donor
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: donorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the donor (owner of donations)
 *     responses:
 *       200:
 *         description: Ratings with donation and rater info
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RatingByDonor'
 *       500:
 *         description: Server error
 */
