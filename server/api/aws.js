const fs = require('fs');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-southeast-1' });

require('dotenv').config()
const ses = new AWS.SES({
    accessKeyId: process.env.S3ACCESSKEY,
    secretAccessKey: process.env.S3SECRET
});

const s3 = new AWS.S3({
    accessKeyId: process.env.S3ACCESSKEY,
    secretAccessKey: process.env.S3SECRET
});

const S3ProfileDir = 'user/'


const aws = {
    deleteEmailTemplate: function (name) {
        var params = {
            TemplateName: name /* required */
        };
        ses.deleteTemplate(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
        });
    },

    createEmailTemplate: function (templateName, htmlBody, subject, text = "Please contact us") {
        var params = {
            Template: { /* required */
                TemplateName: templateName, /* required */
                HtmlPart: htmlBody,
                SubjectPart: subject,
                TextPart: text
            }
        };

        ses.createTemplate(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
        });
    },

    readHTMLFileAndCreateEmailTemplate: function (path, templateName, subject, text = "Please contact us") {
        //Path example: __dirname + '../../email_template/resetPassword.html'
        fs.readFile(__dirname + path, 'utf8', function (err, html) {
            aws.createEmailTemplate(templateName, html, subject, text);
        })
    },

    sendForgotPasswordTemplateEmail: async function (recipient, sender, token,) {
        const params = {
            Destination: { /* required */
                CcAddresses: [],
                ToAddresses: [
                    recipient,
                    /* more To email addresses */
                ]
            },
            Source: sender, /* required */
            Template: 'forgotPasswordProduction',
            TemplateData: `{\"reset\":{\"token\":\"${token}\"}}`,
            ReplyToAddresses: [],
        };


        // Create the promise and SES service object
        var sendPromise = ses.sendTemplatedEmail(params).promise();
        const data = await sendPromise;
        return data
    },

    uploadImageToS3: function (bucketName, S3FileLabel, fileContent) {
        const params = {
            Bucket: bucketName,
            Key: S3ProfileDir + S3FileLabel, // File name you want to save as in S3
            Body: fileContent,
            ContentType: 'image/jpeg',
            ACL: 'public-read'
        };

        // Uploading files to the bucket
        let data = s3.upload(params, function (err, data) {
            if (err) {
                console.log('s3 upload err', err);
            }
        });

        return data.promise()

    }


}

module.exports = aws