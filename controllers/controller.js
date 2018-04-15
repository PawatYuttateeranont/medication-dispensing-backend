

exports.getDoctors = function (req, res) {
    connection.query('SELECT * from doctor', function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 500, "error": error, "data": null}));
            //If there is error, we send the error in the error section with 500 status
        } else {
            res.send(JSON.stringify({"status": 200, "error": null, "data": results}));
            //If there is no error, all is good and response is 200OK.
        }
    });
}

exports.getPatients = function (req, res) {
    connection.query('SELECT * from patient', function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 500, "error": error, "data": null}));
            //If there is error, we send the error in the error section with 500 status
        } else {
            res.send(JSON.stringify({"status": 200, "error": null, "data": results}));
            //If there is no error, all is good and response is 200OK.
        }
    });
}

exports.getMedicines = function (req, res) {
    connection.query('SELECT * from medicine', function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 500, "error": error, "data": null}));
            //If there is error, we send the error in the error section with 500 status
        } else {
            res.send(JSON.stringify({"status": 200, "error": null, "data": results}));
            //If there is no error, all is good and response is 200OK.
        }
    });
}

exports.getValidMedicines = function (req, res) {
    var command = "SELECT S.STOCK_ID, M.MED_NAME FROM STOCK S  INNER JOIN MEDICINE M ON S.MED_ID=M.MED_ID WHERE (S.MED_ID, S.STOCK_DATE_EXP) IN ( SELECT A.MED_ID, MIN(A.STOCK_DATE_EXP) FROM STOCK A  WHERE A.STOCK_DATE_EXP>DATE_ADD(SYSDATE(), INTERVAL 90 DAY) GROUP BY A.MED_ID)"
    connection.query(command, function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 500, "error": error, "data": null}));
            //If there is error, we send the error in the error section with 500 status
        } else {
            res.send(JSON.stringify({"status": 200, "error": null, "data": results}));
            //If there is no error, all is good and response is 200OK.
        }
    });
}

exports.createPrescription = function (req, res) {
    // Create prescription
    var command = "INSERT INTO prescription (PRE_DATE, PRE_NOTE, PRE_STATUS, PAT_ID, DOC_ID) VALUES (CURRENT_TIMESTAMP, '" + req.body.note + "', 'PENDING', " + req.body.patientId + ", " +  req.body.doctorId + ")"
    connection.query(command, function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 500, "error": error, "data": null}));
            //If there is error, we send the error in the error section with 500 status
        } else {
            // res.send(JSON.stringify({"status": 200, "error": null, "data": results}));
            //If there is no error, all is good and response is 200OK.

            var command = "SELECT PRE_ID from prescription WHERE PAT_ID='" + req.body.patientId + "' AND DOC_ID='" + req.body.doctorId + "'"
            connection.query(command, function (error, results, fields) {
                if(error){
                    res.send(JSON.stringify({"status": 500, "error": error, "data": null}));
                    //If there is error, we send the error in the error section with 500 status
                } else {
                    // res.send(JSON.stringify({"status": 200, "error": null, "data": results}));
                    //If there is no error, all is good and response is 200OK.
                    prescriptionId = results[results.length-1]

                    for (i in req.body.items) {

                        // Add item
                        var command = "INSERT INTO item (STOCK_ID, PRE_ID, ITEM_QTY) VALUES ('" + req.body.items[i].stockId + "', '" + prescriptionId.PRE_ID + "', '" + req.body.items[i].itemQty + "')"
                        connection.query(command, function (error, results, fields) {
                            if(error){
                                res.send(JSON.stringify({"status": 500, "error": error, "data": null}));
                                //If there is error, we send the error in the error section with 500 status
                            } else {
                                // res.send(JSON.stringify({"status": 200, "error": null, "data": results}));
                                //If there is no error, all is good and response is 200OK.
                            }
                        });

                        // Decrease stock
                        var command = "UPDATE stock SET STOCK_TOTAL=STOCK_TOTAL-" + req.body.items[i].itemQty + " WHERE STOCK_ID=" + req.body.items[i].stockId
                        connection.query(command, function (error, results, fields) {
                            if(error){
                                res.send(JSON.stringify({"status": 500, "error": error, "data": null}));
                                //If there is error, we send the error in the error section with 500 status
                            } else {
                                // res.send(JSON.stringify({"status": 200, "error": null, "data": results}));
                                //If there is no error, all is good and response is 200OK.
                            }
                        });

                    }

                    res.send(JSON.stringify({"status": 200, "error": null, "data": "CREATE PRESCRIPTION SUCCESS"}));

                }
            });
        }
    });
}

exports.getPrescriptions = function (req, res) {
    var command = "SELECT p.PRE_ID as prescriptionId, \n" +
        "\tCONCAT(d.DOC_FNAME,' ', d.DOC_LNAME) as doctor, \n" +
        "\tCONCAT(t.PAT_FNAME,' ',t.PAT_LNAME) as patient, \n" +
        "    p.PRE_STATUS as status, \n" +
        "    p.PRE_DATE as date,\n" +
        "    CONCAT(c.PHAR_FNAME,' ',c.PHAR_LNAME) as 'by'\n" +
        "FROM prescription p \n" +
        "\tINNER JOIN doctor d ON p.DOC_ID = d.DOC_ID\n" +
        "    INNER JOIN patient t ON p.PAT_ID = t.PAT_ID\n" +
        "    LEFT JOIN pharmarcist  c ON p.PHAR_ID = c.PHAR_ID\n"
    connection.query(command, function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 500, "error": error, "data": null}));
            //If there is error, we send the error in the error section with 500 status
        } else {
            res.send(JSON.stringify({"status": 200, "error": null, "data": results}));
            //If there is no error, all is good and response is 200OK.
        }
    });
}

exports.getPrescriptionById = function (req, res) {
    var command = "SELECT p.PRE_ID as prescriptionId, \n" +
        "    p.PRE_STATUS as status, \n" +
        "\tCONCAT(d.DOC_FNAME,' ', d.DOC_LNAME) as doctor, \n" +
        "\tCONCAT(t.PAT_FNAME,' ',t.PAT_LNAME) as patient, \n" +
        "    p.PRE_DATE as date,\n" +
        "    m.MED_NAME as 'medicine',\n" +
        "    m.MED_USE as 'medicineDesc',\n" +
        "    i.ITEM_QTY as amount,\n" +
        "    m.MED_UNIT as unit,\n" +
        "    p.PRE_NOTE as note\n" +
        "FROM prescription p \n" +
        "\tINNER JOIN doctor d ON p.DOC_ID = d.DOC_ID\n" +
        "    INNER JOIN patient t ON p.PAT_ID = t.PAT_ID\n" +
        "\tINNER JOIN item i ON p.PRE_ID = i.PRE_ID\n" +
        "    INNER JOIN stock s ON s.STOCK_ID = i.STOCK_ID\n" +
        "    INNER JOIN medicine m ON s.MED_ID = m.MED_ID\n" +
        "    LEFT JOIN pharmarcist c ON p.PHAR_ID = c.PHAR_ID\n" +
        "WHERE p.PRE_ID = " + req.params.prescriptionId
    connection.query(command, function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 500, "error": error, "data": null}));
            //If there is error, we send the error in the error section with 500 status
        } else {
            res.send(JSON.stringify({"status": 200, "error": null, "data": results}));
            //If there is no error, all is good and response is 200OK.
        }
    });
}



