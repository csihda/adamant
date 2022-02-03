from distutils import filelist
from flask import Flask, request
from flask_restful import Api
import elabapy
import json
import io
import base64
from PIL import Image
from pathlib import Path
import os

app = Flask(__name__, static_folder='../build',
            static_url_path='/')  # for Gunicorn deployment
#app = Flask(__name__)
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


# @app.route('/')
# def index():
#    return app.send_static_file('index.html')


@app.route('/api/check_mode', methods=["GET"])
def check_mode():
    return {"message": "connection is a success"}


@app.route('/api/get_schemas', methods=["GET"])
def get_schemas():
    list_of_schemas = {"schemaName": [""], "schema": [None]}
    filelist = list(Path('./schemas').glob('**/*.json'))
    for i in range(0, len(filelist)):
        file = filelist[i]
        file = open(str(file), 'r', encoding='utf-8')
        filename = str(file.name).replace("schemas\\", "")
        content = file.read()
        list_of_schemas["schema"].append(content)
        list_of_schemas["schemaName"].append(filename)
    return list_of_schemas


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

    # create experiment in eLabFtw
    elabURL = '{}/api/v1/'.format(elabURL)
    elabURL = elabURL.replace('//api', '/api')
    manager = elabapy.Manager(
        endpoint=elabURL, token=token)
    response = manager.create_experiment()

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
        os.remove(os.path.join(dir, f))

    return {"responseText": f"Created experiment with id {response['id']}.", "message": "success", "experimentId": response['id']}


"""
@app.route('/api/atat_capture_image', methods=['GET'])
def atat_capture_image():
    img = Image.open("atat_meme.jpg", mode='r')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='png')
    my_encoded_img = base64.encodebytes(
        img_byte_arr.getvalue()).decode('ascii')
    return my_encoded_img
"""

# if __name__ == "__main__":
#    app.run(debug=True, host="0.0.0.0", port=5000)
