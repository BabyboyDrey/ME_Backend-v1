const mongoose = require('mongoose')

const generalActivitiesSchema = new mongoose.Schema({
  federal_tc: [
    {
      procurement_of_project_vehicle: {
        type: String
      },
      renovation_of_ideas_project_office: {
        type: String
      },
      procurement_of_office_furniture_and_equipment_for_ideas_office: {
        type: String
      },
      procurement_of_diesel_generator: {
        type: String
      },
      provision_of_solar_powered_borehole_and_water_reticulation: {
        type: String
      },
      installation_of_solar_power_system: {
        type: String
      },
      installation_of_solar_powered_streetlights: {
        type: String
      },
      procurement_and_installations_of_ICT_equipment_internet_infrastructure: {
        type: String
      },
      renovation_and_upgrading_of_toilet_facility: {
        type: String
      },
      renovation_of_ICT_laboratory: {
        type: String
      },
      gbv_sensitization: {
        type: String
      },
      tvet_sensitization: {
        type: String
      },
      renovation_of_classrooms: {
        type: String
      },
      renovation_of_college_library: {
        type: String
      },
      tc_name: {
        type: String
      }
    }
  ],
  state_tc: [
    {
      procurement_of_project_vehicle: {
        type: String
      },
      renovation_of_ideas_project_office: {
        type: String
      },
      procurement_of_office_furniture_and_equipment_for_ideas_office: {
        type: String
      },
      procurement_of_diesel_generator: {
        type: String
      },
      provision_of_solar_powered_borehole_and_water_reticulation: {
        type: String
      },
      installation_of_solar_power_system: {
        type: String
      },
      installation_of_solar_powered_streetlights: {
        type: String
      },
      procurement_and_installations_of_ICT_equipment_internet_infrastructure: {
        type: String
      },
      renovation_and_upgrading_of_toilet_facility: {
        type: String
      },
      renovation_of_ICT_laboratory: {
        type: String
      },
      gbv_sensitization: {
        type: String
      },
      tvet_sensitization: {
        type: String
      },
      renovation_of_classrooms: {
        type: String
      },
      renovation_of_college_library: {
        type: String
      },
      state: {
        type: String
      },
      tc_name: {
        type: String
      }
    }
  ]
})

generalActivitiesSchema.index({ 'federal_tc.tc_name': 1 })
generalActivitiesSchema.index({ 'state_tc.tc_name': 1 })

module.exports = Generalactivities = mongoose.model(
  'Generalactivities',
  generalActivitiesSchema
)
