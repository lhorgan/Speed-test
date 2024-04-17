// https://medium.com/@2121997him/how-to-upload-files-using-only-nodejs-and-express-d7ead02c9ee5
let running = false;

async function testSpeed() {
  if(running === true) {
    return;
  }

  running = true;

  let elapsedTimeInSeconds = 0;
  const lengthInBytes = 100000;
  const blob = new Blob(["a".repeat(lengthInBytes)], { type: 'text/plain' });

  let startTime = Date.now();
  let averageSpeed = 0;
  let measurements = 0;

  const averageSpeedSpan = document.getElementById("average-speed");
  const currentSpeedSpan = document.getElementById("current-speed");

  while(elapsedTimeInSeconds < 10) {
    const uploadStartTime = Date.now();
    await uploadFile(blob);
    const uploadTimeInSeconds = (Date.now() - uploadStartTime) / 1000;
    console.log(`It took ${uploadTimeInSeconds} to upload ${lengthInBytes} bytes.`);

    let currentSpeed = ((lengthInBytes / uploadTimeInSeconds) * 8) / (10**6);
    measurements += 1;
    averageSpeed = averageSpeed - (averageSpeed / measurements) + (currentSpeed / measurements);

    averageSpeedSpan.innerHTML = `${averageSpeed.toFixed(2)} Mbps`;
    currentSpeedSpan.innerHTML = `${currentSpeed.toFixed(2)} Mbps`;

    elapsedTimeInSeconds = (Date.now() - startTime) / 1000;
  }

  running = false;
}

async function uploadFile(data) {
  try {
    const imageData = await fetch("/upload", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: data,
    });
  } catch (err) {
    console.log(err);
  }
}