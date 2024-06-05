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
      institution_cat: {
        type: String
      },
      institution_ownership: {
        type: String
      },
      institution_location: {
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
      admin_office_number: {
        type: Number
      },
      admin_office_size: {
        type: String
      },
      admin_office_capacity: {
        type: String
      },
      clinics_number: {
        type: Number
      },
      clinics_size: {
        type: String
      },
      clinics_capacity: {
        type: String
      },
      male_hostel_number: {
        type: Number
      },
      male_hostel_size: {
        type: String
      },
      male_hostel_capacity: {
        type: String
      },
      female_hostel_number: {
        type: Number
      },
      female_hostel_size: {
        type: String
      },
      female_hostel_capacity: {
        type: String
      },
      canteens_num: {
        type: Number
      },
      canteens_size: {
        type: String
      },
      sponsor: {
        type: String
      },
      fields_num: {
        type: Number
      },
      fields_size: {
        type: String
      },
      fields_capacity: {
        type: String
      },
      bus_num: {
        type: Number
      },
      bus_size: {
        type: String
      },
      road_length: {
        type: String
      },
      tar_length: {
        type: String
      },
      inst_area: {
        type: String
      },
      length_area: {
        type: String
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
      },
      purpose_of_field: {
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
      institution_cat: {
        type: String
      },
      institution_ownership: {
        type: String
      },
      institution_location: {
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
      admin_office_number: {
        type: Number
      },
      admin_office_size: {
        type: String
      },
      admin_office_capacity: {
        type: String
      },
      clinics_number: {
        type: Number
      },
      clinics_size: {
        type: String
      },
      clinics_capacity: {
        type: String
      },
      male_hostel_number: {
        type: Number
      },
      male_hostel_size: {
        type: String
      },
      male_hostel_capacity: {
        type: String
      },
      female_hostel_number: {
        type: Number
      },
      female_hostel_size: {
        type: String
      },
      female_hostel_capacity: {
        type: String
      },
      canteens_num: {
        type: Number
      },
      canteens_size: {
        type: String
      },
      sponsor: {
        type: String
      },
      fields_num: {
        type: Number
      },
      fields_size: {
        type: String
      },
      fields_capacity: {
        type: String
      },
      bus_num: {
        type: Number
      },
      bus_size: {
        type: String
      },
      road_length: {
        type: String
      },
      tar_length: {
        type: String
      },
      inst_area: {
        type: String
      },
      length_area: {
        type: String
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
      },
      purpose_of_field: {
        type: String
      }
    }
  ]
})

tcSchema.index({ 'federal_tc.institution_email': 1 })
tcSchema.index({ 'state_tc.institution_email': 1 })

module.exports = Tc = mongoose.model('Tc', tcSchema)
