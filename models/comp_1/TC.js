const mongoose = require('mongoose')

const tcSchema = new mongoose.Schema({
  federal_tc: [
    {
      institution_code: {
        type: Number
      },
      institution_name: {
        type: String
      },
      institution_type: {
        type: String
      },
      institution_state: {
        type: String
      },
      institution_cat: {
        type: String
      },
      institution_ownership: {
        type: String
      },
      institution_year_est: {
        type: String
      },
      institution_address: {
        type: String
      },
      institution_phone: {
        type: Number
      },
      institution_email: {
        type: String
      },

      male_hostel_number: {
        type: Number
      },
      female_hostel_number: {
        type: Number
      },

      canteens_num: {
        type: Number
      },
      sponsor: {
        type: String
      },
      bus_num: {
        type: Number
      },
      gen_num: {
        type: Number
      },
      power_type: {
        type: String
      },
      power_capacity: {
        type: String
      },
      agricultural_fields: {
        type: String
      }
    }
  ],
  state_tc: [
    {
      institution_code: {
        type: Number
      },
      institution_name: {
        type: String
      },
      institution_type: {
        type: String
      },
      institution_state: {
        type: String
      },
      institution_cat: {
        type: String
      },
      institution_ownership: {
        type: String
      },
      institution_year_est: {
        type: String
      },
      institution_address: {
        type: String
      },
      institution_phone: {
        type: Number
      },
      institution_email: {
        type: String
      },

      male_hostel_number: {
        type: Number
      },
      female_hostel_number: {
        type: Number
      },

      canteens_num: {
        type: Number
      },
      sponsor: {
        type: String
      },
      bus_num: {
        type: Number
      },
      gen_num: {
        type: Number
      },
      power_type: {
        type: String
      },
      power_capacity: {
        type: String
      },
      agricultural_fields: {
        type: String
      }
    }
  ]
})

tcSchema.index({ 'federal_tc.institution_email': 1 })
tcSchema.index({ 'state_tc.institution_email': 1 })

module.exports = Tc = mongoose.model('Tc', tcSchema)
