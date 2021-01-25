var lights;

function initializeAll() {
    grabData();
    createLightTable();
}


/**
 * Create table which shows all the lights currently in the config
 */
function createLightTable() {
    let content = document.getElementById('on-off-table');
    let table = document.createElement('table');
    let tbody = document.createElement('tbody');
    table.appendChild(tbody);

    let headRow = document.createElement('tr');
    tbody.appendChild(headRow);

    //Create table head
    for (var i = 0; i < 3; i++){
        let currentHead = document.createElement('th');
        if (i === 0) {
            currentHead.innerHTML = 'Name';
        }  else {
            currentHead.innerHTML = '';
        }
        headRow.appendChild(currentHead);
    }

    //Create entry for each light currently saved
    for(let i = 0; i < lights.length; i++){
        let currentRow = document.createElement('tr');

        for (let j = 0; j < 3; j++) {
            let currentElement = document.createElement('td');
            if (j === 0) {
                //add name
                currentElement.innerHTML = lights[i].name;
            } else if (j === 1) {
                //add on button
                currentElement.appendChild(createToggleButton(lights[i], true));
            } else {
                //add off button
                currentElement.appendChild(createToggleButton(lights[i], false));
            }
            currentRow.appendChild(currentElement);
        }
        tbody.appendChild(currentRow);
    }
    content.appendChild(table);
}

/**
 * Create on/off button
 */
function createToggleButton(light, value) {
    let btn = document.createElement('input');
    btn.type = 'button';
    btn.addEventListener('click', () => {
        sendToggleCommand(value, light.id, light.code);
    });
    // btn.onclick = sendCommand(value, light.id, light.code);
    if (value === true) {
        btn.value = 'ON';
    } else {
        btn.value = 'OFF';
    }
    return btn;
}

/**
 * Send On/Off command to the server
 */
function sendToggleCommand(value, id, code) {
    let url = '/data?a=cv&i=';
    url += id + '&c=';
    url += code + '&v=';
    //turn light on
    if (value === true) {
        url += '1';
    } else {
        url += '0';
    }
    let httpReq = new XMLHttpRequest();
    httpReq.open('POST', url, true);
    httpReq.send(null);
}

/**
 * Grab the current configuration from the server, parse to JSON and save to data.
 */
function grabData() {
    const url = "/data?a=r";
    let httpReq = new XMLHttpRequest();
    httpReq.open('GET', url, false);
    httpReq.send(null);
    lights = JSON.parse(httpReq.responseText).lights;
}


