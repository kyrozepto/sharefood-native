/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         notification_id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         type:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         is_read:
 *           type: boolean
 *         is_deleted:
 *           type: boolean
 *         data:
 *           type: object
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     NotificationInput:
 *       type: object
 *       required:
 *         - user_id
 *         - type
 *         - title
 *         - message
 *       properties:
 *         user_id:
 *           type: integer
 *         type:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           nullable: true
 *
 *     NotificationUpdateReadInput:
 *       type: object
 *       required:
 *         - is_read
 *       properties:
 *         is_read:
 *           type: boolean
 */

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Manage user notifications
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the notification
 *     responses:
 *       200:
 *         description: Notification data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /notifications/user/{user_id}:
 *   get:
 *     summary: Get notifications for a specific user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Notifications for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationInput'
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Required fields missing
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Soft delete a notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Update notification read status
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationUpdateReadInput'
 *     responses:
 *       200:
 *         description: Notification read status updated
 *       400:
 *         description: Invalid input for is_read
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
