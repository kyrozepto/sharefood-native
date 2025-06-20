/**
 * @swagger
 * components:
 *   schemas:
 *     Request:
 *       type: object
 *       properties:
 *         request_id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         donation_id:
 *           type: integer
 *         requested_quantity:
 *           type: number
 *           format: float
 *         pickup_time:
 *           type: string
 *           format: date-time
 *         note:
 *           type: string
 *         request_status:
 *           type: string
 *           enum: [waiting, approved, rejected, canceled, completed]
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     RequestInput:
 *       type: object
 *       required:
 *         - user_id
 *         - donation_id
 *         - requested_quantity
 *         - pickup_time
 *       properties:
 *         user_id:
 *           type: integer
 *         donation_id:
 *           type: integer
 *         requested_quantity:
 *           type: number
 *           format: float
 *         pickup_time:
 *           type: string
 *           format: date-time
 *         note:
 *           type: string
 *
 *     RequestUpdateInput:
 *       type: object
 *       required:
 *         - request_status
 *       properties:
 *         request_status:
 *           type: string
 *           enum: [waiting, approved, rejected, canceled, completed]
 */

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Manage donation requests
 */

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get all donation requests
 *     tags: [Requests]
 *     responses:
 *       200:
 *         description: List of requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /requests/{id}:
 *   get:
 *     summary: Get a request by ID
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the request
 *     responses:
 *       200:
 *         description: Request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a new donation request
 *     tags: [Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/RequestInput'
 *     responses:
 *       201:
 *         description: Request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /requests/{id}:
 *   put:
 *     summary: Update donation request status
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the request to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/RequestUpdateInput'
 *     responses:
 *       200:
 *         description: Request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       400:
 *         description: Invalid update data
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
