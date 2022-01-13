const formData2descriptionList = (jsonData) => {
    let descList = "";
    Object.keys(jsonData).forEach(item => {
        if (typeof (jsonData[item]) === 'object') {
            //descList += `<h2>${item}</h2>\n`
            if (Array.isArray(jsonData[item])) {
                descList += `<dt>${item}</dt>\n`;
                descList += `<dd>${jsonData[item]}</dd>\n`;
            } else {
                descList += ("<dl>\n" + formData2descriptionList(jsonData[item]) + "</dl>\n");
            }
        }
        else {
            descList += `<dt>${item}</dt>\n`;
            descList += `<dd>${jsonData[item]}</dd>\n`;
        }
    })

    return descList;
}

export default formData2descriptionList;