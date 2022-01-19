const createDescriptionList = (data) => {
    let descList = "";
    const emptyString = (element) => element === "";

    data.forEach(element => {
        if (element["path"] === "") {
            descList += "<dl>\n";
            element["fields"].forEach(item => {
                if (item["$id"] !== undefined) {
                    descList += `<dt><span style="color: #ffffff;"><a style="color: #ffffff;" title=${item["$id"]} href=${item["$id"]}>${item["label"]}</a></span></dt>\n`
                    descList += `<dd>${item["value"]}</dd>\n`
                } else {
                    descList += `<dt>${item["label"]}</dt>\n`
                    descList += `<dd>${item["value"]}</dd>\n`
                }
            })
            descList += "</dl>\n"
        } else {
            let pathArr = element["path"].split(".");
            let titleDiv = "<div>"
            pathArr.forEach((item, index) => {
                if (element["pathURIs"] !== undefined & !element["pathURIs"].some(emptyString)) {
                    if (item !== "") {
                        if (index === (pathArr.length - 1)) {
                            titleDiv += `<a title=${element["pathURIs"][index]} href=${element["pathURIs"][index]}><strong>${element["pathLabels"][index]}</strong></a>`

                        } else {
                            titleDiv += `<a title=${element["pathURIs"][index]} href=${element["pathURIs"][index]}>${element["pathLabels"][index]}</a>/`
                        }
                    } else {
                        if (index === (pathArr.length - 1)) {
                            titleDiv += `<strong>${element["pathLabels"][index]}</strong>`

                        } else {
                            titleDiv += `${element["pathLabels"][index]}/`
                        }
                    }
                } else {
                    if (index === (pathArr.length - 1)) {
                        titleDiv += `<strong>${element["pathLabels"][index]}</strong>`

                    } else {
                        titleDiv += `${element["pathLabels"][index]}/`
                    }
                }
            })
            titleDiv += "</div>\n"

            descList += titleDiv
            descList += "<dl>\n";
            element["fields"].forEach(item => {
                if (item["$id"] !== undefined) {
                    descList += `<dt><span style="color: #ffffff;"><a style="color: #ffffff;" title=${item["$id"]} href=${item["$id"]}>${item["label"]}</a></span></dt>\n`
                    descList += `<dd>${item["value"]}</dd>\n`
                } else {
                    descList += `<dt>${item["label"]}</dt>\n`
                    descList += `<dd>${item["value"]}</dd>\n`
                }
            })
            descList += "</dl>\n"

        }

    });


    return descList;
}

export default createDescriptionList;