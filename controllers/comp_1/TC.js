const express = require('express')
const asyncErrCatcher = require('../../middlewares/asyncErrCatcher')
const Tc = require('../../models/comp_1/TC')
const user4Auth = require('../../middlewares/user4Auth')
const user1Auth = require('../../middlewares/user1Auth')
const { default: mongoose } = require('mongoose')
const router = express.Router()

// POST REQUEST

router.post(
  '/make-post-tc',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body

      const post_exists = await Tc.findOne({
        [`${items.jurisdiction}_tc`]: {
          $elemMatch: { institution_name: items.institution_name }
        }
      })

      if (post_exists) {
        return res.status(400).json({ Message: 'Post exists' })
      }

      const new_item = await Tc.findOneAndUpdate(
        {},
        {
          $push: {
            [`${items.jurisdiction}_tc`]: items
          }
        },
        { new: true, upsert: true }
      )

      res.status(200).json({
        success: true,
        Message: 'Post successfully created',
        new_item: new_item[`${items.jurisdiction}_tc`]
      })
    } catch (err) {
      res.status(500).json({ ErrMessage: err })
    }
  })
)

// PUT REQUEST

router.put(
  '/update-post-tc/:id',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body

      const found_post = await Tc.findOne({
        [`${items.jurisdiction}_tc._id`]: new mongoose.Types.ObjectId(
          req.params.id
        )
      })

      if (!found_post) {
        return res.status(404).json({ Message: 'Post not found' })
      }

      const subDocs = found_post[`${items.jurisdiction}_tc`]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.id)
      Object.assign(subDoc, items)

      await found_post.save()

      res.status(200).json({ success: true, updated_post: subDoc })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

// GET REQUEST

router.get(
  '/get-post/:id',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_post = await Tc.findOne({
        [`${req.query.jurisdiction}_tc`]: {
          $elemMatch: {
            _id: new mongoose.Types.ObjectId(req.params.id)
          }
        }
      })

      if (!found_post) {
        return res
          .status(404)
          .json({ success: false, message: 'Post not found' })
      }

      const subDocs = found_post[`${req.query.jurisdiction}_tc`]

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
  '/get-all-posts',
  asyncErrCatcher(async (req, res) => {
    try {
      const all_posts = await Tc.find({
        [`${req.query.jurisdiction}_tc`]: {
          $exists: true
        }
      })

      res.status(200).json({
        success: true,
        all_posts: all_posts[0][`${req.query.jurisdiction}_tc`]
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

// DELETE REQUEST

router.delete(
  '/delete-post-tc/:id',
  asyncErrCatcher(async (req, res) => {
    try {
      const query = {}
      query[`${req.query.jurisdiction}_tc._id`] = new mongoose.Types.ObjectId(
        req.params.id
      )
      const found_post = await Tc.findOne(query)

      if (!found_post) {
        return res.status(404).json({ message: 'Post not found' })
      }

      const subDocs = found_post[`${req.query.jurisdiction}_tc`]

      const subDocIndex = subDocs.findIndex(
        e => e._id.toString() === req.params.id
      )

      if (subDocIndex === -1) {
        return res.status(404).json({ message: 'Subdocument not found' })
      }

      const deleted_post = subDocs.splice(subDocIndex, 1)

      await found_post.save()

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
        deleted_post
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

module.exports = router
