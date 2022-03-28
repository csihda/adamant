<img src="https://raw.githubusercontent.com/csihda/adamant/59c295d846e9cc140c01b308c07a2499c1eb8e39/src/assets/adamant-header-5.svg" alt="drawing" style="width:50%;"/>
Adamant is a JSON schema-based metadata creation tool presented in a user-friendly interface. Adamant aims to ease the integration of various research data management (RDM) workflows into the everyday research routine of especially small independent laboratories, which hopefully leads to generation of research data that adhere to the FAIR (findable, accessible, interoperable, reusable) principles.
Currently, Adamant supports the following features:
- Rendering of interactive web-form based on a valid JSON schema
- User-friendly editing process of the rendered web-form and the corresponding schema
- Creating a valid JSON schema and web-form from scratch
- Live validation for various field types
- Quick re-use of existing schemas from a list
- Downloadable JSON schema and its form data
- API-based integration as various form submission functionalities

A live demo of Adamant (client only) is available at: https://csihda.github.io/adamant/.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# For development
- `∼/$ gitclone https://github.com/csihda/adamant.git`—download or clone the repository
- `∼/$ cd adamant`—go to adamant project directory
- `∼/adamant$ npm install`—install the dependencies for the client-side
- `∼/adamant$ cd backend`—go to backend directory
- `∼/adamant/backend$ python -m venv venv`—create a python virtual environment
- `∼/adamant/backend$ ./venv/Scripts/activate—activate the virtual environment
- `∼/adamant/backend$ pip install -r requirements.txt`—install the dependencies for the back-end
- `∼/adamant/backend$ cd ..`—go back to adamant project directory
- `∼/adamant$ yarn start-api`—start the back-end
- `∼/adamant$ yarn start`—on a new terminal, in the adamant project directory, start the client-si

By default, Adamant is accessible at `http://localhost:3000`.

# For deployment
We recommend to deploy Adamant with docker-compose, which can be done with ease:
- `∼$ gitclone https://github.com/csihda/adamant.git`—clone the repository
- `∼$ cd adamant`—go to adamant project directory
- `∼/adamant$ docker−compose build`—build the docker images for both back-end and front-end
- `∼/adamant$ docker−compose up -d`—start both client and server containers, i.e., the whole system

By default, the deployed system can be accessed at `http://localhost:3000`.

# TO DO: Example use cases


# TO DO: Grant information/acknowledgement
