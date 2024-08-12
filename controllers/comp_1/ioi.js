const express = require('express')
const asyncErrCatcher = require('../../middlewares/asyncErrCatcher')
const Ioi_comp1 = require('../../models/comp_1/IOI')
const { upload } = require('../../multer/multer_pdf')
const fs = require('fs')
const user1Auth = require('../../middlewares/user1Auth')
const user2Auth = require('../../middlewares/user2Auth.js')
const user4Auth = require('../../middlewares/user4Auth')
const mongoose = require('mongoose')
const router = express.Router()
const jwt = require('jsonwebtoken')

const createCookie = (user, statusCode, res) => {
  try {
    const payload = {
      email: user.email,
      jurisdiction: user.jurisdiction,
      role: user.role,
      tc_name: user.tc_name
    }

    let user4Token
    let user1Token
    if (payload.role === 'user4') {
      user4Token = jwt.sign(payload, process.env.JWT_SECRET_PASS, {
        expiresIn: '1hr'
      })
    } else {
      user1Token = jwt.sign(payload, process.env.JWT_SECRET_PASS, {
        expiresIn: '1hr'
      })
    }

    if (user4Token) {
      res
        .status(statusCode)
        .cookie('user4Token', user4Token, {
          sameSite: 'None',
          httpOnly: true,
          secure: true
        })
        .json({ success: true, token: user4Token })
    } else {
      res
        .status(statusCode)
        .cookie('user1Token', user1Token, {
          sameSite: 'None',
          httpOnly: true,
          secure: true
        })
        .json({ success: true, token: user1Token })
    }
  } catch (err) {
    res.status(500).json(`Err creating cookie: ${err}`)
  }
}

function checkAndDeleteFile (filePath, callback) {
  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      return callback(null)
    }

    fs.unlink(filePath, unlinkErr => {
      if (unlinkErr) {
        return callback(unlinkErr)
      }
      return callback(null)
    })
  })
}

async function handleFileUnlinking (files) {
  if (files) {
    for (const key in files) {
      for (const file of files[key]) {
        await new Promise((resolve, reject) => {
          checkAndDeleteFile(`uploads/${file.filename}`, err => {
            if (err) reject(err)
            else resolve()
          })
        })
      }
    }
  }
}

async function deleteFiles (filePaths) {
  if (Array.isArray(filePaths)) {
    for (const filePath of filePaths) {
      await new Promise((resolve, reject) => {
        checkAndDeleteFile(`uploads/${filePath}`, err => {
          if (err) reject(err)
          else resolve()
        })
      })
    }
  } else {
    await new Promise((resolve, reject) => {
      checkAndDeleteFile(`uploads/${filePaths}`, err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

// POST REQUEST SETTING COOKIES

router.post(
  '/set-user-cookies',
  asyncErrCatcher(async (req, res) => {
    try {
      const userData = req.body

      createCookie(userData, 200, res)
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

// POST REQUESTS

router.post(
  '/make-post-for-no-of-supported-tc',
  upload.fields([
    { name: 'report_pdf', maxCount: 1 },
    { name: 'all_signed_mous_pdf', maxCount: 4 },
    { name: 'minutes_pdf', maxCount: 4 }
  ]),
  asyncErrCatcher(async (req, res) => {
    try {
      const {
        sch_ideas_project_team_established,
        no_of_mous_signed_with_industry_partners,
        no_of_times_ciu_met_over_past_year,
        tc_name,
        jurisdiction,
        email,
        state
      } = req.body

      const new_tc_data = {}

      if (sch_ideas_project_team_established) {
        new_tc_data.sch_ideas_project_team_established = {
          value: sch_ideas_project_team_established
        }
      }

      if (no_of_mous_signed_with_industry_partners) {
        new_tc_data.no_of_mous_signed_with_industry_partners = {
          value: Number(no_of_mous_signed_with_industry_partners)
        }
      }

      if (no_of_times_ciu_met_over_past_year) {
        new_tc_data.no_of_times_ciu_met_over_past_year = {
          value: no_of_times_ciu_met_over_past_year
        }
      }

      new_tc_data.tc_name = tc_name
      new_tc_data.state = state
      new_tc_data.email_of_data_entry_personnel = email
      if (
        req.files &&
        req.files['report_pdf'] &&
        sch_ideas_project_team_established
      ) {
        new_tc_data.sch_ideas_project_team_established.report_pdf =
          req.files['report_pdf'][0].filename
      }
      if (
        req.files &&
        req.files['all_signed_mous_pdf'] &&
        req.files['all_signed_mous_pdf'].length > 0 &&
        no_of_mous_signed_with_industry_partners
      ) {
        new_tc_data.no_of_mous_signed_with_industry_partners.all_signed_mous_pdf =
          req.files['all_signed_mous_pdf'].map(file => file.filename)
      }
      if (
        req.files &&
        req.files['minutes_pdf'] &&
        req.files['minutes_pdf'].length > 0 &&
        no_of_times_ciu_met_over_past_year
      ) {
        new_tc_data.no_of_times_ciu_met_over_past_year.minutes_pdf = req.files[
          'minutes_pdf'
        ].map(file => file.filename)
      }

      if (
        sch_ideas_project_team_established === 'yes' &&
        no_of_mous_signed_with_industry_partners &&
        (no_of_times_ciu_met_over_past_year === 'twice' ||
          no_of_times_ciu_met_over_past_year === 'three times' ||
          no_of_times_ciu_met_over_past_year === 'four times')
      ) {
        new_tc_data.count = 1
      }

      let existingDoc
      if (jurisdiction === 'federal') {
        existingDoc = await Ioi_comp1.findOne({
          'no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.federal_tc':
            {
              $elemMatch: { tc_name: new_tc_data.tc_name }
            }
        })
      } else if (jurisdiction === 'state') {
        existingDoc = await Ioi_comp1.findOne({
          'no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.state_tc':
            {
              $elemMatch: { tc_name: new_tc_data.tc_name }
            }
        })
      }

      if (existingDoc) {
        if (req.files && req.files['report_pdf']) {
          fs.unlink(
            `uploads/${req.files['report_pdf'][0].filename}`,
            unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              } else {
                console.log(
                  `Deleted File: ${req.files['report_pdf'][0].filename}`
                )
              }
            }
          )
        }
        if (req.files && req.files['all_signed_mous_pdf']) {
          req.files['all_signed_mous_pdf'].forEach(file => {
            fs.unlink(`uploads/${file.filename}`, unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              } else {
                console.log(`Deleted File: ${file.filename}`)
              }
            })
          })
        }
        if (req.files && req.files['minutes_pdf']) {
          req.files['minutes_pdf'].forEach(file => {
            fs.unlink(`uploads/${file.filename}`, unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              } else {
                console.log(`Deleted File: ${file.filename}`)
              }
            })
          })
        }
        return res.status(400).json('TC data already inputed')
      }

      let newDoc
      if (jurisdiction === 'federal') {
        newDoc = await Ioi_comp1.findOneAndUpdate(
          {},
          {
            $push: {
              'no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.federal_tc':
                new_tc_data
            }
          },
          { new: true, upsert: true }
        )
      } else if (jurisdiction === 'state') {
        newDoc = await Ioi_comp1.findOneAndUpdate(
          {},
          {
            $push: {
              'no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.state_tc':
                new_tc_data
            }
          },
          { new: true, upsert: true }
        )
      }

      res.status(200).json({
        success: true,
        newDoc:
          newDoc.no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership
      })
    } catch (err) {
      if (req.files) {
        if (req.files && req.files['report_pdf']) {
          fs.unlink(
            `uploads/${req.files['report_pdf'][0].filename}`,
            unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              } else {
                console.log(
                  `Deleted File: ${req.files['report_pdf'][0].filename}`
                )
              }
            }
          )
        }
        if (req.files && req.files['all_signed_mous_pdf']) {
          req.files['all_signed_mous_pdf'].forEach(file => {
            fs.unlink(`uploads/${file.filename}`, unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              } else {
                console.log(`Deleted File: ${file.filename}`)
              }
            })
          })
        }
        if (req.files && req.files['minutes_pdf']) {
          req.files['minutes_pdf'].forEach(file => {
            fs.unlink(`uploads/${file.filename}`, unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              } else {
                console.log(`Deleted File: ${file.filename}`)
              }
            })
          })
        }
      }
      console.error(err)
      res.status(500).json(`Err: ${err}`)
    }
  })
)

router.post(
  '/make-post-no-of-training-programs-delivered-monitored',
  upload.fields([
    { name: 'attendance_sheet_pdf', maxCount: 1 },
    { name: 'latest_tc_status_report_pdf', maxCount: 4 }
  ]),
  asyncErrCatcher(async (req, res) => {
    try {
      const new_tc_data = req.body

      if (new_tc_data.no_of_industry_partners) {
        new_tc_data.no_of_industry_partners = Number(
          new_tc_data.no_of_industry_partners
        )
      }
      if (new_tc_data.no_of_internship_arrangements) {
        new_tc_data.no_of_internship_arrangements = Number(
          new_tc_data.no_of_internship_arrangements
        )
      }

      if (new_tc_data.no_of_internship_arrangements) {
        new_tc_data.no_of_internship_arrangements = Number(
          new_tc_data.no_of_internship_arrangements
        )
      }

      if (
        new_tc_data.no_of_newly_developed_short_term_skills_upgrading_courses_on_partnership_with_industry
      ) {
        new_tc_data.no_of_newly_developed_short_term_skills_upgrading_courses_on_partnership_with_industry =
          Number(
            new_tc_data.no_of_newly_developed_short_term_skills_upgrading_courses_on_partnership_with_industry
          )
      }

      if (
        new_tc_data.no_of_industry_partners &&
        new_tc_data.no_of_internship_arrangements
      ) {
        new_tc_data.count =
          new_tc_data.no_of_industry_partners +
          new_tc_data.no_of_internship_arrangements
      }

      if (
        req.files &&
        req.files['latest_tc_status_report_pdf'] &&
        req.files['latest_tc_status_report_pdf'].length > 0
      ) {
        new_tc_data.latest_tc_status_report_pdf = req.files[
          'latest_tc_status_report_pdf'
        ].map(file => file.filename)
      }
      if (req.files && req.files['attendance_sheet_pdf']) {
        new_tc_data.attendance_sheet_pdf =
          req.files['attendance_sheet_pdf'][0].filename
      }

      let existingDoc
      if (new_tc_data.jurisdiction === 'federal') {
        existingDoc = await Ioi_comp1.findOne({
          'no_of_training_programs_delivered_monitored.federal_tc': {
            $elemMatch: {
              tc_name: new_tc_data.tc_name
            }
          }
        })
      } else {
        existingDoc = await Ioi_comp1.findOne({
          'no_of_training_programs_delivered_monitored.state_tc': {
            $elemMatch: {
              tc_name: new_tc_data.tc_name
            }
          }
        })
      }

      if (existingDoc) {
        if (req.files && req.files['attendance_sheet_pdf']) {
          fs.unlink(
            `uploads/${req.files['attendance_sheet_pdf'][0].filename}`,
            unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              } else {
                console.log(
                  `Deleted File: ${req.files['attendance_sheet_pdf'][0].filename}`
                )
              }
            }
          )
        }
        if (req.files && req.files[latest_tc_status_report_pdf]) {
          req.files['latest_tc_status_report_pdf'].forEach(file => {
            fs.unlink(`uploads/${file.filename}`, unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              } else {
                console.log(`Deleted File: ${file.filename}`)
              }
            })
          })
        }
        return res.status(400).json(`Tc data already inputed`)
      }

      let newDoc
      if (new_tc_data.jurisdiction === 'federal') {
        newDoc = await Ioi_comp1.findOneAndUpdate(
          {},
          {
            $push: {
              'no_of_training_programs_delivered_monitored.federal_tc':
                new_tc_data
            }
          },
          { new: true, upsert: true }
        )
      } else {
        newDoc = await Ioi_comp1.findOneAndUpdate(
          {},
          {
            $push: {
              'no_of_training_programs_delivered_monitored.state_tc':
                new_tc_data
            }
          },
          { new: true, upsert: true }
        )
      }

      res.status(200).json({
        success: true,
        newDoc: newDoc.no_of_training_programs_delivered_monitored
      })
    } catch (err) {
      console.error(err)
      if (req.files && req.files['attendance_sheet_pdf']) {
        fs.unlink(
          `uploads/${req.files['attendance_sheet_pdf'][0].filename}`,
          unlinkErr => {
            if (unlinkErr) {
              console.error(unlinkErr)
            } else {
              console.log(
                `Deleted File: ${req.files['attendance_sheet_pdf'][0].filename}`
              )
            }
          }
        )
      }
      if (req.files && req.files['latest_tc_status_report_pdf']) {
        req.files['latest_tc_status_report_pdf'].forEach(file => {
          fs.unlink(`uploads/${file.filename}`, unlinkErr => {
            if (unlinkErr) {
              console.error(unlinkErr)
            } else {
              console.log(`Deleted File: ${file.filename}`)
            }
          })
        })
      }
      res.status(500).json(`Err making post. Message: ${err}`)
    }
  })
)

router.post(
  '/make-post-no-of-supported-tc-with-reporting-and-referral-mechanisms-for-gbv-affected-youth',
  upload.fields([
    { name: 'school_gbv_policy_pdf', maxCount: 1 },
    { name: 'sensitization_pdf', maxCount: 4 },
    { name: 'reports_showing_addressed_complaints_box_pdf', maxCount: 4 }
  ]),
  asyncErrCatcher(async (req, res) => {
    try {
      const {
        gbv_sensitization_conducted_by_the_school,
        gbv_policy_developed_by_school,
        gbv_policy_published_by_school,
        gbv_reporting_and_referral_system_for_youths_in_place_at_the_school,
        presence_of_grievance_redress_mechanism_at_the_school,
        jurisdiction,
        email_of_data_entry_personnel,
        tc_name,
        state
      } = req.body

      const new_tc_data = {}
      new_tc_data.tc_name = tc_name
      new_tc_data.email_of_data_entry_personnel = email_of_data_entry_personnel
      new_tc_data.state = state

      if (gbv_reporting_and_referral_system_for_youths_in_place_at_the_school) {
        new_tc_data.gbv_reporting_and_referral_system_for_youths_in_place_at_the_school =
          gbv_reporting_and_referral_system_for_youths_in_place_at_the_school
      }

      if (presence_of_grievance_redress_mechanism_at_the_school) {
        new_tc_data.presence_of_grievance_redress_mechanism_at_the_school =
          presence_of_grievance_redress_mechanism_at_the_school
      }

      if (gbv_policy_developed_by_school) {
        new_tc_data.gbv_policy_developed_by_school =
          gbv_policy_developed_by_school
      }
      if (gbv_sensitization_conducted_by_the_school) {
        new_tc_data.gbv_sensitization_conducted_by_the_school = {
          value: gbv_sensitization_conducted_by_the_school
        }
      }

      if (gbv_policy_published_by_school) {
        new_tc_data.gbv_policy_published_by_school = {
          value: gbv_policy_published_by_school
        }
      }

      if (
        new_tc_data.gbv_reporting_and_referral_system_for_youths_in_place_at_the_school ===
        'yes'
      ) {
        new_tc_data.count = 1
      }

      if (
        req.files &&
        req.files['sensitization_pdf'] &&
        req.files['sensitization_pdf'].length > 0 &&
        new_tc_data.gbv_sensitization_conducted_by_the_school
      ) {
        new_tc_data.gbv_sensitization_conducted_by_the_school.sensitization_pdf =
          req.files['sensitization_pdf'].map(file => file.filename)
      }
      if (
        req.files &&
        req.files['school_gbv_policy_pdf'] &&
        new_tc_data.gbv_policy_published_by_school
      ) {
        new_tc_data.gbv_policy_published_by_school.school_gbv_policy_pdf =
          req.files['school_gbv_policy_pdf'][0].filename
      }
      if (
        req.files &&
        req.files['reports_showing_addressed_complaints_box_pdf']
      ) {
        new_tc_data.reports_showing_addressed_complaints_box_pdf = req.files[
          'reports_showing_addressed_complaints_box_pdf'
        ].map(file => file.filename)
      }

      let existingDoc
      if (jurisdiction === 'federal') {
        existingDoc = await Ioi_comp1.findOne({
          'no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.federal_tc':
            {
              $elemMatch: {
                tc_name: new_tc_data.tc_name
              }
            }
        })
      } else {
        existingDoc = await Ioi_comp1.findOne({
          'no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.state_tc':
            {
              $elemMatch: {
                tc_name: new_tc_data.tc_name
              }
            }
        })
      }

      if (existingDoc) {
        if (
          req.files &&
          req.files['reports_showing_addressed_complaints_box_pdf']
        ) {
          req.files['reports_showing_addressed_complaints_box_pdf'].forEach(
            file => {
              fs.unlink(`uploads/${file.filename}`, unlinkErr => {
                if (unlinkErr) {
                  console.error(unlinkErr)
                }
              })
            }
          )
        }
        if (req.files && req.files['school_gbv_policy_pdf']) {
          fs.unlink(
            `uploads/${req.files['school_gbv_policy_pdf'][0].filename}`,
            unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              }
            }
          )
        }
        if (req.files && req.files['sensitization_pdf']) {
          req.files['sensitization_pdf'].forEach(file => {
            fs.unlink(`uploads/${file.filename}`, unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              }
            })
          })
        }

        return res.status(400).json(`Tc data alreday inputed`)
      }

      let newDoc
      if (jurisdiction === 'federal') {
        newDoc = await Ioi_comp1.findOneAndUpdate(
          {},
          {
            $push: {
              'no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.federal_tc':
                new_tc_data
            }
          },
          { new: true, upsert: true }
        )
      } else {
        newDoc = await Ioi_comp1.findOneAndUpdate(
          {},
          {
            $push: {
              'no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.state_tc':
                new_tc_data
            }
          },
          { new: true, upsert: true }
        )
      }
      res.status(200).json({
        success: true,
        newDoc:
          newDoc.no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth
      })
    } catch (err) {
      if (
        req.files &&
        req.files['reports_showing_addressed_complaints_box_pdf']
      ) {
        req.files['reports_showing_addressed_complaints_box_pdf'].forEach(
          file => {
            fs.unlink(`uploads/${file.filename}`, unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              }
            })
          }
        )
      }
      if (req.files && req.files['school_gbv_policy_pdf']) {
        fs.unlink(
          `uploads/${req.files['school_gbv_policy_pdf'][0].filename}`,
          unlinkErr => {
            if (unlinkErr) {
              console.error(unlinkErr)
            }
          }
        )
      }
      if (req.files && req.files['sensitization_pdf']) {
        req.files['sensitization_pdf'].forEach(file => {
          fs.unlink(`uploads/${file.filename}`, unlinkErr => {
            if (unlinkErr) {
              console.error(unlinkErr)
            }
          })
        })
      }
      console.error(err)
      res.status(500).json(err)
    }
  })
)

router.post(
  '/make-post-no-of-fully-functioning-upgraded-workshops-in-supported-tc',
  upload.fields([
    { name: 'doc_confirming_disbursment_received_pdf', maxCount: 1 },
    { name: 'status_report_pdf', maxCount: 1 },
    { name: 'ttis_status_report_pdf', maxCount: 1 }
  ]),
  asyncErrCatcher(async (req, res) => {
    try {
      const new_tc_data = req.body
      console.log(JSON.stringify(new_tc_data))

      if (new_tc_data.initial_disbursement_of_250kusd_received) {
        new_tc_data.initial_disbursement_of_250kusd_received = {
          value: new_tc_data.initial_disbursement_of_250kusd_received
        }
      }

      if (
        new_tc_data.no_of_workshops_equipped_with_modern_tools_and_ready_for_use
      ) {
        new_tc_data.no_of_workshops_equipped_with_modern_tools_and_ready_for_use =
          {
            value: Number(
              new_tc_data.no_of_workshops_equipped_with_modern_tools_and_ready_for_use
            )
          }
      }

      if (new_tc_data.no_of_ttis_trained_on_the_use_of_newly_installed_tools) {
        new_tc_data.no_of_ttis_trained_on_the_use_of_newly_installed_tools = {
          value: Number(
            new_tc_data.no_of_ttis_trained_on_the_use_of_newly_installed_tools
          )
        }
      }

      if (
        req.files &&
        req.files['doc_confirming_disbursment_received_pdf'] &&
        new_tc_data.initial_disbursement_of_250kusd_received
      ) {
        new_tc_data.initial_disbursement_of_250kusd_received.doc_confirming_disbursment_received_pdf =
          req.files['doc_confirming_disbursment_received_pdf'][0].filename
      }
      if (
        req.files &&
        req.files['status_report_pdf'] &&
        new_tc_data.no_of_workshops_equipped_with_modern_tools_and_ready_for_use
      ) {
        new_tc_data.no_of_workshops_equipped_with_modern_tools_and_ready_for_use.status_report_pdf =
          req.files['status_report_pdf'][0].filename
      }
      if (
        req.files &&
        req.files['ttis_status_report_pdf'] &&
        new_tc_data.no_of_ttis_trained_on_the_use_of_newly_installed_tools
      ) {
        new_tc_data.no_of_ttis_trained_on_the_use_of_newly_installed_tools.ttis_status_report_pdf =
          req.files['ttis_status_report_pdf'][0].filename
      }

      if (
        new_tc_data.no_of_workshops_equipped_with_modern_tools_and_ready_for_use
      ) {
        new_tc_data.count = Number(
          new_tc_data
            .no_of_workshops_equipped_with_modern_tools_and_ready_for_use.value
        )
      }

      if (
        new_tc_data.no_of_workshops_equipped_with_modern_tools_and_ready_for_use &&
        new_tc_data.training_of_ttis_on_the_use_of_newly_installed_tools
      ) {
        new_tc_data.fulfilled =
          new_tc_data
            .no_of_workshops_equipped_with_modern_tools_and_ready_for_use
            .value >= 1 &&
          new_tc_data.training_of_ttis_on_the_use_of_newly_installed_tools ===
            'yes'
            ? new_tc_data.training_of_ttis_on_the_use_of_newly_installed_tools
            : 'no'
      }

      let existingDoc
      if (new_tc_data.jurisdiction === 'federal') {
        existingDoc = await Ioi_comp1.findOne({
          'no_of_fully_functioning_upgraded_workshops_in_supported_tc.federal_tc':
            {
              $elemMatch: {
                tc_name: new_tc_data.tc_name
              }
            }
        }).maxTimeMS(10000)
      } else {
        existingDoc = await Ioi_comp1.findOne({
          'no_of_fully_functioning_upgraded_workshops_in_supported_tc.state_tc':
            {
              $elemMatch: {
                tc_name: new_tc_data.tc_name
              }
            }
        }).maxTimeMS(10000)
      }

      if (existingDoc) {
        if (req.files && req.files['ttis_status_report_pdf']) {
          fs.unlink(
            `uploads/${req.files['ttis_status_report_pdf'][0].filename}`,
            unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              }
            }
          )
        }
        if (req.files && req.files['status_report_pdf']) {
          fs.unlink(
            `uploads/${req.files['status_report_pdf'][0].filename}`,
            unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              }
            }
          )
        }
        if (req.files && req.files['doc_confirming_disbursment_received_pdf']) {
          fs.unlink(
            `uploads/${req.files['doc_confirming_disbursment_received_pdf'][0].filename}`,
            unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              }
            }
          )
        }
        return res.status(400).json(`Tc data already uploaded`)
      }

      let newDoc
      if (new_tc_data.jurisdiction === 'federal') {
        newDoc = await Ioi_comp1.findOneAndUpdate(
          {},
          {
            $push: {
              'no_of_fully_functioning_upgraded_workshops_in_supported_tc.federal_tc':
                new_tc_data
            }
          },
          {
            new: true,
            upsert: true
          }
        ).maxTimeMS(10000)
      } else {
        newDoc = await Ioi_comp1.findOneAndUpdate(
          {},
          {
            $push: {
              'no_of_fully_functioning_upgraded_workshops_in_supported_tc.state_tc':
                new_tc_data
            }
          },
          {
            new: true,
            upsert: true
          }
        ).maxTimeMS(10000)
      }
      res.status(200).json({
        success: true,
        newDoc:
          newDoc.no_of_fully_functioning_upgraded_workshops_in_supported_tc
      })
    } catch (err) {
      if (req.files && req.files['ttis_status_report_pdf']) {
        fs.unlink(
          `uploads/${req.files['ttis_status_report_pdf'][0].filename}`,
          unlinkErr => {
            if (unlinkErr) {
              console.error(unlinkErr)
            }
          }
        )
      }
      if (req.files && req.files['status_report_pdf']) {
        fs.unlink(
          `uploads/${req.files['status_report_pdf'][0].filename}`,
          unlinkErr => {
            if (unlinkErr) {
              console.error(unlinkErr)
            }
          }
        )
      }
      if (req.files && req.files['doc_confirming_disbursment_received_pdf']) {
        fs.unlink(
          `uploads/${req.files['doc_confirming_disbursment_received_pdf'][0].filename}`,
          unlinkErr => {
            if (unlinkErr) {
              console.error(unlinkErr)
            }
          }
        )
      }
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

// GET REQUESTS FOR SPECIFIC POST

router.get(
  '/get-post-for-no-of-supported-tc/:post_id',
  asyncErrCatcher(async (req, res) => {
    try {
      let found_post
      if (req.query.jurisdiction === 'federal') {
        found_post = await Ioi_comp1.findOne({
          'no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.federal_tc':
            { $elemMatch: { _id: req.params.post_id } }
        }).maxTimeMS(10000)
      } else {
        found_post = await Ioi_comp1.findOne({
          'no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.state_tc':
            {
              $elemMatch: {
                _id: req.params.post_id
              }
            }
        }).maxTimeMS(10000)
      }

      if (!found_post) {
        return res.status(400).json('Tc Post not found')
      }

      let tc_post
      if (req.query.jurisdiction === 'federal') {
        tc_post =
          found_post.no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.federal_tc.find(
            post => post._id.toString() === req.params.post_id
          )
      } else {
        tc_post =
          found_post.no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.state_tc.find(
            post => post._id.toString() === req.params.post_id
          )
      }

      res.status(200).json({
        sucess: true,
        tc_post
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.get(
  '/get-post-no-of-training-programs-delivered-monitored/:post_id',
  asyncErrCatcher(async (req, res) => {
    try {
      let found_post
      if (req.query.jurisdiction === 'federal') {
        found_post = await Ioi_comp1.findOne({
          'no_of_training_programs_delivered_monitored.federal_tc': {
            $elemMatch: { _id: req.params.post_id }
          }
        }).maxTimeMS(10000)
      } else {
        found_post = await Ioi_comp1.findOne({
          'no_of_training_programs_delivered_monitored.state_tc': {
            $elemMatch: { _id: req.params.post_id }
          }
        }).maxTimeMS(10000)
      }

      if (!found_post) {
        return res.status(400).json('Tc Post not found')
      }

      let tc_post
      if (req.query.jurisdiction === 'federal') {
        tc_post =
          found_post.no_of_training_programs_delivered_monitored.federal_tc.find(
            post => post._id.toString() === req.params.post_id
          )
      } else {
        tc_post =
          found_post.no_of_training_programs_delivered_monitored.state_tc.find(
            post => post._id.toString() === req.params.post_id
          )
      }

      res.status(200).json({
        sucess: true,
        tc_post
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.get(
  '/get-post-no-of-supported-tc-with-reporting-and-referral-mechanisms-for-gbv-affected-youth/:post_id',
  asyncErrCatcher(async (req, res) => {
    try {
      let found_post
      if (req.query.jurisdiction === 'federal') {
        found_post = await Ioi_comp1.findOne({
          'no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.federal_tc':
            {
              $elemMatch: {
                _id: req.params.post_id
              }
            }
        }).maxTimeMS(10000)
      } else {
        found_post = await Ioi_comp1.findOne({
          'no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.state_tc':
            {
              $elemMatch: {
                _id: req.params.post_id
              }
            }
        }).maxTimeMS(10000)
      }

      if (!found_post) {
        return res.status(400).json('Tc Post not found')
      }

      let tc_post
      if (req.query.jurisdiction === 'federal') {
        tc_post =
          found_post.no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.federal_tc.find(
            post => post._id.toString() === req.params.post_id
          )
      } else {
        tc_post =
          found_post.no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.state_tc.find(
            post => post._id.toString() === req.params.post_id
          )
      }

      res.status(200).json({
        sucess: true,
        tc_post
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.get(
  '/get-post-no-of-fully-functioning-upgraded-workshops-in-supported-tc/:post_id',
  asyncErrCatcher(async (req, res) => {
    try {
      let found_post
      if (req.query.jurisdiction === 'federal') {
        found_post = await Ioi_comp1.findOne({
          'no_of_fully_functioning_upgraded_workshops_in_supported_tc.federal_tc':
            {
              $elemMatch: {
                _id: req.params.post_id
              }
            }
        }).maxTimeMS(10000)
      } else {
        found_post = await Ioi_comp1.findOne({
          'no_of_fully_functioning_upgraded_workshops_in_supported_tc.state_tc':
            {
              $elemMatch: {
                _id: req.params.post_id
              }
            }
        }).maxTimeMS(10000)
      }

      if (!found_post) {
        return res.status(400).json('Tc Post not found')
      }

      let tc_post
      if (req.query.jurisdiction === 'federal') {
        tc_post =
          found_post.no_of_fully_functioning_upgraded_workshops_in_supported_tc.federal_tc.find(
            post => post._id.toString() === req.params.post_id
          )
      } else {
        tc_post =
          found_post.no_of_fully_functioning_upgraded_workshops_in_supported_tc.state_tc.find(
            post => post._id.toString() === req.params.post_id
          )
      }

      res.status(200).json({
        sucess: true,
        tc_post
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

// GET REQUEST BY TC JURISDICTION

router.get(
  '/get-posts-for-no-of-supported-tc-by-tc-for-federal',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts = await Ioi_comp1.aggregate(
        [
          {
            $match: {
              no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership:
                { $exists: true }
            }
          },
          {
            $project: {
              federal_tc:
                '$no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.federal_tc',
              _id: 0
            }
          },
          { $match: { federal_tc: { $exists: true, $ne: null } } },
          { $unwind: '$federal_tc' },
          { $replaceRoot: { newRoot: '$federal_tc' } }
        ],
        {
          maxTimeMS: 10000
        }
      )

      if (found_posts.length === 0)
        return res.status(400).json('Federal Tc Array empty')

      res.status(200).setHeader('Content-Type', 'application/json').json({
        success: true,
        found_posts,
        jurisdiction: 'federal'
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.get(
  '/get-posts-for-no-of-supported-tc-by-tc-for-state',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts = await Ioi_comp1.aggregate(
        [
          {
            $match: {
              no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership:
                { $exists: true }
            }
          },
          {
            $project: {
              state_tc:
                '$no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.state_tc',
              _id: 0
            }
          },
          { $match: { state_tc: { $exists: true, $ne: null } } },
          { $unwind: '$state_tc' },
          { $replaceRoot: { newRoot: '$state_tc' } }
        ],
        {
          maxTimeMS: 10000
        }
      )

      if (found_posts.length === 0) {
        return res.status(400).json({ message: 'State TC array is empty' })
      }

      res.status(200).json({
        success: true,
        found_posts,
        jurisdiction: 'state'
      })
    } catch (err) {
      res.status(500).json({ message: `Error message: ${err.message}` }) // Provide clear error messages
    }
  })
)

router.get(
  '/get-posts-no-of-training-programs-delivered-monitored-for-federal',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts = await Ioi_comp1.aggregate(
        [
          {
            $match: {
              no_of_training_programs_delivered_monitored: { $exists: true }
            }
          },
          {
            $project: {
              federal_tc:
                '$no_of_training_programs_delivered_monitored.federal_tc',
              _id: 0
            }
          },
          { $match: { federal_tc: { $exists: true, $ne: null } } },
          { $unwind: '$federal_tc' },
          { $replaceRoot: { newRoot: '$federal_tc' } }
        ],
        { maxTimeMS: 10000 }
      )

      if (found_posts.length === 0)
        return res.status(400).json('Federal Tc Array empty')

      res.status(200).json({
        success: true,
        found_posts,
        jurisdiction: 'federal'
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.get(
  '/get-posts-no-of-training-programs-delivered-monitored-for-state',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts = await Ioi_comp1.aggregate(
        [
          {
            $match: {
              no_of_training_programs_delivered_monitored: { $exists: true }
            }
          },
          {
            $project: {
              state_tc: '$no_of_training_programs_delivered_monitored.state_tc',
              _id: 0
            }
          },
          { $match: { state_tc: { $exists: true, $ne: null } } },
          { $unwind: '$state_tc' },
          { $replaceRoot: { newRoot: '$state_tc' } }
        ],
        { maxTimeMS: 10000 }
      )

      if (found_posts.length === 0)
        return res.status(400).json('State Tc Array empty')

      res.status(200).json({
        success: true,
        found_posts,
        jurisdiction: 'state'
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.get(
  '/get-posts-no-of-supported-tc-with-reporting-and-referral-mechanisms-for-gbv-affected-youth-for-federal',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts = await Ioi_comp1.aggregate(
        [
          {
            $match: {
              no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth:
                { $exists: true }
            }
          },
          {
            $project: {
              federal_tc:
                '$no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.federal_tc',
              _id: 0
            }
          },
          { $match: { federal_tc: { $exists: true, $ne: null } } },
          { $unwind: '$federal_tc' },
          { $replaceRoot: { newRoot: '$federal_tc' } }
        ],
        { maxTimeMS: 10000 }
      )

      if (found_posts.length === 0)
        return res.status(400).json('Federal Tc Array empty')

      res.status(200).json({
        success: true,
        found_posts,
        jurisdiction: 'federal'
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.get(
  '/get-posts-no-of-supported-tc-with-reporting-and-referral-mechanisms-for-gbv-affected-youth-for-state',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts = await Ioi_comp1.aggregate(
        [
          {
            $match: {
              no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth:
                { $exists: true }
            }
          },
          {
            $project: {
              state_tc:
                '$no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.state_tc',
              _id: 0
            }
          },
          { $match: { state_tc: { $exists: true, $ne: null } } },
          { $unwind: '$state_tc' },
          { $replaceRoot: { newRoot: '$state_tc' } }
        ],
        { maxTimeMS: 10000 }
      )

      if (found_posts.length === 0)
        return res.status(400).json('State Tc Array empty')

      res.status(200).json({
        success: true,
        found_posts,
        jurisdiction: 'state'
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.get(
  '/get-posts-no_of_fully_functioning_upgraded_workshops_in_supported_tc-for-federal',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts = await Ioi_comp1.aggregate(
        [
          {
            $match: {
              no_of_fully_functioning_upgraded_workshops_in_supported_tc: {
                $exists: true
              }
            }
          },
          {
            $project: {
              federal_tc:
                '$no_of_fully_functioning_upgraded_workshops_in_supported_tc.federal_tc',
              _id: 0
            }
          },
          { $match: { federal_tc: { $exists: true, $ne: null } } },
          { $unwind: '$federal_tc' },
          { $replaceRoot: { newRoot: '$federal_tc' } }
        ],
        { maxTimeMS: 10000 }
      )

      if (found_posts.length === 0)
        return res.status(400).json('Federal Tc Array empty')

      res.status(200).json({
        success: true,
        found_posts,
        jurisdiction: 'federal'
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.get(
  '/get-posts-no_of_fully_functioning_upgraded_workshops_in_supported_tc-for-state',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts = await Ioi_comp1.aggregate(
        [
          {
            $match: {
              no_of_fully_functioning_upgraded_workshops_in_supported_tc: {
                $exists: true
              }
            }
          },
          {
            $project: {
              state_tc:
                '$no_of_fully_functioning_upgraded_workshops_in_supported_tc.state_tc',
              _id: 0
            }
          },
          { $match: { state_tc: { $exists: true, $ne: null } } },
          { $unwind: '$state_tc' },
          { $replaceRoot: { newRoot: '$state_tc' } }
        ],
        { maxTimeMS: 10000 }
      )

      if (found_posts.length === 0)
        return res.status(400).json('State Tc Array empty')

      res.status(200).json({
        success: true,
        found_posts,
        jurisdiction: 'state'
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

// PUT REQUESTS

router.put(
  '/update-post-for-no-of-supported-tc/:post_id',
  upload.fields([
    { name: 'report_pdf', maxCount: 1 },
    { name: 'all_signed_mous_pdf', maxCount: 4 },
    { name: 'minutes_pdf', maxCount: 4 }
  ]),
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const jurisdiction = req.query.jurisdiction
      const tcType = `${jurisdiction}_tc`

      if (items.no_of_mous_signed_with_industry_partners) {
        items.no_of_mous_signed_with_industry_partners = {
          value: Number(items.no_of_mous_signed_with_industry_partners)
        }
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json({ message: 'Invalid ID format' })
      }

      const query = {}
      query[
        `no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.${tcType}._id`
      ] = new mongoose.Types.ObjectId(req.params.post_id)

      const parentDocument = await Ioi_comp1.findOne(query)
      if (!parentDocument) {
        return res.status(404).json({ message: 'TC post does not exist' })
      }

      const subdocuments =
        parentDocument
          .no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership[
          tcType
        ]
      const subdocument = subdocuments.find(
        tc => tc._id.toString() === req.params.post_id
      )

      if (!subdocument) {
        return res.status(404).json({ message: 'Subdocument not found' })
      }

      // Update the subdocument with new data
      if (items.sch_ideas_project_team_established) {
        subdocument.sch_ideas_project_team_established.value =
          items.sch_ideas_project_team_established
      }

      if (items.no_of_mous_signed_with_industry_partners) {
        subdocument.no_of_mous_signed_with_industry_partners.value =
          items.no_of_mous_signed_with_industry_partners.value
      }

      if (items.no_of_times_ciu_met_over_past_year) {
        subdocument.no_of_times_ciu_met_over_past_year.value =
          items.no_of_times_ciu_met_over_past_year
      }

      if (req.files) {
        // Handle report_pdf
        if (req.files['report_pdf'] && req.files['report_pdf'][0]) {
          if (subdocument.sch_ideas_project_team_established.report_pdf) {
            fs.unlink(
              `uploads/${subdocument.sch_ideas_project_team_established.report_pdf}`,
              unlinkErr => {
                if (unlinkErr) {
                  console.error(unlinkErr)
                }
              }
            )
          }
          subdocument.sch_ideas_project_team_established.report_pdf =
            req.files['report_pdf'][0].filename
        }

        // Handle all_signed_mous_pdf
        if (
          req.files['all_signed_mous_pdf'] &&
          req.files['all_signed_mous_pdf'].length > 0
        ) {
          if (
            subdocument.no_of_mous_signed_with_industry_partners
              .all_signed_mous_pdf
          ) {
            subdocument.no_of_mous_signed_with_industry_partners.all_signed_mous_pdf.forEach(
              file => {
                fs.unlink(`uploads/${file}`, unlinkErr => {
                  if (unlinkErr) {
                    console.error(unlinkErr)
                  }
                })
              }
            )
          }
          subdocument.no_of_mous_signed_with_industry_partners.all_signed_mous_pdf =
            req.files['all_signed_mous_pdf'].map(file => file.filename)
        }

        // Handle minutes_pdf
        if (req.files['minutes_pdf'] && req.files['minutes_pdf'].length > 0) {
          if (subdocument.no_of_times_ciu_met_over_past_year.minutes_pdf) {
            subdocument.no_of_times_ciu_met_over_past_year.minutes_pdf.forEach(
              file => {
                fs.unlink(`uploads/${file}`, unlinkErr => {
                  if (unlinkErr) {
                    console.error(unlinkErr)
                  }
                })
              }
            )
          }
          subdocument.no_of_times_ciu_met_over_past_year.minutes_pdf =
            req.files['minutes_pdf'].map(file => file.filename)
        }
      }

      await parentDocument.save()

      res.status(200).json({
        success: true,
        subdocument
      })
    } catch (err) {
      // Unlink newly uploaded files if error occurs
      if (req.files) {
        if (req.files['report_pdf']) {
          fs.unlink(
            `uploads/${req.files['report_pdf'][0].filename}`,
            unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              }
            }
          )
        }
        if (req.files['all_signed_mous_pdf']) {
          req.files['all_signed_mous_pdf'].forEach(file => {
            fs.unlink(`uploads/${file.filename}`, unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              }
            })
          })
        }
        if (req.files['minutes_pdf']) {
          req.files['minutes_pdf'].forEach(file => {
            fs.unlink(`uploads/${file.filename}`, unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              }
            })
          })
        }
      }
      console.error(err)
      res.status(500).json({ message: `Error message: ${err}` })
    }
  })
)

router.put(
  '/update-post-no-of-training-programs-delivered-monitored/:post_id',
  upload.fields([
    { name: 'attendance_sheet_pdf', maxCount: 1 },
    { name: 'latest_tc_status_report_pdf', maxCount: 4 }
  ]),
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      console.log(items)
      const jurisdiction = req.query.jurisdiction
      const tcType = `${jurisdiction}_tc`

      if (!mongoose.Types.ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json({ message: 'Invalid ID format' })
      }

      const query = {}
      query[`no_of_training_programs_delivered_monitored.${tcType}._id`] =
        new mongoose.Types.ObjectId(req.params.post_id)

      const parentDocument = await Ioi_comp1.findOne(query)
      if (!parentDocument) {
        if (req.files && req.files['attendance_sheet_pdf']) {
          fs.unlink(
            `uploads/${req.files['attendance_sheet_pdf'][0].filename}`,
            unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              }
            }
          )
        }
        if (req.files && req.files['latest_tc_status_report_pdf']) {
          req.files['latest_tc_status_report_pdf'].forEach(file => {
            fs.unlink(`uploads/${file.filename}`, unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              }
            })
          })
        }
        return res.status(404).json({ message: 'TC post does not exist' })
      }

      const subdocuments =
        parentDocument.no_of_training_programs_delivered_monitored[tcType]
      const subdocument = subdocuments.find(
        tc => tc._id.toString() === req.params.post_id
      )

      if (!subdocument) {
        if (req.files && req.files['attendance_sheet_pdf']) {
          fs.unlink(
            `uploads/${req.files['attendance_sheet_pdf'][0].filename}`,
            unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              }
            }
          )
        }
        if (req.files && req.files['latest_tc_status_report_pdf']) {
          req.files['latest_tc_status_report_pdf'].forEach(file => {
            fs.unlink(`uploads/${file.filename}`, unlinkErr => {
              if (unlinkErr) {
                console.error(unlinkErr)
              }
            })
          })
        }
        return res.status(404).json({ message: 'Subdocument not found' })
      }

      const items_to_add = {}
Object.assign(items_to_add, items)
      items_to_add.no_of_industry_partners =
        Number(items.no_of_industry_partners) ||
        0 ||
        Number(subdocument.no_of_industry_partners) ||
        0
      items_to_add.no_of_internship_arrangements =
        Number(items.no_of_internship_arrangements) ||
        0 ||
        Number(subdocument.no_of_internship_arrangements) ||
        0

      if (
        items_to_add.no_of_internship_arrangements ||
        items_to_add.no_of_industry_partners
      ) {
        subdocument.count =
          Number(items_to_add.no_of_internship_arrangements) +
          Number(items_to_add.no_of_industry_partners)
      }
      if (req.files) {
        // Handle attendance_sheet_pdf
        if (
          req.files['attendance_sheet_pdf'] &&
          req.files['attendance_sheet_pdf'][0]
        ) {
          if (subdocument.attendance_sheet_pdf) {
            fs.unlink(
              `uploads/${subdocument.attendance_sheet_pdf}`,
              unlinkErr => {
                if (unlinkErr) {
                  console.error(unlinkErr)
                }
              }
            )
          }
          subdocument.attendance_sheet_pdf =
            req.files['attendance_sheet_pdf'][0].filename
        }

        // Handle latest_tc_status_report_pdf
        if (
          req.files['latest_tc_status_report_pdf'] &&
          req.files['latest_tc_status_report_pdf'].length > 0
        ) {
          if (subdocument.latest_tc_status_report_pdf) {
            subdocument.latest_tc_status_report_pdf.forEach(file => {
              fs.unlink(`uploads/${file}`, unlinkErr => {
                if (unlinkErr) {
                  console.error(unlinkErr)
                }
              })
            })
          }
          subdocument.latest_tc_status_report_pdf = req.files[
            'latest_tc_status_report_pdf'
          ].map(file => file.filename)
        }
      }
      Object.assign(subdocument, items_to_add)

      await parentDocument.save()

      res.status(200).json({
        success: true,
        subdocument
      })
    } catch (err) {
      if (req.files && req.files['attendance_sheet_pdf']) {
        fs.unlink(
          `uploads/${req.files['attendance_sheet_pdf'][0].filename}`,
          unlinkErr => {
            if (unlinkErr) {
              console.error(unlinkErr)
            }
          }
        )
      }
      if (req.files && req.files['latest_tc_status_report_pdf']) {
        req.files['latest_tc_status_report_pdf'].forEach(file => {
          fs.unlink(`uploads/${file.filename}`, unlinkErr => {
            if (unlinkErr) {
              console.error(unlinkErr)
            }
          })
        })
      }
      console.error(err)
      res.status(500).json({ message: `Error message: ${err}` })
    }
  })
)

router.put(
  '/update-post-no-of-supported-tc-with-reporting-and-referral-mechanisms-for-gbv-affected-youth/:post_id',
  upload.fields([
    { name: 'school_gbv_policy_pdf', maxCount: 1 },
    { name: 'sensitization_pdf', maxCount: 4 },
    { name: 'reports_showing_addressed_complaints_box_pdf', maxCount: 4 }
  ]),
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const jurisdiction = req.query.jurisdiction
      const tcType = `${jurisdiction}_tc`

      if (!mongoose.Types.ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json({ message: 'Invalid ID format' })
      }

      const query = {}
      query[
        `no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.${tcType}._id`
      ] = new mongoose.Types.ObjectId(req.params.post_id)

      const parentDocument = await Ioi_comp1.findOne(query).maxTimeMS(20000)
      if (!parentDocument) {
        await handleFileUnlinking(req.files)
        return res.status(404).json({ message: 'TC post does not exist' })
      }

      const subdocuments =
        parentDocument
          .no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth[
          tcType
        ]
      const subdocument = subdocuments.find(
        tc => tc._id.toString() === req.params.post_id
      )

      if (!subdocument) {
        await handleFileUnlinking(req.files)
        return res.status(404).json({ message: 'Subdocument not found' })
      }

if(items.gbv_sensitization_conducted_by_the_school){
  subdocument.gbv_sensitization_conducted_by_the_school.value = items.gbv_sensitization_conducted_by_the_school; 
delete items.gbv_sensitization_conducted_by_the_school
}
if(items.gbv_policy_published_by_school){
  subdocument.gbv_policy_published_by_school.value = items.gbv_policy_published_by_school; 
delete items.gbv_policy_published_by_school
}

      if (
        items.gbv_reporting_and_referral_system_for_youths_in_place_at_the_school ===
        'yes'
      ) {
        subdocument.count = 1
      } else if (
        items.gbv_reporting_and_referral_system_for_youths_in_place_at_the_school ===
        'no'
      ) {
        subdocument.count = 0
      }

      if (
        req.files &&
        req.files['sensitization_pdf'] &&
        items.gbv_sensitization_conducted_by_the_school
      ) {
        if (
          subdocument.gbv_sensitization_conducted_by_the_school
            .sensitization_pdf
        ) {
          await deleteFiles(
            subdocument.gbv_sensitization_conducted_by_the_school
              .sensitization_pdf
          )
        }
        subdocument.gbv_sensitization_conducted_by_the_school.value =
          items.gbv_sensitization_conducted_by_the_school
        subdocument.gbv_sensitization_conducted_by_the_school.sensitization_pdf =
          req.files['sensitization_pdf'].map(file => file.filename)
        delete items.gbv_sensitization_conducted_by_the_school
      }
      if (
        req.files &&
        req.files['school_gbv_policy_pdf'] &&
        items.gbv_policy_published_by_school
      ) {
        if (subdocument.gbv_policy_published_by_school.school_gbv_policy_pdf) {
          await new Promise((resolve, reject) => {
            checkAndDeleteFile(
              `uploads/${subdocument.gbv_policy_published_by_school.school_gbv_policy_pdf}`,
              err => {
                if (err) reject(err)
                else resolve()
              }
            )
          })
        }
        subdocument.gbv_policy_published_by_school.value =
          items.gbv_policy_published_by_school
        subdocument.gbv_policy_published_by_school.school_gbv_policy_pdf =
          req.files['school_gbv_policy_pdf'][0].filename
        delete items.gbv_policy_published_by_school
      }
      if (
        req.files &&
        req.files['reports_showing_addressed_complaints_box_pdf']
      ) {
        if (subdocument.reports_showing_addressed_complaints_box_pdf) {
          await deleteFiles(
            subdocument.reports_showing_addressed_complaints_box_pdf
          )
        }
        subdocument.reports_showing_addressed_complaints_box_pdf = req.files[
          'reports_showing_addressed_complaints_box_pdf'
        ].map(file => file.filename)
      }

      Object.assign(subdocument, items)

      await parentDocument.save()

      res.status(200).json({
        success: true,
        subdocument
      })
    } catch (err) {
      await handleFileUnlinking(req.files)
      console.error(err)
      res.status(500).json({ message: `Error message: ${err}` })
    }
  })
)

router.put(
  '/update-post-no-of-fully-functioning-upgraded-workshops-in-supported-tc/:post_id',
  upload.fields([
    { name: 'doc_confirming_disbursment_received_pdf', maxCount: 1 },
    { name: 'status_report_pdf', maxCount: 1 },
    { name: 'ttis_status_report_pdf', maxCount: 1 }
  ]),
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const jurisdiction = req.query.jurisdiction
      const tcType = `${jurisdiction}_tc`

      if (!mongoose.Types.ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json({ message: 'Invalid ID format' })
      }

      const query = {}
      query[
        `no_of_fully_functioning_upgraded_workshops_in_supported_tc.${tcType}._id`
      ] = new mongoose.Types.ObjectId(req.params.post_id)

      const parentDocument = await Ioi_comp1.findOne(query).maxTimeMS(20000)
      if (!parentDocument) {
        await handleFileUnlinking(req.files)
        return res.status(404).json({ message: 'TC post does not exist' })
      }

      const subdocuments =
        parentDocument
          .no_of_fully_functioning_upgraded_workshops_in_supported_tc[tcType]
      const subdocument = subdocuments.find(
        tc => tc._id.toString() === req.params.post_id
      )

      if (!subdocument) {
        await handleFileUnlinking(req.files)
        return res.status(404).json({ message: 'Subdocument not found' })
      }

      if(items.initial_disbursement_of_250kusd_received){
        subdocument.initial_disbursement_of_250kusd_received.value = items.initial_disbursement_of_250kusd_received; 
      delete items.initial_disbursement_of_250kusd_received
      }
      if(items.no_of_workshops_equipped_with_modern_tools_and_ready_for_use){
        subdocument.no_of_workshops_equipped_with_modern_tools_and_ready_for_use.value = items.no_of_workshops_equipped_with_modern_tools_and_ready_for_use; 
      delete items.no_of_workshops_equipped_with_modern_tools_and_ready_for_use
      }
      if(items.no_of_ttis_trained_on_the_use_of_newly_installed_tools){
        subdocument.no_of_ttis_trained_on_the_use_of_newly_installed_tools.value = items.no_of_ttis_trained_on_the_use_of_newly_installed_tools; 
      delete items.no_of_ttis_trained_on_the_use_of_newly_installed_tools
      }

      if (items.no_of_workshops_equipped_with_modern_tools_and_ready_for_use) {
        items.count =
          items.no_of_workshops_equipped_with_modern_tools_and_ready_for_use
      }

      if (items.workshops) {
        if (!Array.isArray(items.workshops)) {
          items.workshops = [items.workshops]
        }

        const currentWorkshops = new Set(subdocument.workshops)

        items.workshops.forEach(workshop => {
          if (!currentWorkshops.has(workshop)) {
            subdocument.workshops.push(workshop)
          }
        })

        delete items.workshops
      }

      const items_to_add = {}

      if (items.no_of_workshops_equipped_with_modern_tools_and_ready_for_use) {
        items_to_add.no_of_workshops_equipped_with_modern_tools_and_ready_for_use =
          items.no_of_workshops_equipped_with_modern_tools_and_ready_for_use
      } else if (
        subdocument.no_of_workshops_equipped_with_modern_tools_and_ready_for_use
      ) {
        items_to_add.no_of_workshops_equipped_with_modern_tools_and_ready_for_use =
          subdocument.no_of_workshops_equipped_with_modern_tools_and.ready_for_use
      }
      if (items.training_of_ttis_on_the_use_of_newly_installed_tools) {
        items_to_add.training_of_ttis_on_the_use_of_newly_installed_tools =
          items.training_of_ttis_on_the_use_of_newly_installed_tools
      } else if (
        subdocument.training_of_ttis_on_the_use_of_newly_installed_tools
      ) {
        items_to_add.training_of_ttis_on_the_use_of_newly_installed_tools =
          subdocument.training_of_ttis_on_the_use_of_newly_installed_tools
      }

      if (
        items_to_add.no_of_workshops_equipped_with_modern_tools_and_ready_for_use &&
        items_to_add.training_of_ttis_on_the_use_of_newly_installed_tools
      ) {
        items.fulfilled =
          items_to_add.no_of_workshops_equipped_with_modern_tools_and_ready_for_use >=
            1 &&
          items_to_add.training_of_ttis_on_the_use_of_newly_installed_tools ===
            'yes'
            ? items_to_add.training_of_ttis_on_the_use_of_newly_installed_tools
            : 'no'
      } else {
        items.fulfilled = 'no'
      }

      if (
        req.files &&
        req.files['doc_confirming_disbursment_received_pdf'] &&
        items.initial_disbursement_of_250kusd_received
      ) {
        if (
          subdocument.initial_disbursement_of_250kusd_received
            .doc_confirming_disbursment_received_pdf
        ) {
          await new Promise((resolve, reject) => {
            checkAndDeleteFile(
              `uploads/${subdocument.initial_disbursement_of_250kusd_received.doc_confirming_disbursment_received_pdf}`,
              err => {
                if (err) reject(err)
                else resolve()
              }
            )
          })
        }
        subdocument.initial_disbursement_of_250kusd_received.value =
          items.initial_disbursement_of_250kusd_received
        subdocument.initial_disbursement_of_250kusd_received.doc_confirming_disbursment_received_pdf =
          req.files['doc_confirming_disbursment_received_pdf'][0].filename
        delete items.initial_disbursement_of_250kusd_received
      }

      if (
        req.files &&
        req.files['status_report_pdf'] &&
        items.no_of_workshops_equipped_with_modern_tools_and_ready_for_use
      ) {
        if (
          subdocument
            .no_of_workshops_equipped_with_modern_tools_and_ready_for_use
            .status_report_pdf
        ) {
          await new Promise((resolve, reject) => {
            checkAndDeleteFile(
              `uploads/${subdocument.no_of_workshops_equipped_with_modern_tools_and_ready_for_use.status_report_pdf}`,
              err => {
                if (err) reject(err)
                else resolve()
              }
            )
          })
        }
        subdocument.no_of_workshops_equipped_with_modern_tools_and_ready_for_use.value =
          items.no_of_workshops_equipped_with_modern_tools_and_ready_for_use
        subdocument.no_of_workshops_equipped_with_modern_tools_and_ready_for_use.status_report_pdf =
          req.files['status_report_pdf'][0].filename
        delete items.no_of_workshops_equipped_with_modern_tools_and_ready_for_use
      }

      if (
        req.files &&
        req.files['ttis_status_report_pdf'] &&
        items.no_of_ttis_trained_on_the_use_of_newly_installed_tools
      ) {
        if (
          subdocument.no_of_ttis_trained_on_the_use_of_newly_installed_tools
            .status_report_pdf
        ) {
          await new Promise((resolve, reject) => {
            checkAndDeleteFile(
              `uploads/${subdocument.no_of_ttis_trained_on_the_use_of_newly_installed_tools.status_report_pdf}`,
              err => {
                if (err) reject(err)
                else resolve()
              }
            )
          })
        }
        subdocument.no_of_ttis_trained_on_the_use_of_newly_installed_tools.value =
          items.no_of_ttis_trained_on_the_use_of_newly_installed_tools
        subdocument.no_of_ttis_trained_on_the_use_of_newly_installed_tools.status_report_pdf =
          req.files['ttis_status_report_pdf'][0].filename
        delete items.no_of_ttis_trained_on_the_use_of_newly_installed_tools
      }

      Object.assign(subdocument, items)

      await parentDocument.save()

      res.status(200).json({
        success: true,
        subdocument
      })
    } catch (err) {
      await handleFileUnlinking(req.files)
      console.error(err)
      res.status(500).json({ message: `Error message: ${err}` })
    }
  })
)

// DELETE REQUESTS

router.delete(
  '/delete-post-no-of-supported-tc/:post_id',
  asyncErrCatcher(async (req, res) => {
    try {
      const jurisdiction = req.query.jurisdiction
      const tyType = `${jurisdiction}_tc`

      if (!mongoose.Types.ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json({ message: 'Invalid Id format' })
      }

      const query = {}
      query[
        `no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.${tyType}._id`
      ] = new mongoose.Types.ObjectId(req.params.post_id)

      const parentDoc = await Ioi_comp1.findOne(query)

      if (!parentDoc) {
        return res.status(404).json(`Post not found`)
      }

      const subdocs =
        parentDoc
          .no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership[
          tyType
        ]
      const subdoc = subdocs.find(e => e._id.toString() === req.params.post_id)

      if (!subdoc) {
        return res.status(400).json(`Subdocument not found`)
      }

      if (
        subdoc.sch_ideas_project_team_established &&
        subdoc.sch_ideas_project_team_established.report_pdf
      ) {
        const filePath = `uploads/${subdoc.sch_ideas_project_team_established.report_pdf}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error('Error handling file:', err)
          }
        })
      }
      if (
        subdoc.no_of_mous_signed_with_industry_partners &&
        subdoc.no_of_mous_signed_with_industry_partners.all_signed_mous_pdf
      ) {
        const filePath = `uploads/${subdoc.no_of_mous_signed_with_industry_partners.all_signed_mous_pdf}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error('Error handling file:', err)
          }
        })
      }
      if (
        subdoc.no_of_times_ciu_met_over_past_year &&
        subdoc.no_of_times_ciu_met_over_past_year.minutes_pdf
      ) {
        const filePath = `uploads/${subdoc.no_of_times_ciu_met_over_past_year.minutes_pdf}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error('Error handling file:', err)
          }
        })
      }

      const parentDocIndex =
        parentDoc.no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership[
          tyType
        ].findIndex(e => e._id.toString() === req.params.post_id)

      if (parentDocIndex === -1) {
        return res.status(404).json({ message: 'Subdocument not found' })
      }

      const deleted_post =
        parentDoc.no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership[
          tyType
        ].splice(parentDocIndex, 1)

      await parentDoc.save()

      res.status(200).json({
        success: true,
        deleted_post,
        message: 'Subdocument deleted successfully'
      })
    } catch (err) {
      res.status(500).json({ success: false, message: 'Internal Server Error' })
      console.error(err)
    }
  })
)

router.delete(
  '/delete-post-no-of-training-programs-delivered-monitored/:post_id',
  asyncErrCatcher(async (req, res) => {
    try {
      const jurisdiction = req.query.jurisdiction
      const tcType = `${jurisdiction}_tc`

      if (!mongoose.Types.ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json(`Invalid Id format`)
      }

      const query = {}
      query[`no_of_training_programs_delivered_monitored.${tcType}._id`] =
        new mongoose.Types.ObjectId(req.params.post_id)

      const parentDoc = await Ioi_comp1.findOne(query)

      if (!parentDoc) {
        return res.status(404).json(`Post not found`)
      }

      const subDocs =
        parentDoc.no_of_training_programs_delivered_monitored[tcType]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.post_id)

      if (!subDoc) {
        return res.status(404).json(`No sub document found`)
      }

      if (subDoc.latest_tc_status_report_pdf) {
        const filePath = `uploads/${subDoc.latest_tc_status_report_pdf}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }
      if (subDoc.attendance_sheet_pdf) {
        const filePath = `uploads/${subDoc.attendance_sheet_pdf}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }

      const parentDocIndex =
        parentDoc.no_of_training_programs_delivered_monitored[tcType].findIndex(
          e => e._id.toString() === req.params.post_id
        )

      if (parentDocIndex === -1) {
        return res.status(400).json({ message: `Err! Subdoc index not found` })
      }

      const deleted_post =
        parentDoc.no_of_training_programs_delivered_monitored[tcType].splice(
          parentDocIndex,
          1
        )

      await parentDoc.save()

      res.status(200).json({
        success: true,
        deleted_post,
        message: 'Post deleted successfully'
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
  })
)

router.delete(
  '/delete-post-no-of-supported-tc-with-reporting-and-referral-mechanisms-for-gbv-affected-youth/:post_id',
  asyncErrCatcher(async (req, res) => {
    try {
      const jurisdiction = req.query.jurisdiction
      const tcType = `${jurisdiction}_tc`

      if (!mongoose.Types.ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json('Invalid Id format')
      }

      const query = {}
      query[
        `no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.${tcType}._id`
      ] = new mongoose.Types.ObjectId(req.params.post_id)

      const parentDoc = await Ioi_comp1.findOne(query)

      if (!parentDoc) {
        return res.status(404).json(`Post not found`)
      }

      const subDocs =
        parentDoc
          .no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth[
          tcType
        ]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.post_id)

      if (!subDoc) {
        return res.status(404).json('Sub document not found')
      }

      if (
        subDoc.gbv_sensitization_conducted_by_the_school &&
        subDoc.gbv_sensitization_conducted_by_the_school.sensitization_pdf
      ) {
        const filePath = `uploads/${subDoc.gbv_sensitization_conducted_by_the_school.sensitization_pdf}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }
      if (
        subDoc.gbv_policy_published_by_school &&
        subDoc.gbv_policy_published_by_school.school_gbv_policy_pdf
      ) {
        const filePath = `uploads/${subDoc.gbv_policy_published_by_school.school_gbv_policy_pdf}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }
      if (subDoc.reports_showing_addressed_complaints_box_pdf) {
        const filePath = `uploads/${subDoc.reports_showing_addressed_complaints_box_pdf}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }

      const parentDocIndex =
        parentDoc.no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth[
          tcType
        ].findIndex(e => e._id.toString() === req.params.post_id)
      if (parentDocIndex === -1) {
        return res.status(404).json({ message: 'Subdocument not found' })
      }
      const deleted_post =
        parentDoc.no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth[
          tcType
        ].splice(parentDocIndex, 1)

      await parentDoc.save()

      res.status(200).json({
        success: true,
        deleted_post,
        message: 'Post deleted successfully'
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
  })
)

router.delete(
  '/delete-post-no-of-fully-functioning-upgraded-workshops-in-supported-tc/:post_id',
  asyncErrCatcher(async (req, res) => {
    try {
      const jurisdiction = req.query.jurisdiction
      const tcType = `${jurisdiction}_tc`

      if (!mongoose.Types.ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json('Invalid Id format')
      }

      const query = {}
      query[
        `no_of_fully_functioning_upgraded_workshops_in_supported_tc.${tcType}._id`
      ] = new mongoose.Types.ObjectId(req.params.post_id)

      const parentDoc = await Ioi_comp1.findOne(query)

      if (!parentDoc) {
        return res.status(404).json(`Post not found`)
      }

      const subDocs =
        parentDoc.no_of_fully_functioning_upgraded_workshops_in_supported_tc[
          tcType
        ]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.post_id)

      if (!subDoc) {
        return res.status(404).json('Sub document not found')
      }

      if (
        subDoc.initial_disbursement_of_250kusd_received &&
        subDoc.initial_disbursement_of_250kusd_received
          .doc_confirming_disbursment_received_pdf
      ) {
        const filePath = `uploads/${subDoc.initial_disbursement_of_250kusd_received.doc_confirming_disbursment_received_pdf}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }
      if (
        subDoc.no_of_workshops_equipped_with_modern_tools_and_ready_for_use &&
        subDoc.no_of_workshops_equipped_with_modern_tools_and_ready_for_use
          .status_report_pdf
      ) {
        const filePath = `uploads/${subDoc.no_of_workshops_equipped_with_modern_tools_and_ready_for_use.status_report_pdf}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }
      if (
        subDoc.no_of_ttis_trained_on_the_use_of_newly_installed_tools &&
        subDoc.no_of_ttis_trained_on_the_use_of_newly_installed_tools
          .status_report_pdf
      ) {
        const filePath = `uploads/${subDoc.no_of_ttis_trained_on_the_use_of_newly_installed_tools.status_report_pdf}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }

      const parentDocIndex =
        parentDoc.no_of_fully_functioning_upgraded_workshops_in_supported_tc[
          tcType
        ].findIndex(e => e._id.toString() === req.params.post_id)
      console.log(`bg: ${parentDocIndex}`)
      if (parentDocIndex === -1) {
        return res.status(404).json({ message: 'Subdocument not found' })
      }
      const deleted_post =
        parentDoc.no_of_fully_functioning_upgraded_workshops_in_supported_tc[
          tcType
        ].splice(parentDocIndex, 1)

      await parentDoc.save()

      res.status(200).json({
        success: true,
        deleted_post,
        message: 'Post deleted successfully'
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
  })
)

// GET REQUEST BY TC NAME

router.get(
  '/get-post-for-no-of-supported-tc-by-tc',
  asyncErrCatcher(async (req, res) => {
    try {
      let found_post
      if (req.query.jurisdiction === 'federal') {
        found_post = await Ioi_comp1.findOne({
          'no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.federal_tc':
            {
              $elemMatch: {
                tc_name: req.query.tc_name
              }
            }
        }).maxTimeMS(10000)
      } else {
        found_post = await Ioi_comp1.findOne({
          'no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.state_tc':
            {
              $elemMatch: {
                tc_name: req.query.tc_name
              }
            }
        }).maxTimeMS(10000)
      }

      if (!found_post) {
        return res.status(400).json('No Info found with your Tc name')
      }

      let tc_post
      if (req.query.jurisdiction === 'federal') {
        tc_post =
          found_post.no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.federal_tc.find(
            post => post.tc_name === req.query.tc_name
          )
      } else {
        tc_post =
          found_post.no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.state_tc.find(
            post => post.tc_name === req.query.tc_name
          )
      }

      res.status(200).json({
        success: true,
        tc_post
      })
    } catch (err) {
      res.status(200).json(`Err message: ${err}`)
    }
  })
)

router.get(
  '/get-post-no-of-training-programs-delivered-monitored-by-tc',
  asyncErrCatcher(async (req, res) => {
    try {
      let found_post
      if (req.query.jurisdiction === 'federal') {
        found_post = await Ioi_comp1.findOne({
          'no_of_training_programs_delivered_monitored.federal_tc': {
            $elemMatch: {
              tc_name: req.query.tc_name
            }
          }
        }).maxTimeMS(10000)
      } else {
        found_post = await Ioi_comp1.findOne({
          'no_of_training_programs_delivered_monitored.state_tc': {
            $elemMatch: {
              tc_name: req.query.tc_name
            }
          }
        }).maxTimeMS(10000)
      }

      if (!found_post) {
        return res.status(400).json('No Info found with your Tc name')
      }

      let tc_post
      if (req.query.jurisdiction === 'federal') {
        tc_post =
          found_post.no_of_training_programs_delivered_monitored.federal_tc.find(
            post => post.tc_name === req.query.tc_name
          )
      } else {
        tc_post =
          found_post.no_of_training_programs_delivered_monitored.state_tc.find(
            post => post.tc_name === req.query.tc_name
          )
      }

      res.status(200).json({
        success: true,
        tc_post
      })
    } catch (err) {
      res.status(200).json(`Err message: ${err}`)
    }
  })
)

router.get(
  '/get-post-no-of-supported-tc-with-reporting-and-referral-mechanisms-for-gbv-affected-youth-by-tc',
  asyncErrCatcher(async (req, res) => {
    try {
      let found_post
      if (req.query.jurisdiction === 'federal') {
        found_post = await Ioi_comp1.findOne({
          'no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.federal_tc':
            {
              $elemMatch: {
                tc_name: req.query.tc_name
              }
            }
        }).maxTimeMS(10000)
      } else {
        found_post = await Ioi_comp1.findOne({
          'no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.state_tc':
            {
              $elemMatch: {
                tc_name: req.query.tc_name
              }
            }
        }).maxTimeMS(10000)
      }

      if (!found_post) {
        return res.status(400).json('No Info found with your Tc name')
      }

      let tc_post
      if (req.query.jurisdiction === 'federal') {
        tc_post =
          found_post.no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.federal_tc.find(
            post => post.tc_name === req.query.tc_name
          )
      } else {
        tc_post =
          found_post.no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.state_tc.find(
            post => post.tc_name === req.query.tc_name
          )
      }

      res.status(200).json({
        success: true,
        tc_post
      })
    } catch (err) {
      res.status(200).json(`Err message: ${err}`)
    }
  })
)
router.get(
  '/get-post-no-of-fully-functioning-upgraded-workshops-in-supported-tc-by-tc',
  asyncErrCatcher(async (req, res) => {
    try {
      let found_post
      if (req.query.jurisdiction === 'federal') {
        found_post = await Ioi_comp1.findOne({
          'no_of_fully_functioning_upgraded_workshops_in_supported_tc.federal_tc':
            {
              $elemMatch: {
                tc_name: req.query.tc_name
              }
            }
        }).maxTimeMS(10000)
      } else {
        found_post = await Ioi_comp1.findOne({
          'no_of_fully_functioning_upgraded_workshops_in_supported_tc.state_tc':
            {
              $elemMatch: {
                tc_name: req.query.tc_name
              }
            }
        }).maxTimeMS(10000)
      }

      if (!found_post) {
        return res.status(400).json('No Info found with your Tc name')
      }

      let tc_post
      if (req.query.jurisdiction === 'federal') {
        tc_post =
          found_post.no_of_fully_functioning_upgraded_workshops_in_supported_tc.federal_tc.find(
            post => post.tc_name === req.query.tc_name
          )
      } else {
        tc_post =
          found_post.no_of_fully_functioning_upgraded_workshops_in_supported_tc.state_tc.find(
            post => post.tc_name === req.query.tc_name
          )
      }

      res.status(200).json({
        success: true,
        tc_post
      })
    } catch (err) {
      res.status(200).json(`Err message: ${err}`)
    }
  })
)

// PUT REQUESTS FOR UPDATING STATUS FILEDS OF DATA ENTRY POST

router.put(
  '/update-status-for-no-of-supported-tc/:id',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      console.log(items)

      const post_exists = await Ioi_comp1.findOne({
        [`no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.${items.jurisdiction}_tc`]:
          {
            $elemMatch: {
              _id: req.params.id
            }
          }
      })

      if (!post_exists) {
        return res.status(404).json('Post not found')
      }
      const subDocs =
        post_exists
          .no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership[
          `${items.jurisdiction}_tc`
        ]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.id)
      console.log(subDoc)
      subDoc.status = items.status

      await post_exists.save()

      res
        .status(200)
        .json({ success: true, message: 'Post updated', updated_post: subDoc })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.put(
  '/update-status-for-no-of-training-programs-delivered-monitored/:id',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const post_exists = await Ioi_comp1.findOne({
        [`no_of_training_programs_delivered_monitored.${items.jurisdiction}_tc`]:
          {
            $elemMatch: {
              _id: req.params.id
            }
          }
      })

      if (!post_exists) {
        return res.status(404).json('Post not found')
      }
      const subDocs =
        post_exists.no_of_training_programs_delivered_monitored[
          `${items.jurisdiction}_tc`
        ]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.id)
      subDoc.status = items.status

      await post_exists.save()

      res
        .status(200)
        .json({ success: true, message: 'Post updated', updated_post: subDoc })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.put(
  '/update-status-for-no-of-supported-tc-with-reporting-and-referral-mechanisms-for-gbv-affected-youth/:id',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const post_exists = await Ioi_comp1.findOne({
        [`no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.${items.jurisdiction}_tc`]:
          {
            $elemMatch: {
              _id: req.params.id
            }
          }
      })

      if (!post_exists) {
        return res.status(404).json('Post not found')
      }
      const subDocs =
        post_exists
          .no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth[
          `${items.jurisdiction}_tc`
        ]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.id)
      subDoc.status = items.status

      await post_exists.save()

      res
        .status(200)
        .json({ success: true, message: 'Post updated', updated_post: subDoc })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.put(
  '/update-status-for-no_of_fully_functioning_upgraded_workshops_in_supported_tc/:id',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const post_exists = await Ioi_comp1.findOne({
        [`no_of_fully_functioning_upgraded_workshops_in_supported_tc.${items.jurisdiction}_tc`]:
          {
            $elemMatch: {
              _id: req.params.id
            }
          }
      })

      if (!post_exists) {
        return res.status(404).json('Post not found')
      }
      const subDocs =
        post_exists.no_of_fully_functioning_upgraded_workshops_in_supported_tc[
          `${items.jurisdiction}_tc`
        ]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.id)
      subDoc.status = items.status

      await post_exists.save()

      res
        .status(200)
        .json({ success: true, message: 'Post updated', updated_post: subDoc })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

// GET REQUESTS FOR USER2 STATE SPECIFC POSTS

router.get(
  '/get-all-user2-specific-posts',
  asyncErrCatcher(async (req, res) => {
    try {
      const userState = req.query.state

      const results = await Ioi_comp1.aggregate([
        // Unwind each array field
        {
          $unwind: {
            path: '$no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.state_tc',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$no_of_training_programs_delivered_monitored.state_tc',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.state_tc',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$no_of_fully_functioning_upgraded_workshops_in_supported_tc.state_tc',
            preserveNullAndEmptyArrays: true
          }
        },

        // Filter documents where the state matches the user's state
        {
          $match: {
            $or: [
              {
                'no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.state_tc.state':
                  userState
              },
              {
                'no_of_training_programs_delivered_monitored.state_tc.state':
                  userState
              },
              {
                'no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.state_tc.state':
                  userState
              },
              {
                'no_of_fully_functioning_upgraded_workshops_in_supported_tc.state_tc.state':
                  userState
              }
            ]
          }
        },

        // Regroup the results to reassemble the documents
        {
          $group: {
            _id: '$_id',
            no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership:
              {
                $push: {
                  $cond: [
                    {
                      $eq: [
                        '$no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.state_tc.state',
                        userState
                      ]
                    },
                    '$no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership.state_tc',
                    '$$REMOVE'
                  ]
                }
              },
            no_of_training_programs_delivered_monitored: {
              $push: {
                $cond: [
                  {
                    $eq: [
                      '$no_of_training_programs_delivered_monitored.state_tc.state',
                      userState
                    ]
                  },
                  '$no_of_training_programs_delivered_monitored.state_tc',
                  '$$REMOVE'
                ]
              }
            },
            no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth:
              {
                $push: {
                  $cond: [
                    {
                      $eq: [
                        '$no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.state_tc.state',
                        userState
                      ]
                    },
                    '$no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth.state_tc',
                    '$$REMOVE'
                  ]
                }
              },
            no_of_fully_functioning_upgraded_workshops_in_supported_tc: {
              $push: {
                $cond: [
                  {
                    $eq: [
                      '$no_of_fully_functioning_upgraded_workshops_in_supported_tc.state_tc.state',
                      userState
                    ]
                  },
                  '$no_of_fully_functioning_upgraded_workshops_in_supported_tc.state_tc',
                  '$$REMOVE'
                ]
              }
            }
          }
        },

        // Project to filter out empty arrays
        {
          $project: {
            no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership:
              {
                $filter: {
                  input:
                    '$no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership',
                  as: 'item',
                  cond: { $ne: ['$$item', null] }
                }
              },
            no_of_training_programs_delivered_monitored: {
              $filter: {
                input: '$no_of_training_programs_delivered_monitored',
                as: 'item',
                cond: { $ne: ['$$item', null] }
              }
            },
            no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth:
              {
                $filter: {
                  input:
                    '$no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth',
                  as: 'item',
                  cond: { $ne: ['$$item', null] }
                }
              },
            no_of_fully_functioning_upgraded_workshops_in_supported_tc: {
              $filter: {
                input:
                  '$no_of_fully_functioning_upgraded_workshops_in_supported_tc',
                as: 'item',
                cond: { $ne: ['$$item', null] }
              }
            }
          }
        }
      ])

      res.status(200).json({
        success: true,
        data: results
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err.message })
    }
  })
)

// USER 2/VALIDATOR GETTING ALL IOI IN HIS STATE

router.get(
  '/get-validator-ioi1',
  asyncErrCatcher(async (req, res) => {
    try {
      const query = `${req.query.jurisdiction}_tc`
      const ioi1 = `no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership`
      const found_data = await Ioi_comp1.findOne({
        [`${ioi1}.${query}.state`]: req.query.state
      })
      if (!found_data) return res.status(404).json('No data with inputed state')

      const filteredData = found_data[ioi1][query].filter(
        e => e.state === req.query.state
      )

      res.status(200).json({
        result: filteredData
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        Error: true,
        message: err.message
      })
    }
  })
)
router.get(
  '/get-validator-ioi2',
  asyncErrCatcher(async (req, res) => {
    try {
      const query = `${req.query.jurisdiction}_tc`
      const ioi2 = `no_of_training_programs_delivered_monitored`
      const found_data = await Ioi_comp1.findOne({
        [`${ioi2}.${query}.state`]: req.query.state
      })
      if (!found_data) return res.status(404).json('No data with inputed state')

      const filteredData = found_data[ioi2][query].filter(
        e => e.state === req.query.state
      )

      res.status(200).json({
        result: filteredData
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        Error: true,
        message: err.message
      })
    }
  })
)
router.get(
  '/get-validator-ioi3',
  asyncErrCatcher(async (req, res) => {
    try {
      const query = `${req.query.jurisdiction}_tc`
      const ioi3 = `no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth`
      const found_data = await Ioi_comp1.findOne({
        [`${ioi3}.${query}.state`]: req.query.state
      })
      if (!found_data) return res.status(404).json('No data with inputed state')

      const filteredData = found_data[ioi3][query].filter(
        e => e.state === req.query.state
      )

      res.status(200).json({
        result: filteredData
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        Error: true,
        message: err.message
      })
    }
  })
)
router.get(
  '/get-validator-ioi4',
  asyncErrCatcher(async (req, res) => {
    try {
      const query = `${req.query.jurisdiction}_tc`
      const ioi4 = `no_of_fully_functioning_upgraded_workshops_in_supported_tc`
      const found_data = await Ioi_comp1.findOne({
        [`${ioi4}.${query}.state`]: req.query.state
      })
      if (!found_data) return res.status(404).json('No data with inputed state')

      const filteredData = found_data[ioi4][query].filter(
        e => e.state === req.query.state
      )

      res.status(200).json({
        result: filteredData
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        Error: true,
        message: err.message
      })
    }
  })
)

// USER 2/VALIDATOR GETTING ALL IOI IN HIS STATE

// USER 3|NATIONAL ADMIN GET REQUESTS FOR ALL COUNT IN IOI

router.get(
  '/get-all-ioi-count',
  asyncErrCatcher(async (req, res) => {
    try {
      const results_found = await Ioi_comp1.find({}).maxTimeMS(500000)

      if (results_found.length > 0) {
        const doc = results_found[0]
        const targetField1 =
          doc.no_of_supported_TC_with_functioning_modernized_governing_board_with_industry_partnership
        const targetField2 = doc.no_of_training_programs_delivered_monitored
        const targetField3 =
          doc.no_of_supported_tc_with_reporting_and_referral_mechanisms_for_gbv_affected_youth
        const targetField4 =
          doc.no_of_fully_functioning_upgraded_workshops_in_supported_tc

        const federalCount1 = targetField1.federal_tc.reduce((acc, curr) => {
          return acc + (curr.count || 0)
        }, 0)
        const federalCount2 = targetField2.federal_tc.reduce((acc, curr) => {
          return acc + (curr.count || 0)
        }, 0)
        const federalCount3 = targetField3.federal_tc.reduce((acc, curr) => {
          return acc + (curr.count || 0)
        }, 0)
        const federalCount4 = targetField4.federal_tc.reduce((acc, curr) => {
          return acc + (curr.count || 0)
        }, 0)

        const stateCount1 = targetField1.state_tc.reduce((acc, curr) => {
          return acc + (curr.count || 0)
        }, 0)
        const stateCount2 = targetField2.state_tc.reduce((acc, curr) => {
          return acc + (curr.count || 0)
        }, 0)
        const stateCount3 = targetField3.state_tc.reduce((acc, curr) => {
          return acc + (curr.count || 0)
        }, 0)
        const stateCount4 = targetField4.state_tc.reduce((acc, curr) => {
          return acc + (curr.count || 0)
        }, 0)

        const ioi1 = {
          federal_tc: federalCount1,
          state_tc: stateCount1
        }
        const ioi1count = federalCount1 + stateCount1
        const ioi2 = {
          federal_tc: federalCount2,
          state_tc: stateCount2
        }
        const ioi2count = federalCount2 + stateCount2
        const ioi3 = {
          federal_tc: federalCount3,
          state_tc: stateCount3
        }
        const ioi3count = federalCount3 + stateCount3
        const ioi4 = {
          federal_tc: federalCount4,
          state_tc: stateCount4
        }
        const ioi4count = federalCount4 + stateCount4

        let total_aggregated_count =
          ioi1count + ioi2count + ioi3count + ioi4count

        targetField1.total_federal_count = federalCount1
        targetField1.total_state_count = stateCount1
        targetField2.total_federal_count = federalCount2
        targetField2.total_state_count = stateCount2
        targetField3.total_federal_count = federalCount3
        targetField3.total_state_count = stateCount3
        targetField4.total_federal_count = federalCount4
        targetField4.total_state_count = stateCount4
        doc.total_aggregated_count = total_aggregated_count

        await doc.save()

        res.status(200).json({
          success: true,
          results: { ioi1, ioi2, ioi3, ioi4 }
        })
      } else {
        res.status(404).json({
          success: false,
          message: 'No documents found'
        })
      }
    } catch (err) {
      console.error(err)
      res.status(500).json({
        success: false,
        message: 'Server error'
      })
    }
  })
)

module.exports = router
