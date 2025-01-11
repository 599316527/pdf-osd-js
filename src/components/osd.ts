import { createNanoEvents } from 'nanoevents'

export interface OsdDetectResult {
  script: string;
  script_confidence: number;
  orientation_degrees: number;
  orientation_confidence: number;
}

interface RawOsdDetectResult {
  script_name: string;
  script_conf: number;
  orient_deg: number;
  orient_conf: number;
}

const emitter = createNanoEvents()

const worker = new Worker('osd.js');

worker.onmessage = (e) => {
  emitter.emit(e.data.type, e.data);
};

export const osdEngineReadyPromise = (() => {
  const { promise, resolve } = Promise.withResolvers<void>();
  const off = emitter.on('osdEngineReady', () => {
    off();
    resolve();
  });
  return promise;
})();

export async function detectOrientationScript(blob: Blob) {
  const data = await blob.arrayBuffer()
  const dataView = new Uint8Array(data)
  const { promise, resolve, reject } = Promise.withResolvers<OsdDetectResult>();
  const handleResponse = ({result, error}: {result?: RawOsdDetectResult, error?: Error}) => {
    off();
    if (error) {
      reject(error)
    } else {
      resolve(adaptOsdDetectResult(result!))
    }
  }
  const off = emitter.on('detectOrientationScriptResponse', handleResponse)
  worker.postMessage({ type: 'detectOrientationScript', data: dataView })
  return promise
}

function adaptOsdDetectResult(result: RawOsdDetectResult): OsdDetectResult {
  return {
    script: result.script_name,
    script_confidence: result.script_conf,
    orientation_degrees: result.orient_deg,
    orientation_confidence: result.orient_conf,
  }
}
