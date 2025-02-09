const mongoose = require('mongoose');

const FormDataSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const FormDataModel = mongoose.model('log_reg_form', FormDataSchema);

module.exports = FormDataModel;









//====================================================================================================



// const mongoose = require('mongoose');

// const FormDataSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },  // Ensure unique emails
//     password: { type: String, required: true },
// });

// const FormDataModel = mongoose.model('log_reg_form', FormDataSchema);

// module.exports = FormDataModel;





//==============================================================================================

// const mongoose = require('mongoose');

// const FormDataSchema = new mongoose.Schema({
//     name : String,
//     email: String,
//     password: String
// })

// const FormDataModel = mongoose.model('log_reg_form', FormDataSchema);

// module.exports = FormDataModel;
