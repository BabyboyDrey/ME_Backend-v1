const { default: mongoose } = require('mongoose')
const asyncErrCatcher = require('../../middlewares/asyncErrCatcher')
const user1Auth = require('../../middlewares/user1Auth')
const Teachers = require('../../models/comp_1/Teachers')
const user4Auth = require('../../middlewares/user4Auth')
const router = require('express').Router()

// POST REQUEST

router.post(
  '/create-teacher',
  user1Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      items.date_of_birth = new Date(items.date_of_birth)
      const found_teacher = await Teachers.findOne({
        [`${req.user.jurisdiction}_tc`]: {
          $elemMatch: {
            email: items.email
          }
        }
      })

      if (found_teacher) {
        return res.status(400).json('Teacher exists with this email')
      }

      const new_teacher = await Teachers.findOneAndUpdate(
        {},
        {
          $push: {
            [`${req.user.jurisdiction}_tc`]: items
          }
        },
        { new: true, upsert: true }
      )

      res.status(200).json({
        success: true,
        new_teacher: new_teacher[`${req.user.jurisdiction}_tc`],
        message: 'Teacher created'
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

// PUT REQUESTS

router.put(
  '/update-teacher/:id',
  user1Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body

      const found_teacher = await Teachers.findOne({
        [`${req.user.jurisdiction}_tc._id`]: new mongoose.Types.ObjectId(
          req.params.id
        )
      })

      if (!found_teacher) {
        return res.status(404).json({ Message: 'Teacher not found' })
      }

      const subDocs = found_teacher[`${req.user.jurisdiction}_tc`]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.id)

      Object.assign(subDoc, items)

      await found_teacher.save()

      res.status(200).json({ success: true, updated_teacher: subDoc })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

// GET REQUESTS

router.get(
  '/get-teacher-data/:id',
  user1Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const found_teacher = await Teachers.findOne({
        [`${req.user.jurisdiction}_tc`]: {
          $elemMatch: {
            _id: new mongoose.Types.ObjectId(req.params.id)
          }
        }
      })

      if (!found_teacher) {
        return res
          .status(404)
          .json({ success: false, message: 'Teacher not found' })
      }

      const subDocs = found_teacher[`${req.user.jurisdiction}_tc`]

      const subDoc = subDocs.find(e => e._id.toString() === req.params.id)

      res.status(200).json({
        success: true,
        subDoc
      })
    } catch (err) {
      res.status(500).json({ ErrMessage: err })
    }
  })
)

router.get(
  '/get-all-students',
  user1Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const all_teachers = await Teachers.find({
        [`${req.user.jurisdiction}_tc`]: {
          $exists: true
        }
      })

      res.status(200).json({
        success: true,
        all_posts: all_teachers[0][`${req.user.jurisdiction}_tc`]
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

// DELETE REQUEST

router.delete(
  '/delete-teacher/:id',
  user4Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const query = {}
      query[`${req.query.jurisdiction}_tc._id`] = new mongoose.Types.ObjectId(
        req.params.id
      )

      const found_teacher = await Teachers.findOne(query)

      if (!found_teacher) {
        return res.status(404).json({ message: 'Teacher not found' })
      }

      const subDocs = found_teacher[`${req.query.jurisdiction}_tc`]

      const subDocIndex = subDocs.findIndex(
        e => e._id.toString() === req.params.id
      )

      if (subDocIndex === -1) {
        return res.status(404).json({ message: 'Subdocument not found' })
      }

      const deleted_teacher = subDocs.splice(subDocIndex, 1)

      await found_teacher.save()

      res.status(200).json({
        success: true,
        message: 'Teacher deleted successfully',
        deleted_teacher
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

module.exports = router
