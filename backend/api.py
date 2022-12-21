from flask import Flask, request
from flask_restful import Api
import elabapy
import json
import base64
from pathlib import Path
import os
import smtplib
from email.message import EmailMessage
import mimetypes
import io
import base64
from datetime import date


app = Flask(__name__, static_folder='../build',
            static_url_path='/')  # for Gunicorn deployment
# app = Flask(__name__)
api = Api(app)


# convert json form data to eLabFTW description list
def findBase64(data, prevKey, emptyArray):

    for key in data:

        if isinstance(data[key], list) and (type(data[key]) is dict):
            findBase64(data[key], prevKey+"-"+key, emptyArray)
        elif isinstance(data[key], list):
            for i in range(0, len(data[key])):
                findBase64(data[key][i], key+"-"+str(i+1), emptyArray)
        else:
            if isinstance(data[key], str):
                if data[key].startswith("data:") and ("base64" in data[key]):
                    print("found data")
                    emptyArray.append({"key": key, "data": data[key]})

    return emptyArray


# find the value of requesterKeyword
def findRequesterEmail(jsdata, requesterKeyword, result):
    for key in jsdata:
        if key == requesterKeyword:
            result = jsdata[key]
        if isinstance(jsdata[key], dict):
            result = findRequesterEmail(jsdata[key], requesterKeyword, result)
    return result


# find the value of operator Keyword
def findOperatorName(jsdata, operatorKeyword, result):
    for key in jsdata:
        if key == operatorKeyword:
            result = jsdata[key]
        if isinstance(jsdata[key], dict):
            result = findOperatorName(jsdata[key], operatorKeyword, result)
    return result


# find the falue of requesterNameKeyword
def findRequesterName(jsdata, requesterNameKeyword, result):
    for key in jsdata:
        if key == requesterNameKeyword:
            result = jsdata[key]
        if isinstance(jsdata[key], dict):
            result = findRequesterName(
                jsdata[key], requesterNameKeyword, result)
    return result


# @app.route('/')
# def index():
#    return app.send_static_file('index.html')

@app.route('/api/check_mode', methods=["GET"])
def check_mode():
    # check if online, and get list of schemas used in job request workflows
    listSchemas = []
    listSubmitText = []
    try:
        with open("./conf/jobrequest-conf.json", "r") as fi:
            f = fi.read()
            f = json.loads(f)
            emailconf_list = f["confList"]
            for element in emailconf_list:
                listSchemas.append(element["completeSchemaTitle"])
                listSchemas.append(element["requestSchemaTitle"])
                listSubmitText.append(element["submitButtonText"])
                listSubmitText.append(element["submitButtonText"])
        return {"message": "connection is a success", "jobRequestSchemaList": listSchemas, "submitButtonText": listSubmitText}
    except Exception as e:
        return {"message": "connection is a success", "jobRequestSchemaList": listSchemas, "submitButtonText": listSubmitText}


# get schemas from backend
@app.route('/api/get_schemas', methods=["GET"])
def get_schemas():
    list_of_schemas = {"schemaName": [""], "schema": [None]}
    filelist = list(Path('./schemas').glob('**/*.json'))
    for i in range(0, len(filelist)):
        file = filelist[i]
        file = open(str(file), 'r', encoding='utf-8')
        filename = str(file.name).replace("schemas\\", "")
        filename = filename.replace("schemas/", "")  # for linux, maybe
        content = file.read()
        list_of_schemas["schema"].append(content)
        list_of_schemas["schemaName"].append(filename)
    return list_of_schemas


# get available tags from eLabFTW
@app.route('/api/get_tags', methods=['POST'])
def get_tags():
    elabURL = request.form['eLabURL']
    token = request.form['eLabToken']
    # create elab manager
    elabURL = '{}/api/v1/'.format(elabURL)
    elabURL = elabURL.replace('//api', '/api')
    manager = elabapy.Manager(
        endpoint=elabURL, token=token)
    all_tags = manager.get_tags()

    return json.dumps(all_tags)


# create experiment in eLabFTW
@app.route('/api/create_experiment', methods=['POST'])
def create_experiment():
    jsdata = request.form['javascript_data']
    jsschema = request.form['schema']
    elabURL = request.form['eLabURL']
    token = request.form['eLabToken']
    title = request.form['title']
    body = request.form['body']
    tags = request.form['tags']
    tags = json.loads(tags)
    jsdata = json.loads(jsdata)
    jsschema = json.loads(jsschema)
    jsschema_title = jsschema["title"]

    # create experiment in eLabFtw
    elabURL = '{}/api/v1/'.format(elabURL)
    elabURL = elabURL.replace('//api', '/api')
    manager = elabapy.Manager(
        endpoint=elabURL, token=token)
    response = manager.create_experiment()

    print("response:",response)

    # create the experiment body which is the description list attained by converting the jsdata

    # update the experiment
    params = {"title": title, "body": body}
    manager.post_experiment(response['id'], params)

    # upload the schema
    with open('temp-files//json_schema.json', 'w') as outfile:
        outfile.write(json.dumps(jsschema))
    with open('temp-files//json_schema.json') as file:
        file_param = {'file': file}
        manager.upload_to_experiment(response['id'], file_param)

    # upload form data/jsdata
    with open('temp-files//json_data.json', 'w') as outfile:
        outfile.write(json.dumps(jsdata))
    with open('temp-files//json_data.json') as file:
        file_param = {'file': file}
        manager.upload_to_experiment(response['id'], file_param)

    # now if tags is not empty then add tags to this experiment id one by one
    if len(tags) != 0:
        for i in tags:
            params = {'tag': i['tag']}
            manager.add_tag_to_experiment(response['id'], params)

    """ to append the body
    params = {"bodyappend": "appended text<br>"}
    manager.post_experiment(response['id'], params)
    """

    # now check if there are file data in jsdata, if there is then upload it
    collected_data = findBase64(jsdata, "start", [])
    file = open("./mime-types-extensions.json",
                'r', encoding='utf-8')
    mimeExtensions = file.read()
    file.close()
    fileNames = []
    mimeExtensions = json.loads(mimeExtensions)
    for item in collected_data:
        mimeType = item["data"].split(";")[0].replace("data:", "")
        extension = list(mimeExtensions.keys())[
            list(mimeExtensions.values()).index(mimeType)]
        fileNames.append(item["key"]+extension)
        _, encoded = item["data"].split(",", 1)
        binary_data = base64.b64decode(encoded)
        with open("./temp-files/"+item["key"]+extension, "wb") as fh:
            fh.write(binary_data)
        with open("temp-files//"+item["key"]+extension, "r+b") as fh:
            file_param = {'file': fh}
            manager.upload_to_experiment(response['id'], file_param)
    print(fileNames)

    # now delete everything in temp-files directory
    dir = './temp-files'
    for f in os.listdir(dir):
        if f != ".placeholder":
            os.remove(os.path.join(dir, f))

    # check if this process is related to job request workflow, if yes then send an e-mail notif to the requester
    try:
        with open("./conf/jobrequest-conf.json", "r") as fi:
            f = fi.read()
            f = json.loads(f)
            email_conf = ""
            for element in f["confList"]:
                if element["completeSchemaTitle"] == jsschema_title or element["requestSchemaTitle"] == jsschema_title:
                    email_conf = element
            # finish the process if not related to job request workflow
            if email_conf == "":
                return {"responseText": f"Created experiment with id {response['id']}.", "message": "success", "experimentId": response['id']}

            requesterEmail = findRequesterEmail(
                jsdata, email_conf["requesterEmailKeyword"], "")

            # sending the emails
            s = smtplib.SMTP_SSL(email_conf["smtp"])

            # PREPARE msg for APPLICANT
            msg = EmailMessage()
            msg['From'] = email_conf["from"]
            msg['To'] = requesterEmail
            msg['Subject'] = email_conf["requestAcceptedSubject"]

            header = email_conf["requestAcceptedHeaderText"]
            html = header+body

            msg.set_content(html, subtype="html")

            s.send_message(msg)
            print("applicant email is valid")
            del msg
    except Exception as e:
        print("No job request configuration was found. Skipping.")

    return {"responseText": f"Created experiment with id {response['id']}.", "message": "success", "experimentId": response['id']}


@app.route('/api/submit_job_request', methods=['POST'])
def submit_job_request():
    today = date.today()
    dateToday = today.strftime("%d_%b_%Y")

    jsdata = request.form['javascript_data']
    jsschema = request.form['schema']
    body = request.form['body']
    jsdata = json.loads(jsdata)
    jsschema = json.loads(jsschema)

    try:
        with open("./conf/jobrequest-conf.json", "r") as fi:
            f = fi.read()

            # find the right conf based on the schema title
            f = json.loads(f)
            email_conf = {}
            for element in f["confList"]:
                if element["completeSchemaTitle"] == jsschema["title"] or element["requestSchemaTitle"] == jsschema["title"]:
                    email_conf = element

            requesterEmail = findRequesterEmail(
                jsdata, email_conf["requesterEmailKeyword"], "")
            operatorName = findOperatorName(
                jsdata, email_conf["operatorNameKeyword"], "")
            operatorName_ = operatorName.replace(" ", "_")
            operatorEmail = ""
            responsiblePersonEmail = email_conf["responsibleOperatorEmail"]

            for key in email_conf["operators"]:
                if key == operatorName_:
                    operatorEmail = email_conf["operators"][operatorName_]

            #print("smtp:", email_conf["smtp"])
            #print("operator:", operatorEmail)
            #print("requester:", requesterEmail)
            #print("responsible:", responsiblePersonEmail)

            # sending the emails
            s = smtplib.SMTP_SSL(email_conf["smtp"])

            # PREPARE msg1 for APPLICANT
            msg1 = EmailMessage()
            msg1['From'] = email_conf["from"]
            msg1['To'] = requesterEmail
            msg1['Subject'] = email_conf["confirmationEmailSubject"]

            header1 = email_conf["confirmationHeaderText"]
            html1 = header1+body

            msg1.set_content(html1, subtype="html")

            # PREPARE msg2 for OPERATOR
            msg2 = EmailMessage()
            msg2['From'] = email_conf["from"]
            msg2['To'] = "{0}, {1}".format(
                operatorEmail, responsiblePersonEmail)
            msg2['Subject'] = email_conf["requestReceivedEmailSubject"]

            header2 = email_conf["requestReceivedHeaderText"]
            html2 = header2+body

            msg2.set_content(html2, subtype="html")

            # create json attachments
            for i in range(0, 2):
                data = ""
                if i == 0:
                    data = jsdata
                    fileName = "form_data"
                else:
                    data = jsschema
                    fileName = "schema"

                f = json.dumps(data, indent=2).encode('utf-8')
                f_byte_arr = io.BytesIO()
                f_byte_arr.write(f)
                f_byte_arr.seek(0)
                binary_data = f_byte_arr.read()
                # Guess MIME type or use 'application/octet-stream'
                maintype, _, subtype = (mimetypes.guess_type("{0}_{1}.json".format(
                    fileName, dateToday))[0] or 'application/octet-stream').partition("/")
                # Add as attachment
                msg1.add_attachment(binary_data, maintype=maintype, subtype=subtype,
                                    filename="{0}_{1}.json".format(fileName, dateToday))
                msg2.add_attachment(binary_data, maintype=maintype, subtype=subtype,
                                    filename="{0}_{1}.json".format(fileName, dateToday))

            # now send the emails to both requester and operator (and responsible person)
            try:
                s.send_message(msg1)
                s.send_message(msg2)
                print("applicant email is valid")
                del msg1
                del msg2
                return {"response": 200, "responseText": "Your request has been submitted."}
            except Exception as e:
                del msg1
                del msg2
                print(e)
                return {"response": 500, "responseText": "Something went wrong"}

    except Exception as e:
        print(e)
        return {"response": 500, "responseText": "List of operators are not available in the server."}

# if __name__ == "__main__":
#    app.run(debug=True, host="0.0.0.0", port=5000)
