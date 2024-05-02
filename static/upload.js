// https://medium.com/@2121997him/how-to-upload-files-using-only-nodejs-and-express-d7ead02c9ee5
let running = false;

async function testSpeed() {
  if(running === true) {
    return;
  }

  running = true;

  let elapsedTimeInSeconds = 0;
  const lengthInBytes = 100000;
  const blob = new Blob([makeid(lengthInBytes)], { type: 'text/plain' });

  let startTime = Date.now();
  let averageSpeed = 0;
  let measurements = 0;

  const averageSpeedSpan = document.getElementById("average-speed");
  const currentSpeedSpan = document.getElementById("current-speed");

  while(elapsedTimeInSeconds < 10) {
    const uploadStartTime = Date.now();
    await uploadFile(blob);
    const uploadTimeInSeconds = (Date.now() - uploadStartTime) / 1000;
    //console.log(`It took ${uploadTimeInSeconds} to upload ${lengthInBytes} bytes.`);

    let currentSpeed = ((lengthInBytes / uploadTimeInSeconds) * 8) / (10**6);
    measurements += 1;
    averageSpeed = averageSpeed - (averageSpeed / measurements) + (currentSpeed / measurements);

    averageSpeedSpan.innerHTML = `${averageSpeed.toFixed(2)} Mbps`;
    currentSpeedSpan.innerHTML = `${currentSpeed.toFixed(2)} Mbps`;

    elapsedTimeInSeconds = (Date.now() - startTime) / 1000;
  }

  running = false;
}

async function testUpload() {
  let blob = createNumberFile(1250001);
  const uploadId = makeid(20);
  uploadFile(blob, uploadId);

  // let int = setInterval(async () => {
  //   const progress = await progressPing(uploadId);
  //   console.log(progress);
  // }, 500);
  while(true) {
    let pingStart = Date.now();
    let { bytesRecvd, totalBytes } = await progressPing(uploadId);
    let pingTime = Date.now() - pingStart;

    if(bytesRecvd > 0) {
      document.getElementById("progressPercent").innerHTML = `${((bytesRecvd / totalBytes) * 100).toFixed(2)}%`;
      //console.log(typeof(bytesRecvd), typeof(totalBytes));

      if(bytesRecvd === totalBytes) {
        break;
      }
    }

    await sleep(50 - pingTime);
  }
}

async function sleep(ms) {
  if(ms < 0) {
    ms = 0;
  }
  return new Promise((accept) => {
    setTimeout(accept, ms);
  })
}

async function progressPing(uploadId) {
  //console.log("checking status of upload", uploadId);
  // URL of the endpoint
  const url = '/uploadProgress';

  // Preparing the request body as JSON
  const data = JSON.stringify({ uploadId });

  // Setting up the fetch options for a POST request
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data
  };

  try {
    // Using fetch to send the POST request and wait for the response
    const response = await fetch(url, fetchOptions);
    const jsonData = await response.json();  // Parsing the JSON response

    if (jsonData === -1) {
      console.error('Invalid or missing uploadId.');
      return null; // Return null to indicate an error
    } else {
      return jsonData; // Return the JSON data directly
    }
  } catch (error) {
    console.error('Error fetching upload progress:', error);
    return null; // Return null to indicate an error
  }
}

function createNumberFile(n) {
  // Determine the number of digits in the largest number, n
  const maxLength = n.toString().length;

  // Generate the content of the file
  let content = '';
  for (let i = 1; i <= n; i++) {
    // Pad each number with leading zeros to match the length of the largest number
    let paddedNumber = i.toString().padStart(maxLength, '0');

    // Add the padded number to the content string
    content += paddedNumber;

    // Add a space after each number except the last in a line or the last in the file
    if (i % 5 !== 0 && i !== n) {
      content += ' ';
    } 
    else {
      // Add a newline after every 5 numbers, except at the end of the file
      if (i !== n) {
        content += '\n';
      }
    }
  }

  //console.log(content);

  // Create a Blob from the content
  const blob = new Blob([content], { type: 'text/plain' });

  // Return the Blob
  return blob;
}

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

async function uploadFile(data, uploadId) {
  const formData  = new FormData();
  formData.append("file", data);

  if(uploadId === undefined) {
    uploadId = makeid(20);
  }
  
  try {
    const resp = await fetch("/upload", {
      method: "POST",
      body: data,
      headers: {
        uploadId
      }  
    });
    return uploadId;
  } catch (err) {
    console.log(err);
    return null;
  }
}