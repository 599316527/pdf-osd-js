// put the content of this file at the beginning of the generated osd.js file
// to communicate with the main thread

let onOsdEngineReady_;
const osdEngineReadyPromise = new Promise((resolve) => {
  onOsdEngineReady_ = resolve;
});
osdEngineReadyPromise.then(() => {
  console.log('osdEngineReady');
  postMessage({ type: 'osdEngineReady' });
});

var Module = {
  onOsdEngineReady: () => {
    onOsdEngineReady_?.();
    onOsdEngineReady_ = undefined;
  }
};

onmessage = (e) => {
  const { type, data } = e.data;
  switch (type) {
    case 'detectOrientationScript':
      detectOrientationScript(data);
      break;
  }
};

function detectOrientationScript(data) {
  const filename = Date.now() + '.jpg';
  FS.writeFile(filename, data);
  const resultStr = Module.detectOrientationScript(filename);
  FS.unlink(filename);

  let result;
  try {
    result = JSON.parse(resultStr);
  } catch (e) {
    postMessage({ type: 'detectOrientationScriptResponse', error: e });
    return;
  }
  postMessage({ type: 'detectOrientationScriptResponse', result });
}
