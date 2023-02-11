const listeningUI = `<svg width="25" height="25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M15.737 15.504C17.894 14.04 19.5 11.782 19.5 9a7.5 7.5 0 0 0-15 0v9.683c0 2.075 1.675 3.817 3.75 3.817s3.133-1.216 3.623-1.875c.692-.929 1.955-3.823 3.864-5.12Z"></path>
<path d="M7.5 14.25V8.625C7.5 6.356 9.525 4.5 12 4.5s4.5 1.856 4.5 4.125"></path>
<path d="M7.5 11.204c1.172-.844 3.742-.703 3.742-.703 1.218 0 1.93 1.379 1.218 2.372 0 0-1.728 1.987-1.962 2.878"></path>
</svg>`;
const micUI = `<svg width="25" height="25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M9 21h6"></path>
<path d="M18 9.75v1.5c0 3.3-2.7 6-6 6s-6-2.7-6-6v-1.5"></path>
<path d="M12 17.25V21"></path>
<path d="M12 3a2.985 2.985 0 0 0-3 3v5.203c0 1.65 1.36 3.047 3 3.047s3-1.36 3-3.047V6c0-1.687-1.313-3-3-3Z"></path>
</svg>`;
var textPrompt = document.getElementById("text-prompt");
var microphoneButton = document.getElementById("microphone-button");
var recognition = new webkitSpeechRecognition() || SpeechRecognition;
var listening = false;// We can define here the behavior for the elements on the website...


microphoneButton.addEventListener("click", function () {
  if (listening) {
    microphoneButton.innerHTML = micUI;
    recognition.stop();
    listening = false;
  } else {
    microphoneButton.innerHTML = listeningUI;
    var speech = true;
    window.SpeechRecognition = window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;

    recognition.addEventListener("result", (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

      textPrompt.value = transcript;
      console.log(transcript);
    });

    if (speech == true) {
      recognition.start();
    }
    listening = true;
  }
});
// URL for POST requests
const dalleEndpoint = "https://api.openai.com/v1/images/generations";

// Fetch DOM elements
const reqButton = document.getElementById("button-request");
const reqStatus = document.getElementById("request-status");

// Attach click behavior to the button
reqButton.onclick = function () {
  reqButton.disabled = true;

  // Give some feedback to user
  reqStatus.innerHTML = "Request started...";

  // Fetch image request data
  const key = document.getElementById("api-key").value;
  const prompt = document.getElementById("text-prompt").value;
  const count = Number(document.getElementById("image-count").value);
  const radios = document.getElementsByName("image-size");
  let size;
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      size = Number(radios[i].value);
      break;
    }
  }

  // These can be handled by the server
  // // Some validity checks.
  // if (key.length == 0)
  // {
  //   reqStatus.innerHTML = "Please provide an API key!";
  //   return;
  // }
  // if (prompt.length == 0)
  // {
  //   reqStatus.innerHTML = "Please provide a text prompt!";
  //   return;
  // }
  // if (Number.isNaN(count))
  // {
  //   reqStatus.innerHTML = "Image count must be a valid number!";
  //   return;
  // }
  // if (!Number.isInteger(count))
  // {
  //   reqStatus.innerHTML = "Image count must be an integer!";
  //   return;
  // }
  // if (count < 1 || count > 4)
  // {
  //   reqStatus.innerHTML = "Image count must be between 1-4!";
  //   return;
  // }

  // Form the request body according to the API:
  // https://beta.openai.com/docs/api-reference/images/create
  const reqBody = {
    prompt: prompt,
    n: count,
    size: size + "x" + size,
    response_format: "url",
  };

  // Form the data for a POST request:
  const reqParams = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(reqBody),
  };

  // Use the Fetch API to do an async POST request to OpenAI:
  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
  fetch(dalleEndpoint, reqParams)
    .then((res) => res.json())
    .then((json) => addImages(json, prompt))
    .catch((error) => {
      reqStatus.innerHTML = error;
      reqButton.disabled = false;
    });
};

/**
 * Adds images on the page
 * @param {Obj} jsonData The Dall-E API response
 * @param {String} prompt The original prompt that generated the images
 */
function addImages(jsonData, prompt) {
  // console.log(jsonData);
  reqButton.disabled = false;

  // Handle a possible error response from the API
  if (jsonData.error) {
    reqStatus.innerHTML = "ERROR: " + jsonData.error.message;
    return;
  }

  // Parse the response object, deserialize the image data,
  // and attach new images to the page.
  const container = document.getElementById("image-container");
  for (let i = 0; i < jsonData.data.length; i++) {
    let imgData = jsonData.data[i];
    let img = document.createElement("img");
    img.src = imgData.url;
    img.alt = prompt;
    container.prepend(img);
  }

  reqStatus.innerHTML =
    jsonData.data.length + ' images received for "' + prompt + '"';
}

document
  .getElementById("download-button")
  .addEventListener("click", function () {
    var image = document.getElementById("image-container").firstChild;
    var link = document.createElement("a");
    link.download = "image.png";
    link.href = image.src;
    if (typeof link.download === "undefined") {
      window.open(image.src);
    } else {
      link.click();
    }
    document.getElementById("minimize-button").style.display = "block";
    document.getElementById("download-button").style.display = "none";
  });

document
  .getElementById("minimize-button")
  .addEventListener("click", function () {
    // Minimize the image
    document.getElementById("image-container").firstChild.style.display =
      "none";

    // Hide the minimize button
    document.getElementById("minimize-button").style.display = "none";
    document.getElementById("download-button").style.display = "block";

  });
