/**
 * @swagger
 * components:
 *   schemas:
 *     Donation:
 *       type: object
 *       properties:
 *         donation_id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         location:
 *           type: string
 *         quantity_value:
 *           type: number
 *           format: float
 *         quantity_unit:
 *           type: string
 *           enum: [kg, g, liter, ml]
 *         expiry_date:
 *           type: string
 *           format: date
 *         category:
 *           type: string
 *           enum: [vegetables, fruits, bakery, dairy, meat, non-perishable, prepared-food]
 *         donation_status:
 *           type: string
 *           enum: [available, confirmed, completed, canceled]
 *         donation_picture:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     DonationInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - location
 *         - quantity_value
 *         - quantity_unit
 *         - category
 *         - expiry_date
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         location:
 *           type: string
 *         quantity_value:
 *           type: number
 *           format: float
 *         quantity_unit:
 *           type: string
 *           enum: [kg, g, liter, ml]
 *         category:
 *           type: string
 *           enum: [vegetables, fruits, bakery, dairy, meat, non-perishable, prepared-food]
 *         expiry_date:
 *           type: string
 *           format: date
 *         donation_picture:
 *           type: string
 *           format: binary
 *
 *     DonationUpdateInput:
 *       type: object
 *       required:
 *         - donation_status
 *       properties:
 *         donation_status:
 *           type: string
 *           enum: [available, confirmed, completed, canceled]
 *         donation_picture:
 *           type: string
 *           format: binary
 */

/**
 * @swagger
 * tags:
 *   name: Donations
 *   description: Manage donation postings and status
 */

/**
 * @swagger
 * /donation:
 *   get:
 *     summary: Get all donations
 *     tags: [Donations]
 *     responses:
 *       200:
 *         description: List of donations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Donation'
 */

/**
 * @swagger
 * /donation/{id}:
 *   get:
 *     summary: Get a donation by ID
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the donation
 *     responses:
 *       200:
 *         description: Donation details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       404:
 *         description: Donation not found
 */

/**
 * @swagger
 * /donation:
 *   post:
 *     summary: Create a new donation
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/DonationInput'
 *     responses:
 *       201:
 *         description: Donation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /donation/{id}:
 *   put:
 *     summary: Update donation status or picture
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the donation to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/DonationUpdateInput'
 *     responses:
 *       200:
 *         description: Donation updated successfully
 *       400:
 *         description: Missing or invalid fields
 *       404:
 *         description: Donation not found
 *       500:
 *         description: Server error
 */
