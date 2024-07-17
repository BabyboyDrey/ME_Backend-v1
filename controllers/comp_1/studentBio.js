const express = require('express')
const asyncErrCatcher = require('../../middlewares/asyncErrCatcher')
const Student = require('../../models/comp_1/studentsBio')
const user4Auth = require('../../middlewares/user4Auth')
const fs = require('fs')
const { upload } = require('../../multer/multer_jpeg')
const user1Auth = require('../../middlewares/user1Auth')
const checkAndDeleteFile = require('../../utils/checkAndDeleteFile')
const { default: mongoose } = require('mongoose')
const router = express.Router()

// POST REQUEST

function filterByTcName (data, dataType) {
  let groupedData
  if (dataType === 'Student') {
    groupedData = data.reduce((acc, obj) => {
      const { school_name, ...rest } = obj
      if (!acc[school_name]) {
        acc[school_name] = [{ school_name, ...rest }]
      } else {
        acc[school_name].push({ school_name, ...rest })
      }
      return acc
    }, {})
  }
  return groupedData
}

router.post(
  '/make-post-student-bio',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body

      const student_exists = await Student.findOne({
        [`${items.jurisdiction}_tc`]: {
          $elemMatch: { reg_num: items.reg_num }
        }
      })

      if (student_exists) {
        // if (req.file) {
        //   const filePath = `uploads/${req.file.filename}`
        //   checkAndDeleteFile(filePath, err => {
        //     if (err) {
        //       console.error(err)
        //     }
        //   })
        // }
        return res.status(400).json({ Message: 'Student exists' })
      }

      const new_item = await Student.findOneAndUpdate(
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
        Message: 'Student successfully created',
        new_item: new_item[`${items.jurisdiction}_tc`]
      })
    } catch (err) {
      res.status(500).json({ ErrMessage: err })
    }
  })
)

// GET REQUEST

router.get(
  '/get-post-student-bio/:bio_id',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_student = await Student.findOne({
        [`${req.query.jurisdiction}_tc`]: {
          $elemMatch: {
            _id: new mongoose.Types.ObjectId(req.params.bio_id)
          }
        }
      })

      if (!found_student) {
        return res
          .status(404)
          .json({ success: false, message: 'Student not found' })
      }

      const subDocs = found_student[`${req.query.jurisdiction}_tc`]

      const subDoc = subDocs.find(e => e._id.toString() === req.params.bio_id)

      res.status(200).json({
        success: true,
        subDoc
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

router.get(
  '/get-all-students',
  asyncErrCatcher(async (req, res) => {
    try {
      const all_students = await Student.find({
        [`${req.query.jurisdiction}_tc`]: {
          $exists: true
        }
      })

      res.status(200).json({
        success: true,
        all_students: all_students[0][`${req.query.jurisdiction}_tc`]
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

// UPDATE REQUEST

router.put(
  '/update-student-bio/:id',
  upload.single('jpeg'),
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body

      const found_student = await Student.findOne({
        [`${items.jurisdiction}_tc._id`]: new mongoose.Types.ObjectId(
          req.params.id
        )
      })

      if (!found_student) {
        if (req.file) {
          const filePath = `uploads/${req.file.filename}`
          checkAndDeleteFile(filePath, err => {
            if (err) {
              console.error(err)
            }
          })
        }
        return res.status(404).json({ Message: 'Post not found' })
      }

      const subDocs = found_student[`${items.jurisdiction}_tc`]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.id)

      if (req.file) {
        items.image_jpeg = req.file.filename
        if (subDoc && subDoc.image_jpeg) {
          const filePath = `uploads/${subDoc.image_jpeg}`
          checkAndDeleteFile(filePath, err => {
            if (err) {
              console.error(err)
            }
          })
        }
      }

      if (!subDoc) {
        if (req.file) {
          const filePath = `uploads/${req.file.filename}`
          checkAndDeleteFile(filePath, err => {
            if (err) {
              console.error(err)
            }
          })
        }
        return res.status(400).json({ Message: 'Subdocument not found' })
      }

      // items.awards.forEach(item => {
      //   if (!subDoc.awards.includes(item)) {
      //     subDoc.awards.push(item)
      //   }
      // })

      // delete items.awards

      Object.assign(subDoc, items)

      await found_student.save()

      res.status(200).json({ success: true, updated_post: subDoc })
    } catch (err) {
      if (req.file) {
        const filePath = `uploads/${req.file.filename}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }
      console.error(err)

      res.status(500).json({ ErrMessage: err })
    }
  })
)

// DELETE REQUEST

// router.delete(
//   '/delete-post-student-bio/:student_id',
//   user4Auth,
//   asyncErrCatcher(async (req, res) => {
//     try {
//       let found_student
//       let delete_post

//       if (req.user.role !== 'user4') {
//         return res.status(403).json(`Unauthorized accesss`)
//       }

//       found_student = await Student.findOne({
//         _id: req.params.student_id
//       }).maxTimeMS(10000)

//       if (!found_student) {
//         return res.status(400).json(`Err! No student with sent Id`)
//       }

//       if (found_student.image) {
//         fs.unlinkSync(`uploads/${found_student.image}`, unlinkErr => {
//           if (unlinkErr) {
//             console.error(unlinkErr)
//           }
//         }).then(`Deleted file: ${found_student.image}`)
//       }

//       delete_post = await Student.deleteOne({
//         _id: found_student._id
//       }).maxTimeMS(10000)

//       res.status(200).json({
//         success: true,
//         delete_post
//       })
//     } catch (err) {
//       res.status(500).json(`Err message: ${err}`)
//     }
//   })
// )

router.delete(
  '/delete-post-student-bio/:id',
  asyncErrCatcher(async (req, res) => {
    try {
      const query = {}
      query[`${req.query.jurisdiction}_tc._id`] = new mongoose.Types.ObjectId(
        req.params.id
      )
      const found_student = await Student.findOne(query)

      if (!found_student) {
        return res.status(404).json({ message: 'Student not found' })
      }

      const subDocs = found_student[`${req.query.jurisdiction}_tc`]

      const subDocIndex = subDocs.findIndex(
        e => e._id.toString() === req.params.id
      )

      if (subDocIndex === -1) {
        return res.status(404).json({ message: 'Subdocument not found' })
      }

      const subDoc = subDocs[subDocIndex]
      if (subDoc.image_jpeg) {
        const filePath = `uploads/${subDoc.image_jpeg}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }

      const deleted_student = subDocs.splice(subDocIndex, 1)

      await found_student.save()

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
        deleted_student
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

module.exports = router
