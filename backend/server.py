from flask import Flask, request
from flask_restful import Api
import elabapy
import json
import io
import base64
from PIL import Image

app = Flask(__name__)
api = Api(app)


# convert json form data to eLabFTW description list
def json_to_description_list(json_data):
    return json_data


@app.route('/adamant/api/check_mode', methods=["GET"])
def check_mode():
    return {"message": "connection is a success"}


@app.route('/adamant/api/create_experiment', methods=['POST'])
def create_experiment():
    jsdata = request.form['javascript_data']
    token = request.form['elabToken']
    title = request.form['title']
    body = request.form['body']
    jsdata = json.loads(jsdata)

    # create experiment in eLabFtw
    manager = elabapy.Manager(
        endpoint='https://pm-labbook.intranet.inp-greifswald.de/api/v1/', token=token)
    response = manager.create_experiment()
    print(f"Created experiment with id {response['id']}.")

    # create the experiment body which is the description list attained by converting the jsdata

    # update the experiment
    params = {"title": title, "body": body}
    manager.post_experiment(response['id'], params)

    """ to append the body
    params = {"bodyappend": "appended text<br>"}
    manager.post_experiment(response['id'], params)
    """

    return {"responseText": f"Created experiment with id {response['id']}.", "message": "success", "experimentId": response['id']}


"""
@app.route('/adamant/api/atat_capture_image', methods=['GET'])
def atat_capture_image():
    img = Image.open("atat_meme.jpg", mode='r')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='png')
    my_encoded_img = base64.encodebytes(
        img_byte_arr.getvalue()).decode('ascii')
    return my_encoded_img
"""

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
